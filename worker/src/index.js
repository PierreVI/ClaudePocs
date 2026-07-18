// Small relay so the front-end never sees the Gemini API key: the browser
// posts a photo + prompt here, this Worker calls Gemini with the key kept
// as a Cloudflare secret, and forwards back the generated image.

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function json(body, status, env) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(env), 'Content-Type': 'application/json' },
  })
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) })
    }

    if (request.method !== 'POST') {
      return json({ error: 'Méthode non autorisée' }, 405, env)
    }

    if (!env.GEMINI_API_KEY) {
      return json({ error: "Le Worker n'a pas de clé GEMINI_API_KEY configurée" }, 500, env)
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json({ error: 'Corps de requête JSON invalide' }, 400, env)
    }

    const { prompt, imageBase64, mimeType } = body
    if (!prompt || !imageBase64 || !mimeType) {
      return json({ error: 'prompt, imageBase64 et mimeType sont requis' }, 400, env)
    }

    const model = env.GEMINI_MODEL || 'gemini-2.5-flash-image'

    let geminiRes
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }, { inlineData: { mimeType, data: imageBase64 } }],
              },
            ],
            generationConfig: { responseModalities: ['IMAGE'] },
          }),
        },
      )
    } catch {
      return json({ error: 'Impossible de contacter Gemini' }, 502, env)
    }

    if (!geminiRes.ok) {
      const detail = await geminiRes.text()
      return json({ error: `Gemini a renvoyé une erreur (${geminiRes.status})`, detail }, 502, env)
    }

    const data = await geminiRes.json()
    const parts = data?.candidates?.[0]?.content?.parts || []
    const imagePart = parts.find((p) => p.inlineData)

    if (!imagePart) {
      return json({ error: "Gemini n'a renvoyé aucune image (prompt refusé ?)", detail: data }, 502, env)
    }

    return json(
      { mimeType: imagePart.inlineData.mimeType, imageBase64: imagePart.inlineData.data },
      200,
      env,
    )
  },
}
