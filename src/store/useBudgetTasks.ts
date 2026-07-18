import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuid } from 'uuid'
import { db } from '../db/db'
import type { BudgetTask, TaskStatus } from '../types/models'

export function useBudgetTasks(spaceId?: string | null) {
  const tasks = useLiveQuery(async () => {
    const all = await db.budgetTasks.orderBy('order').toArray()
    if (spaceId === undefined) return all
    return all.filter((t) => t.spaceId === spaceId)
  }, [spaceId])
  return { tasks: tasks ?? [], loaded: tasks !== undefined }
}

export function useAllBudgetTasks() {
  const tasks = useLiveQuery(() => db.budgetTasks.orderBy('order').toArray(), [])
  return { tasks: tasks ?? [], loaded: tasks !== undefined }
}

export function totalCost(tasks: BudgetTask[]) {
  return tasks.reduce((sum, t) => sum + (t.cost || 0), 0)
}

export async function createBudgetTask(input: {
  spaceId: string | null
  label: string
  cost: number
  category?: string
}) {
  const existing = await db.budgetTasks.toArray()
  const maxOrder = existing.reduce((m, t) => Math.max(m, t.order), -1)
  const task: BudgetTask = {
    id: uuid(),
    spaceId: input.spaceId,
    label: input.label,
    cost: input.cost,
    category: input.category,
    order: maxOrder + 1,
    status: 'todo',
    createdAt: Date.now(),
  }
  await db.budgetTasks.add(task)
  return task
}

export async function importBudgetTasks(
  spaceId: string | null,
  rows: { label: string; cost: number; category?: string }[],
) {
  const existing = await db.budgetTasks.toArray()
  let order = existing.reduce((m, t) => Math.max(m, t.order), -1)
  const tasks: BudgetTask[] = rows.map((r) => {
    order += 1
    return {
      id: uuid(),
      spaceId,
      label: r.label,
      cost: r.cost,
      category: r.category,
      order,
      status: 'todo',
      createdAt: Date.now(),
    }
  })
  await db.budgetTasks.bulkAdd(tasks)
  return tasks
}

export async function updateBudgetTask(id: string, changes: Partial<BudgetTask>) {
  await db.budgetTasks.update(id, changes)
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  await db.budgetTasks.update(id, { status })
}

export async function deleteBudgetTask(id: string) {
  await db.budgetTasks.delete(id)
}

export async function reorderBudgetTask(id: string, direction: -1 | 1, siblings: BudgetTask[]) {
  const sorted = [...siblings].sort((a, b) => a.order - b.order)
  const idx = sorted.findIndex((t) => t.id === id)
  const swapIdx = idx + direction
  if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return
  const a = sorted[idx]
  const b = sorted[swapIdx]
  await db.transaction('rw', db.budgetTasks, async () => {
    await db.budgetTasks.update(a.id, { order: b.order })
    await db.budgetTasks.update(b.id, { order: a.order })
  })
}
