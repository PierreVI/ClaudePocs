import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useVillageSettings } from '../store/useBudget'
import { useRenders, saveRender, deleteRender } from '../store/useRenders'
import { setSpacePhoto } from '../store/useSpaces'
import { generateRoomRender } from '../ai/renderClient'
import type { RoomRender, Space, WallSlot } from '../types/models'

const SLOT_LABEL: Record<WallSlot, string> = {
  north: 'Mur nord',
  south: 'Mur sud',
  east: 'Mur est',
  west: 'Mur ouest',
  floor: 'Sol',
  reference: 'Photo de référence',
}

export function RenovationPanel({ space }: { space: Space }) {
  const { renderWorkerUrl, loaded } = useVillageSettings()
  const { renders } = useRenders(space.id)
  const [slot, setSlot] = useState<WallSlot | null>(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ dataUrl: string; slot: WallSlot } | null>(null)

  if (!loaded) {
    return <p className="text-center text-sm">Chargement...</p>
  }

  if (!renderWorkerUrl) {
    return (
      <div className="village-card p-4 text-center text-sm">
        Configure d'abord ton service de rénovation IA dans les{' '}
        <Link to="/settings" className="font-bold underline">
          réglages ⚙️
        </Link>
        .
      </div>
    )
  }

  if (space.photos.length === 0) {
    return (
      <div className="village-card p-4 text-center text-sm">
        Ajoute d'abord au moins une photo à cette parcelle (
        <Link to={`/room/${space.id}/edit`} className="font-bold underline">
          onglet Modifier ✏️
        </Link>
        ) pour pouvoir la faire améliorer par l'IA.
      </div>
    )
  }

  const sourcePhoto = space.photos.find((p) => p.slot === slot) ?? space.photos[0]

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const dataUrl = await generateRoomRender({
        workerUrl: renderWorkerUrl,
        sourceDataUrl: sourcePhoto.dataUrl,
        prompt: prompt.trim(),
      })
      await saveRender({ spaceId: space.id, sourceSlot: sourcePhoto.slot, prompt: prompt.trim(), dataUrl })
      setResult({ dataUrl, slot: sourcePhoto.slot })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="village-card flex flex-col gap-3 p-4">
        <p className="text-sm font-bold">Choisis la photo à améliorer</p>
        <div className="flex flex-wrap gap-2">
          {space.photos.map((p) => (
            <button
              key={p.slot}
              type="button"
              onClick={() => setSlot(p.slot)}
              className={`overflow-hidden rounded-lg border-2 ${
                sourcePhoto.slot === p.slot ? 'border-[var(--leaf-dark)]' : 'border-transparent'
              }`}
              title={SLOT_LABEL[p.slot]}
            >
              <img src={p.dataUrl} alt={SLOT_LABEL[p.slot]} className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>
        <p className="text-center text-xs font-bold text-[var(--ink-soft)]">{SLOT_LABEL[sourcePhoto.slot]}</p>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Décris l'amélioration souhaitée
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex : repeindre les murs en gris clair, poser un parquet chêne, ambiance lumineuse et moderne"
            rows={3}
            className="rounded-lg border-2 border-[var(--wood)] bg-white px-3 py-2 text-sm font-normal"
          />
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="village-btn village-btn-primary self-center px-6 py-2 text-sm"
        >
          {loading ? 'Génération en cours...' : '✨ Générer la projection'}
        </button>

        {error && <p className="text-center text-xs text-[var(--danger)]">{error}</p>}
      </div>

      {result && (
        <div className="village-card flex flex-col gap-2 p-4">
          <p className="text-center text-sm font-bold">Avant / Après</p>
          <div className="flex gap-2">
            <img src={sourcePhoto.dataUrl} alt="avant" className="h-32 w-1/2 rounded-lg object-cover" />
            <img src={result.dataUrl} alt="après" className="h-32 w-1/2 rounded-lg object-cover" />
          </div>
          <button
            type="button"
            onClick={() => setSpacePhoto(space.id, result.slot, result.dataUrl)}
            className="village-btn village-btn-primary self-center px-4 py-2 text-xs"
          >
            🖼️ Utiliser cette version dans la pièce
          </button>
        </div>
      )}

      {renders.length > 0 && (
        <div className="village-card flex flex-col gap-2 p-4">
          <p className="text-sm font-bold">Historique des projections</p>
          <div className="flex flex-col gap-2">
            {renders.map((r) => (
              <RenderHistoryRow key={r.id} render={r} spaceId={space.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RenderHistoryRow({ render, spaceId }: { render: RoomRender; spaceId: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--parchment-dark)] bg-white/60 p-2">
      <img src={render.dataUrl} alt={render.prompt} className="h-14 w-14 rounded object-cover" />
      <div className="flex-1 text-xs">
        <p className="line-clamp-2">{render.prompt}</p>
        <p className="text-[var(--ink-soft)]">{SLOT_LABEL[render.sourceSlot]}</p>
      </div>
      <button
        type="button"
        onClick={() => setSpacePhoto(spaceId, render.sourceSlot, render.dataUrl)}
        className="text-xs font-bold underline"
      >
        Appliquer
      </button>
      <button type="button" onClick={() => deleteRender(render.id)} className="text-xs text-[var(--danger)]">
        ✕
      </button>
    </div>
  )
}
