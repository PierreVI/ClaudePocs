import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSpaces, moveSpaceOnMap } from '../store/useSpaces'
import { useAllBudgetTasks, totalCost } from '../store/useBudgetTasks'
import { useVillageSettings } from '../store/useBudget'
import { BudgetGauge } from '../components/BudgetGauge'
import { NumberField } from '../components/NumberField'
import { tileColorFor } from '../utils/theme'
import type { Space } from '../types/models'

const GRID_COLS = 4
const CELL = 72

export function VillagePage() {
  const { spaces, loaded } = useSpaces()
  const { tasks } = useAllBudgetTasks()
  const { totalBudget, setTotalBudget } = useVillageSettings()
  const [editingBudget, setEditingBudget] = useState(false)
  const [draftBudget, setDraftBudget] = useState(totalBudget)
  const [dragId, setDragId] = useState<string | null>(null)

  const rows = spaces.length > 0 ? Math.max(...spaces.map((s) => s.mapY)) + 2 : 3

  function occupied(x: number, y: number, excludeId?: string) {
    return spaces.some((s) => s.id !== excludeId && s.mapX === x && s.mapY === y)
  }

  async function handleDrop(x: number, y: number) {
    if (!dragId) return
    if (occupied(x, y, dragId)) return
    await moveSpaceOnMap(dragId, x, y)
    setDragId(null)
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-center text-2xl font-extrabold text-[var(--ink)] drop-shadow-sm">
          🏡 Mon Village
        </h1>
        {editingBudget ? (
          <div className="village-card flex items-center gap-2 p-3">
            <span className="text-sm font-bold">Budget total récolté :</span>
            <NumberField
              value={draftBudget}
              onChange={setDraftBudget}
              min={0}
              className="w-24 rounded-lg border-2 border-[var(--wood)] bg-white px-2 py-1 text-sm"
            />
            <span>€</span>
            <button
              className="village-btn village-btn-primary ml-auto px-3 py-1 text-sm"
              onClick={async () => {
                await setTotalBudget(draftBudget)
                setEditingBudget(false)
              }}
            >
              OK
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setDraftBudget(totalBudget)
              setEditingBudget(true)
            }}
            className="text-left"
          >
            <BudgetGauge spent={totalCost(tasks)} total={totalBudget} />
          </button>
        )}
      </header>

      <p className="text-center text-sm text-[var(--ink-soft)]">
        Glisse-dépose tes pièces et ton jardin pour assembler ton village. Touche une parcelle pour l'explorer en 3D.
      </p>

      {!loaded ? (
        <p className="text-center text-sm">Chargement...</p>
      ) : (
        <div
          className="village-card mx-auto grid w-fit max-w-full gap-1 overflow-x-auto p-3"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL}px)`,
            gridTemplateRows: `repeat(${rows}, ${CELL}px)`,
          }}
        >
          {Array.from({ length: GRID_COLS * rows }).map((_, i) => {
            const x = i % GRID_COLS
            const y = Math.floor(i / GRID_COLS)
            const space = spaces.find((s) => s.mapX === x && s.mapY === y)
            return (
              <div
                key={i}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(x, y)}
                className="flex items-center justify-center rounded-lg border border-[var(--parchment-dark)] bg-[repeating-conic-gradient(#c9e8b8_0%_25%,#bfe0ab_0%_50%)] bg-[length:16px_16px]"
              >
                {space && (
                  <VillageTile
                    space={space}
                    draggable
                    onDragStart={() => setDragId(space.id)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <Link
        to="/room/new"
        className="village-btn village-btn-primary mx-auto flex w-fit items-center gap-2 px-6 py-3 text-base"
      >
        ➕ Ajouter une pièce ou un jardin
      </Link>

      {loaded && spaces.length === 0 && (
        <p className="text-center text-sm text-[var(--ink-soft)]">
          Ton village est vide pour l'instant. Ajoute ta première pièce pour commencer !
        </p>
      )}
    </div>
  )
}

function VillageTile({
  space,
  draggable,
  onDragStart,
}: {
  space: Space
  draggable?: boolean
  onDragStart?: () => void
}) {
  const colors = tileColorFor(space.colorSeed)
  const icon = space.type === 'garden' ? '🌳' : '🏠'
  return (
    <Link
      to={`/room/${space.id}`}
      draggable={draggable}
      onDragStart={onDragStart}
      className="flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg text-center shadow-inner transition-transform active:scale-95"
      style={{ background: colors.base, border: `3px solid ${colors.roof}` }}
    >
      <span className="text-2xl leading-none">{icon}</span>
      <span className="max-w-[70px] truncate px-1 text-[10px] font-bold text-white drop-shadow">
        {space.name}
      </span>
    </Link>
  )
}
