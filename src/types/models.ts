// Core domain types for the home/garden village builder.

export type SpaceType = 'room' | 'garden'

export type WallSlot = 'north' | 'south' | 'east' | 'west' | 'floor' | 'reference'

export interface SpacePhoto {
  id: string
  slot: WallSlot
  /** data: URL of the photo, stored inline in IndexedDB */
  dataUrl: string
}

export interface Space {
  id: string
  name: string
  type: SpaceType
  /** metres */
  width: number
  /** metres */
  length: number
  /** metres */
  height: number
  photos: SpacePhoto[]
  /** position of this plot on the village map, in grid cells */
  mapX: number
  mapY: number
  /** village tile color accent, derived at creation for a bit of variety */
  colorSeed: number
  createdAt: number
}

export type CatalogCategory = 'furniture' | 'plant'

export interface CatalogItem {
  id: string
  name: string
  category: CatalogCategory
  photoDataUrl: string
  /** real-world size in metres, used as the base scale before the user's factor */
  realWidth: number
  realDepth: number
  realHeight: number
  sourceUrl?: string
  price?: number
  createdAt: number
}

export interface PlacedItem {
  id: string
  spaceId: string
  catalogItemId: string
  /** position within the room, metres, origin = room corner */
  x: number
  z: number
  rotationY: number
  /** free scale multiplier on top of the catalog item's real size, 0.1 - 3 */
  scaleFactor: number
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface BudgetTask {
  id: string
  /** null = global village-wide task, otherwise scoped to a room */
  spaceId: string | null
  label: string
  /** sequencing order, lower = earlier */
  order: number
  status: TaskStatus
  cost: number
  category?: string
  createdAt: number
}

export interface VillageSettings {
  id: 'singleton'
  /** the "harvest" budget the player is working towards */
  totalBudget: number
}
