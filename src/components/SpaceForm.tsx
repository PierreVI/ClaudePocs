import { useState } from 'react'
import { PhotoPicker } from './PhotoPicker'
import { NumberField } from './NumberField'
import type { Space, SpaceType, SpacePhoto, WallSlot } from '../types/models'

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

export interface SpaceFormData {
  name: string
  type: SpaceType
  width: number
  length: number
  height: number
  photos: SpacePhoto[]
}

interface SpaceFormProps {
  title: string
  initial?: Space
  submitLabel: string
  savingLabel: string
  onSubmit: (data: SpaceFormData) => Promise<void>
  onCancel?: () => void
}

const numberFieldClass =
  'rounded-lg border-2 border-[var(--wood)] bg-white px-2 py-2 text-base font-normal'

export function SpaceForm({ title, initial, submitLabel, savingLabel, onSubmit, onCancel }: SpaceFormProps) {
  const [type, setType] = useState<SpaceType>(initial?.type ?? 'room')
  const [name, setName] = useState(initial?.name ?? '')
  const [width, setWidth] = useState(initial?.width ?? 4)
  const [length, setLength] = useState(initial?.length ?? 4)
  const [height, setHeight] = useState(initial?.height ?? 2.5)
  const [photos, setPhotos] = useState<Record<string, string>>(
    () => Object.fromEntries((initial?.photos ?? []).map((p) => [p.slot, p.dataUrl])),
  )
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
    await onSubmit({
      name: name.trim(),
      type,
      width,
      length,
      height: type === 'garden' ? 0 : height,
      photos: photoList,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <h1 className="text-center text-xl font-extrabold">{title}</h1>

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
            <NumberField value={width} onChange={setWidth} min={0.1} className={numberFieldClass} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-bold">
            Longueur (m)
            <NumberField value={length} onChange={setLength} min={0.1} className={numberFieldClass} />
          </label>
          {type === 'room' && (
            <label className="flex flex-col gap-1 text-sm font-bold">
              Hauteur (m)
              <NumberField value={height} onChange={setHeight} min={0.5} className={numberFieldClass} />
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

      <div className="mx-auto flex gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="village-btn village-btn-ghost px-6 py-3 text-base">
            Annuler
          </button>
        )}
        <button type="submit" disabled={saving} className="village-btn village-btn-primary px-8 py-3 text-base">
          {saving ? savingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}
