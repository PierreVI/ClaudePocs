import { useRef, useState } from 'react'
import Papa from 'papaparse'
import {
  createBudgetTask,
  updateBudgetTask,
  setTaskStatus,
  deleteBudgetTask,
  reorderBudgetTask,
  importBudgetTasks,
} from '../store/useBudgetTasks'
import { NumberField } from './NumberField'
import type { BudgetTask, TaskStatus } from '../types/models'

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
}

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
}

const STATUS_ICON: Record<TaskStatus, string> = {
  todo: '⬜',
  in_progress: '🚧',
  done: '✅',
}

interface BudgetTaskListProps {
  tasks: BudgetTask[]
  spaceId: string | null
  title?: string
}

export function BudgetTaskList({ tasks, spaceId, title }: BudgetTaskListProps) {
  const [label, setLabel] = useState('')
  const [cost, setCost] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const sorted = [...tasks].sort((a, b) => a.order - b.order)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    await createBudgetTask({ spaceId, label: label.trim(), cost: cost ? Number(cost.replace(',', '.')) : 0 })
    setLabel('')
    setCost('')
  }

  async function handleCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
    const rows = parsed.data
      .map((row) => {
        const keys = Object.keys(row)
        const labelKey = keys.find((k) => /label|nom|désignation|designation|item/i.test(k)) ?? keys[0]
        const costKey = keys.find((k) => /prix|cost|montant|price|total/i.test(k)) ?? keys[1]
        const rawCost = costKey ? row[costKey] : '0'
        const cost = Number(String(rawCost ?? '0').replace(',', '.').replace(/[^0-9.-]/g, ''))
        return { label: (labelKey ? row[labelKey] : '')?.trim(), cost: isNaN(cost) ? 0 : cost }
      })
      .filter((r) => r.label)
    if (rows.length) await importBudgetTasks(spaceId, rows)
    e.target.value = ''
  }

  return (
    <div className="village-card flex flex-col gap-3 p-4">
      {title && <h2 className="text-base font-extrabold">{title}</h2>}

      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--ink-soft)]">Aucune étape pour l'instant.</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {sorted.map((task, idx) => (
            <li
              key={task.id}
              className="flex items-center gap-2 rounded-lg border border-[var(--parchment-dark)] bg-white/60 px-2 py-2"
            >
              <span className="w-5 text-center text-xs font-bold text-[var(--ink-soft)]">{idx + 1}</span>
              <button
                type="button"
                onClick={() => setTaskStatus(task.id, STATUS_CYCLE[task.status])}
                title={STATUS_LABEL[task.status]}
                className="text-lg"
              >
                {STATUS_ICON[task.status]}
              </button>
              <span
                className={`flex-1 text-sm ${task.status === 'done' ? 'text-[var(--ink-soft)] line-through' : ''}`}
              >
                {task.label}
              </span>
              <NumberField
                value={task.cost}
                onChange={(cost) => updateBudgetTask(task.id, { cost })}
                min={0}
                className="w-20 rounded border border-[var(--parchment-dark)] bg-white px-1 py-0.5 text-right text-xs"
              />
              <span className="text-xs">€</span>
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => reorderBudgetTask(task.id, -1, sorted)}
                  className="text-xs disabled:opacity-20"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={idx === sorted.length - 1}
                  onClick={() => reorderBudgetTask(task.id, 1, sorted)}
                  className="text-xs disabled:opacity-20"
                >
                  ▼
                </button>
              </div>
              <button
                type="button"
                onClick={() => deleteBudgetTask(task.id)}
                className="text-xs text-[var(--danger)]"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex: Peindre les murs"
          className="flex-1 rounded-lg border-2 border-[var(--wood)] bg-white px-2 py-2 text-sm"
        />
        <input
          type="text"
          inputMode="decimal"
          value={cost}
          onChange={(e) => {
            if (/^[0-9]*[.,]?[0-9]*$/.test(e.target.value)) setCost(e.target.value)
          }}
          placeholder="€"
          className="w-20 rounded-lg border-2 border-[var(--wood)] bg-white px-2 py-2 text-sm"
        />
        <button type="submit" className="village-btn village-btn-primary px-3 py-2 text-sm">
          ➕
        </button>
      </form>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="village-btn village-btn-wood self-start px-3 py-2 text-xs"
      >
        📄 Importer un devis (CSV)
      </button>
      <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsv} />
      <p className="text-[10px] text-[var(--ink-soft)]">
        Colonnes attendues : une colonne libellé/nom et une colonne prix/montant.
      </p>
    </div>
  )
}
