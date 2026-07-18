import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSpace, deleteSpace } from '../store/useSpaces'
import { useCatalog } from '../store/useCatalog'
import { usePlacedItems, placeItem, updatePlacedItem, removePlacedItem } from '../store/usePlacedItems'
import { useBudgetTasks, totalCost } from '../store/useBudgetTasks'
import { RoomScene3D } from '../three/RoomScene3D'
import { BudgetTaskList } from '../components/BudgetTaskList'

type Tab = '3d' | 'meubles' | 'budget'

export function SpacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { space, loaded: spaceLoaded } = useSpace(id)
  const { items: catalog } = useCatalog()
  const { items: placedItems } = usePlacedItems(id)
  const { tasks } = useBudgetTasks(id)
  const [tab, setTab] = useState<Tab>('3d')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const catalogById = useMemo(() => new Map(catalog.map((c) => [c.id, c])), [catalog])
  const selected = placedItems.find((p) => p.id === selectedId) ?? null
  const selectedCatalogItem = selected ? catalogById.get(selected.catalogItemId) : undefined

  if (!spaceLoaded) {
    return <p className="p-4 text-center text-sm">Chargement...</p>
  }
  if (!space) {
    return (
      <div className="flex flex-col items-center gap-3 p-6">
        <p>Cette parcelle n'existe plus.</p>
        <Link to="/" className="village-btn village-btn-primary px-4 py-2 text-sm">
          Retour au village
        </Link>
      </div>
    )
  }

  async function handleDelete() {
    if (!id || !space) return
    if (!confirm(`Supprimer "${space.name}" et tout son contenu ?`)) return
    await deleteSpace(id)
    navigate('/')
  }

  async function handlePlace(catalogItemId: string) {
    if (!id || !space) return
    const placed = await placeItem({
      spaceId: id,
      catalogItemId,
      x: space.width / 2,
      z: space.length / 2,
    })
    setSelectedId(placed.id)
    setTab('3d')
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <header className="flex items-center gap-2">
        <Link to="/" className="text-xl">
          ⬅️
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-extrabold">
            {space.type === 'garden' ? '🌳' : '🏠'} {space.name}
          </h1>
          <p className="text-xs text-[var(--ink-soft)]">
            {space.width} × {space.length} m{space.type === 'room' ? ` · hauteur ${space.height} m` : ''}
          </p>
        </div>
        <Link to={`/room/${id}/edit`} className="text-lg" title="Modifier">
          ✏️
        </Link>
        <button onClick={handleDelete} className="text-lg" title="Supprimer">
          🗑️
        </button>
      </header>

      <div className="flex gap-2">
        {(
          [
            ['3d', '🧭 Vue 3D'],
            ['meubles', '🛋️ Meubles'],
            ['budget', '💰 Étapes'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`village-btn flex-1 py-2 text-xs ${tab === key ? 'village-btn-primary' : 'village-btn-ghost'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === '3d' && (
        <>
          <div className="village-card h-80 w-full overflow-hidden p-1">
            <RoomScene3D
              space={space}
              placedItems={placedItems}
              catalogById={catalogById}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <p className="text-center text-[11px] text-[var(--ink-soft)]">
            Glisse pour tourner, pince pour zoomer. Touche un objet pour le sélectionner.
          </p>

          {selected && selectedCatalogItem && (
            <div className="village-card flex flex-col gap-2 p-4">
              <p className="text-sm font-bold">
                🎯 {selectedCatalogItem.name} — facteur ×{selected.scaleFactor.toFixed(2)}
              </p>
              <label className="flex flex-col gap-1 text-xs font-bold">
                Taille (agrandir / rétrécir)
                <input
                  type="range"
                  min={0.2}
                  max={3}
                  step={0.05}
                  value={selected.scaleFactor}
                  onChange={(e) => updatePlacedItem(selected.id, { scaleFactor: Number(e.target.value) })}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold">
                Position X
                <input
                  type="range"
                  min={0}
                  max={space.width}
                  step={0.05}
                  value={selected.x}
                  onChange={(e) => updatePlacedItem(selected.id, { x: Number(e.target.value) })}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold">
                Position Z (profondeur)
                <input
                  type="range"
                  min={0}
                  max={space.length}
                  step={0.05}
                  value={selected.z}
                  onChange={(e) => updatePlacedItem(selected.id, { z: Number(e.target.value) })}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-bold">
                Rotation
                <input
                  type="range"
                  min={0}
                  max={Math.PI * 2}
                  step={0.05}
                  value={selected.rotationY}
                  onChange={(e) => updatePlacedItem(selected.id, { rotationY: Number(e.target.value) })}
                />
              </label>
              <button
                onClick={async () => {
                  await removePlacedItem(selected.id)
                  setSelectedId(null)
                }}
                className="village-btn village-btn-ghost self-start px-3 py-1 text-xs text-[var(--danger)]"
              >
                Retirer de la pièce
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'meubles' && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--ink-soft)]">
            Choisis un objet de ton catalogue à placer dans cette parcelle. Tu pourras ensuite ajuster sa taille et sa
            position dans l'onglet Vue 3D.
          </p>
          {catalog.length === 0 ? (
            <div className="village-card p-4 text-center text-sm">
              Ton catalogue est vide.{' '}
              <Link to="/catalog" className="font-bold underline">
                Ajoute des meubles ou plantes
              </Link>{' '}
              depuis une photo de boutique.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {catalog.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handlePlace(c.id)}
                  className="village-card flex flex-col items-center gap-1 p-3 text-center"
                >
                  <img src={c.photoDataUrl} alt={c.name} className="h-20 w-20 rounded-lg object-cover" />
                  <span className="text-xs font-bold">{c.name}</span>
                  <span className="village-btn village-btn-primary mt-1 px-3 py-1 text-[11px]">Placer ici</span>
                </button>
              ))}
            </div>
          )}

          {placedItems.length > 0 && (
            <div className="village-card flex flex-col gap-2 p-4">
              <p className="text-sm font-bold">Déjà placés ({placedItems.length})</p>
              <ul className="flex flex-col gap-1 text-sm">
                {placedItems.map((p) => {
                  const c = catalogById.get(p.catalogItemId)
                  if (!c) return null
                  return (
                    <li key={p.id} className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedId(p.id)
                          setTab('3d')
                        }}
                        className="underline"
                      >
                        {c.name}
                      </button>
                      <button onClick={() => removePlacedItem(p.id)} className="text-xs text-[var(--danger)]">
                        retirer
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === 'budget' && (
        <div className="flex flex-col gap-3">
          <div className="village-card p-3 text-center">
            <p className="text-sm text-[var(--ink-soft)]">Coût prévisionnel de cette parcelle</p>
            <p className="text-xl font-extrabold text-[var(--leaf-dark)]">
              {totalCost(tasks).toLocaleString('fr-FR')} €
            </p>
          </div>
          <BudgetTaskList tasks={tasks} spaceId={id ?? null} title="Séquencement des travaux" />
        </div>
      )}
    </div>
  )
}
