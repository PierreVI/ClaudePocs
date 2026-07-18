import Dexie, { type EntityTable } from 'dexie'
import type { Space, CatalogItem, PlacedItem, BudgetTask, VillageSettings, RoomRender } from '../types/models'

const db = new Dexie('village-db') as Dexie & {
  spaces: EntityTable<Space, 'id'>
  catalogItems: EntityTable<CatalogItem, 'id'>
  placedItems: EntityTable<PlacedItem, 'id'>
  budgetTasks: EntityTable<BudgetTask, 'id'>
  settings: EntityTable<VillageSettings, 'id'>
  renders: EntityTable<RoomRender, 'id'>
}

db.version(1).stores({
  spaces: 'id, type, createdAt',
  catalogItems: 'id, category, createdAt',
  placedItems: 'id, spaceId, catalogItemId',
  budgetTasks: 'id, spaceId, order',
  settings: 'id',
})

db.version(2).stores({
  spaces: 'id, type, createdAt',
  catalogItems: 'id, category, createdAt',
  placedItems: 'id, spaceId, catalogItemId',
  budgetTasks: 'id, spaceId, order',
  settings: 'id',
  renders: 'id, spaceId, sourceSlot, createdAt',
})

export { db }
