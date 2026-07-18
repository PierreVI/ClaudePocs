import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuid } from 'uuid'
import { db } from '../db/db'
import type { PlacedItem } from '../types/models'

export function usePlacedItems(spaceId: string | undefined) {
  const items = useLiveQuery(
    () => (spaceId ? db.placedItems.where('spaceId').equals(spaceId).toArray() : []),
    [spaceId],
  )
  return { items: items ?? [], loaded: items !== undefined }
}

export async function placeItem(input: {
  spaceId: string
  catalogItemId: string
  x: number
  z: number
}) {
  const item: PlacedItem = {
    id: uuid(),
    spaceId: input.spaceId,
    catalogItemId: input.catalogItemId,
    x: input.x,
    z: input.z,
    rotationY: 0,
    scaleFactor: 1,
  }
  await db.placedItems.add(item)
  return item
}

export async function updatePlacedItem(id: string, changes: Partial<PlacedItem>) {
  await db.placedItems.update(id, changes)
}

export async function removePlacedItem(id: string) {
  await db.placedItems.delete(id)
}
