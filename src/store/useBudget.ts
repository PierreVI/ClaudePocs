import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'

const SETTINGS_ID = 'singleton' as const

export function useVillageSettings() {
  const settings = useLiveQuery(() => db.settings.get(SETTINGS_ID), [])

  async function setTotalBudget(totalBudget: number) {
    await db.settings.put({ id: SETTINGS_ID, totalBudget })
  }

  return {
    totalBudget: settings?.totalBudget ?? 0,
    loaded: settings !== undefined,
    setTotalBudget,
  }
}
