import { useAllBudgetTasks, totalCost } from '../store/useBudgetTasks'
import { useVillageSettings } from '../store/useBudget'
import { useSpaces } from '../store/useSpaces'
import { BudgetGauge } from '../components/BudgetGauge'
import { BudgetTaskList } from '../components/BudgetTaskList'

export function BudgetPage() {
  const { tasks } = useAllBudgetTasks()
  const { totalBudget } = useVillageSettings()
  const { spaces } = useSpaces()

  const globalTasks = tasks.filter((t) => t.spaceId === null)
  const doneCost = totalCost(tasks.filter((t) => t.status === 'done'))
  const remaining = Math.max(0, totalBudget - totalCost(tasks))

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-center text-xl font-extrabold">💰 Budget du village</h1>

      <BudgetGauge spent={totalCost(tasks)} total={totalBudget} />

      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <div className="village-card p-3">
          <p className="font-bold text-[var(--leaf-dark)]">{doneCost.toLocaleString('fr-FR')} €</p>
          <p className="text-[var(--ink-soft)]">déjà dépensé (étapes terminées)</p>
        </div>
        <div className="village-card p-3">
          <p className="font-bold">{remaining.toLocaleString('fr-FR')} €</p>
          <p className="text-[var(--ink-soft)]">restant sur ta récolte</p>
        </div>
      </div>

      <p className="text-center text-sm text-[var(--ink-soft)]">
        Retrouve ici toutes les étapes et coûts prévisionnels, pièce par pièce, plus les dépenses générales du village.
      </p>

      <BudgetTaskList tasks={globalTasks} spaceId={null} title="🌍 Étapes générales du village" />

      {spaces.map((space) => {
        const spaceTasks = tasks.filter((t) => t.spaceId === space.id)
        if (spaceTasks.length === 0) return null
        return (
          <div key={space.id}>
            <BudgetTaskList
              tasks={spaceTasks}
              spaceId={space.id}
              title={`${space.type === 'garden' ? '🌳' : '🏠'} ${space.name}`}
            />
          </div>
        )
      })}
    </div>
  )
}
