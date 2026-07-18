import { dataUrlToBase64, base64ToDataUrl } from '../utils/files'

interface GenerateRoomRenderInput {
  workerUrl: string
  sourceDataUrl: string
  prompt: string
}

export async function generateRoomRender({ workerUrl, sourceDataUrl, prompt }: GenerateRoomRenderInput): Promise<string> {
  const { mimeType, base64 } = dataUrlToBase64(sourceDataUrl)

  const res = await fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageBase64: base64, mimeType }),
  })

  if (!res.ok) {
    let message = `Le service de rénovation a répondu une erreur (${res.status})`
    try {
      const err = await res.json()
      if (err.error) message = err.error
    } catch {
      /* réponse non-JSON, on garde le message par défaut */
    }
    throw new Error(message)
  }

  const data = await res.json()
  if (!data.imageBase64) throw new Error('Le service de rénovation n\'a renvoyé aucune image.')
  return base64ToDataUrl(data.imageBase64, data.mimeType || 'image/png')
}
