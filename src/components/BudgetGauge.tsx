interface BudgetGaugeProps {
  spent: number
  total: number
  compact?: boolean
}

export function BudgetGauge({ spent, total, compact }: BudgetGaugeProps) {
  const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0
  const over = total > 0 && spent > total
  return (
    <div className={compact ? 'w-full' : 'village-card w-full p-3'}>
      <div className="mb-1 flex items-center justify-between text-sm font-bold text-[var(--ink)]">
        <span>💰 Récolte du budget</span>
        <span className={over ? 'text-[var(--danger)]' : ''}>
          {spent.toLocaleString('fr-FR')} € / {total.toLocaleString('fr-FR')} €
        </span>
      </div>
      <div className="gauge-track h-4 w-full">
        <div
          className="gauge-fill h-full"
          style={{ width: `${pct}%`, background: over ? 'var(--danger)' : undefined }}
        />
      </div>
    </div>
  )
}
