import { useLiveQuery } from 'dexie-react-hooks'
import { v4 as uuid } from 'uuid'
import { db } from '../db/db'
import type { RoomRender, WallSlot } from '../types/models'

export function useRenders(spaceId: string | undefined) {
  const renders = useLiveQuery(async () => {
    if (!spaceId) return []
    const list = await db.renders.where('spaceId').equals(spaceId).toArray()
    return list.sort((a, b) => b.createdAt - a.createdAt)
  }, [spaceId])
  return { renders: renders ?? [], loaded: renders !== undefined }
}

export async function saveRender(input: {
  spaceId: string
  sourceSlot: WallSlot
  prompt: string
  dataUrl: string
}) {
  const render: RoomRender = { id: uuid(), ...input, createdAt: Date.now() }
  await db.renders.add(render)
  return render
}

export async function deleteRender(id: string) {
  await db.renders.delete(id)
}
