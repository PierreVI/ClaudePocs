import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createSpace } from '../store/useSpaces'
import { PhotoPicker } from '../components/PhotoPicker'
import type { SpaceType, SpacePhoto, WallSlot } from '../types/models'

const ROOM_SLOTS: { slot: WallSlot; label: string }[] = [
  { slot: 'north', label: 'Mur nord' },
  { slot: 'south', label: 'Mur sud' },
  { slot: 'east', label: 'Mur est' },
  { slot: 'west', label: 'Mur ouest' },
  { slot: 'floor', label: 'Sol' },
]

const GARDEN_SLOTS: { slot: WallSlot; label: string }[] = [
  { slot: 'floor', label: 'Vue du sol / pelouse' },
  { slot: 'reference', label: 'Photo de référence' },
]

export function NewSpacePage() {
  const navigate = useNavigate()
  const [type, setType] = useState<SpaceType>('room')
  const [name, setName] = useState('')
  const [width, setWidth] = useState(4)
  const [length, setLength] = useState(4)
  const [height, setHeight] = useState(2.5)
  const [photos, setPhotos] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const slots = type === 'room' ? ROOM_SLOTS : GARDEN_SLOTS

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    const photoList: SpacePhoto[] = Object.entries(photos).map(([slot, dataUrl]) => ({
      id: slot,
      slot: slot as WallSlot,
      dataUrl,
    }))
    const space = await createSpace({
      name: name.trim(),
      type,
      width,
      length,
      height: type === 'garden' ? 0 : height,
      photos: photoList,
    })
    setSaving(false)
    navigate(`/room/${space.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <h1 className="text-center text-xl font-extrabold">✨ Nouvelle parcelle</h1>

      <div className="village-card flex flex-col gap-3 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('room')}
            className={`village-btn flex-1 py-2 text-sm ${type === 'room' ? 'village-btn-primary' : 'village-btn-ghost'}`}
          >
            🏠 Pièce
          </button>
          <button
            type="button"
            onClick={() => setType('garden')}
            className={`village-btn flex-1 py-2 text-sm ${type === 'garden' ? 'village-btn-primary' : 'village-btn-ghost'}`}
          >
            🌳 Jardin
          </button>
        </div>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Nom
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === 'room' ? 'Salon' : 'Jardin arrière'}
            required
            className="rounded-lg border-2 border-[var(--wood)] bg-white px-3 py-2 text-base font-normal"
          />
        </label>

        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1 text-sm font-bold">
            Largeur (m)
            <input
              type="number"
              step={0.1}
              min={0.5}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="rounded-lg border-2 border-[var(--wood)] bg-white px-2 py-2 text-base font-normal"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold">
            Longueur (m)
            <input
              type="number"
              step={0.1}
              min={0.5}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="rounded-lg border-2 border-[var(--wood)] bg-white px-2 py-2 text-base font-normal"
            />
          </label>
          {type === 'room' && (
            <label className="flex flex-col gap-1 text-sm font-bold">
              Hauteur (m)
              <input
                type="number"
                step={0.1}
                min={1.5}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="rounded-lg border-2 border-[var(--wood)] bg-white px-2 py-2 text-base font-normal"
              />
            </label>
          )}
        </div>
      </div>

      <div className="village-card flex flex-col gap-3 p-4">
        <p className="text-sm font-bold">
          Photos {type === 'room' ? 'des murs et du sol' : 'du jardin'} (facultatif)
        </p>
        <p className="text-xs text-[var(--ink-soft)]">
          Elles seront projetées en 3D à l'échelle de tes dimensions pour reconstituer la pièce.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {slots.map(({ slot, label }) => (
            <PhotoPicker
              key={slot}
              label={label}
              value={photos[slot]}
              onChange={(dataUrl) => setPhotos((p) => ({ ...p, [slot]: dataUrl }))}
              onClear={() =>
                setPhotos((p) => {
                  const next = { ...p }
                  delete next[slot]
                  return next
                })
              }
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="village-btn village-btn-primary mx-auto w-fit px-8 py-3 text-base"
      >
        {saving ? 'Construction...' : '🏗️ Construire cette parcelle'}
      </button>
    </form>
  )
}
