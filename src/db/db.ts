import Dexie, { type EntityTable } from 'dexie'
import type { Space, CatalogItem, PlacedItem, BudgetTask, VillageSettings } from '../types/models'

const db = new Dexie('village-db') as Dexie & {
  spaces: EntityTable<Space, 'id'>
  catalogItems: EntityTable<CatalogItem, 'id'>
  placedItems: EntityTable<PlacedItem, 'id'>
  budgetTasks: EntityTable<BudgetTask, 'id'>
  settings: EntityTable<VillageSettings, 'id'>
}

db.version(1).stores({
  spaces: 'id, type, createdAt',
  catalogItems: 'id, category, createdAt',
  placedItems: 'id, spaceId, catalogItemId',
  budgetTasks: 'id, spaceId, order',
  settings: 'id',
})

export { db }
