import { useState } from 'react'
import { useCatalog, createCatalogItem, deleteCatalogItem } from '../store/useCatalog'
import { PhotoPicker } from '../components/PhotoPicker'
import type { CatalogCategory } from '../types/models'

export function CatalogPage() {
  const { items, loaded } = useCatalog()
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-center text-xl font-extrabold">🛋️ Catalogue</h1>
      <p className="text-center text-sm text-[var(--ink-soft)]">
        Ajoute des meubles ou plantes repérés dans une boutique en ligne : une photo, ses dimensions réelles et son prix.
        Tu pourras ensuite les placer dans tes pièces et ajuster leur taille.
      </p>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="village-btn village-btn-primary mx-auto w-fit px-6 py-3 text-base"
        >
          ➕ Ajouter un objet
        </button>
      ) : (
        <CatalogItemForm onDone={() => setShowForm(false)} />
      )}

      {!loaded ? (
        <p className="text-center text-sm">Chargement...</p>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-[var(--ink-soft)]">Ton catalogue est vide.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div key={item.id} className="village-card flex flex-col items-center gap-1 p-3">
              <img
                src={item.photoDataUrl}
                alt={item.name}
                className="h-24 w-24 rounded-lg object-cover"
              />
              <p className="text-sm font-bold">{item.name}</p>
              <p className="text-xs text-[var(--ink-soft)]">
                {item.realWidth}×{item.realDepth}×{item.realHeight} m
              </p>
              {item.price !== undefined && (
                <p className="text-xs font-bold text-[var(--leaf-dark)]">
                  {item.price.toLocaleString('fr-FR')} €
                </p>
              )}
              <button
                onClick={() => deleteCatalogItem(item.id)}
                className="mt-1 text-[10px] text-[var(--danger)] underline"
              >
                supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CatalogItemForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<CatalogCategory>('furniture')
  const [photo, setPhoto] = useState<string>('')
  const [w, setW] = useState(0.6)
  const [d, setD] = useState(0.6)
  const [h, setH] = useState(0.8)
  const [price, setPrice] = useState<string>('')
  const [sourceUrl, setSourceUrl] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !photo) return
    await createCatalogItem({
      name: name.trim(),
      category,
      photoDataUrl: photo,
      realWidth: w,
      realDepth: d,
      realHeight: h,
      price: price ? Number(price) : undefined,
      sourceUrl: sourceUrl || undefined,
    })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="village-card flex flex-col gap-3 p-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setCategory('furniture')}
          className={`village-btn flex-1 py-2 text-sm ${category === 'furniture' ? 'village-btn-primary' : 'village-btn-ghost'}`}
        >
          🪑 Meuble
        </button>
        <button
          type="button"
          onClick={() => setCategory('plant')}
          className={`village-btn flex-1 py-2 text-sm ${category === 'plant' ? 'village-btn-primary' : 'village-btn-ghost'}`}
        >
          🪴 Plante
        </button>
      </div>

      <div className="mx-auto">
        <PhotoPicker label="Photo du produit" value={photo} onChange={setPhoto} onClear={() => setPhoto('')} />
      </div>

      <label className="flex flex-col gap-1 text-sm font-bold">
        Nom
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Canapé 3 places gris"
          className="rounded-lg border-2 border-[var(--wood)] bg-white px-3 py-2 text-base font-normal"
        />
      </label>

      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 text-xs font-bold">
          Largeur (m)
          <input
            type="number"
            step={0.01}
            min={0.01}
            value={w}
            onChange={(e) => setW(Number(e.target.value))}
            className="rounded-lg border-2 border-[var(--wood)] bg-white px-2 py-2 text-sm font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          Profondeur (m)
          <input
            type="number"
            step={0.01}
            min={0.01}
            value={d}
            onChange={(e) => setD(Number(e.target.value))}
            className="rounded-lg border-2 border-[var(--wood)] bg-white px-2 py-2 text-sm font-normal"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-bold">
          Hauteur (m)
          <input
            type="number"
            step={0.01}
            min={0.01}
            value={h}
            onChange={(e) => setH(Number(e.target.value))}
            className="rounded-lg border-2 border-[var(--wood)] bg-white px-2 py-2 text-sm font-normal"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-bold">
        Prix (€)
        <input
          type="number"
          step={0.01}
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="199"
          className="rounded-lg border-2 border-[var(--wood)] bg-white px-3 py-2 text-base font-normal"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold">
        Lien boutique (facultatif)
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
          className="rounded-lg border-2 border-[var(--wood)] bg-white px-3 py-2 text-base font-normal"
        />
      </label>

      <div className="flex gap-2">
        <button type="button" onClick={onDone} className="village-btn village-btn-ghost flex-1 py-2 text-sm">
          Annuler
        </button>
        <button type="submit" className="village-btn village-btn-primary flex-1 py-2 text-sm">
          Ajouter
        </button>
      </div>
    </form>
  )
}
