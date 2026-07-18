import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

const SETTINGS_ID = 'singleton' as const

export function useVillageSettings() {
  const settings = useLiveQuery(() => db.settings.get(SETTINGS_ID), [])

  async function setTotalBudget(totalBudget: number) {
    const current = await db.settings.get(SETTINGS_ID)
    await db.settings.put({ id: SETTINGS_ID, totalBudget, renderWorkerUrl: current?.renderWorkerUrl })
  }

  async function setRenderWorkerUrl(renderWorkerUrl: string) {
    const current = await db.settings.get(SETTINGS_ID)
    await db.settings.put({ id: SETTINGS_ID, totalBudget: current?.totalBudget ?? 0, renderWorkerUrl })
  }

  return {
    totalBudget: settings?.totalBudget ?? 0,
    renderWorkerUrl: settings?.renderWorkerUrl ?? '',
    loaded: settings !== undefined,
    setTotalBudget,
    setRenderWorkerUrl,
  }
}
