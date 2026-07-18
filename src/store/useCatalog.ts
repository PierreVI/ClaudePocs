import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuid } from 'uuid'
import { db } from '../db/db'
import type { CatalogItem, CatalogCategory } from '../types/models'

export function useCatalog() {
  const items = useLiveQuery(() => db.catalogItems.orderBy('createdAt').toArray(), [])
  return { items: items ?? [], loaded: items !== undefined }
}

export async function createCatalogItem(input: {
  name: string
  category: CatalogCategory
  photoDataUrl: string
  realWidth: number
  realDepth: number
  realHeight: number
  sourceUrl?: string
  price?: number
}) {
  const item: CatalogItem = {
    id: uuid(),
    ...input,
    createdAt: Date.now(),
  }
  await db.catalogItems.add(item)
  return item
}

export async function deleteCatalogItem(id: string) {
  await db.transaction('rw', db.catalogItems, db.placedItems, async () => {
    await db.catalogItems.delete(id)
    await db.placedItems.where('catalogItemId').equals(id).delete()
  })
}
