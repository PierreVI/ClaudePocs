import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuid } from 'uuid'
import { db } from '../db/db'
import type { Space, SpacePhoto, SpaceType } from '../types/models'
import { randomSeed } from '../utils/theme'

export function useSpaces() {
  const spaces = useLiveQuery(() => db.spaces.orderBy('createdAt').toArray(), [])
  return { spaces: spaces ?? [], loaded: spaces !== undefined }
}

export function useSpace(id: string | undefined) {
  const result = useLiveQuery<{ space: Space | null }>(
    async () => ({ space: id ? ((await db.spaces.get(id)) ?? null) : null }),
    [id],
  )
  return { space: result?.space ?? null, loaded: result !== undefined }
}

export async function createSpace(input: {
  name: string
  type: SpaceType
  width: number
  length: number
  height: number
  photos: SpacePhoto[]
}) {
  const existing = await db.spaces.toArray()
  const id = uuid()
  const space: Space = {
    id,
    name: input.name,
    type: input.type,
    width: input.width,
    length: input.length,
    height: input.height,
    photos: input.photos,
    mapX: existing.length % 5,
    mapY: Math.floor(existing.length / 5),
    colorSeed: randomSeed(),
    createdAt: Date.now(),
  }
  await db.spaces.add(space)
  return space
}

export async function updateSpace(id: string, changes: Partial<Space>) {
  await db.spaces.update(id, changes)
}

export async function deleteSpace(id: string) {
  await db.transaction('rw', db.spaces, db.placedItems, db.budgetTasks, async () => {
    await db.spaces.delete(id)
    await db.placedItems.where('spaceId').equals(id).delete()
    await db.budgetTasks.where('spaceId').equals(id).delete()
  })
}

export async function moveSpaceOnMap(id: string, mapX: number, mapY: number) {
  await db.spaces.update(id, { mapX, mapY })
}
