import { useEffect, useState } from 'react'
import { useVillageSettings } from '../store/useBudget'

export function SettingsPage() {
  const { renderWorkerUrl, setRenderWorkerUrl, loaded } = useVillageSettings()
  const [draft, setDraft] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (loaded && !initialized) {
      setDraft(renderWorkerUrl)
      setInitialized(true)
    }
  }, [loaded, renderWorkerUrl, initialized])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await setRenderWorkerUrl(draft.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-center text-xl font-extrabold">⚙️ Réglages</h1>

      <form onSubmit={handleSave} className="village-card flex flex-col gap-3 p-4">
        <p className="text-sm font-bold">✨ Rénovation IA</p>
        <p className="text-xs text-[var(--ink-soft)]">
          L'app appelle un petit service relais qui garde ta clé Gemini côté serveur — colle ici l'adresse de ce
          service une fois déployé.
        </p>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="https://village-ai-render.ton-compte.workers.dev"
          className="rounded-lg border-2 border-[var(--wood)] bg-white px-3 py-2 text-sm"
        />
        <button type="submit" className="village-btn village-btn-primary self-center px-6 py-2 text-sm">
          {saved ? '✅ Enregistré' : 'Enregistrer'}
        </button>
        <p className="text-[10px] text-[var(--ink-soft)]">
          Voir le dossier <code>worker/</code> du projet (fichier <code>worker/README.md</code>) pour le déployer
          gratuitement en quelques minutes sur Cloudflare Workers.
        </p>
      </form>
    </div>
  )
}
