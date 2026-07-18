// Village tile accent palette, picked by a stored seed so each plot keeps its color.
export const TILE_PALETTE = [
  { base: '#8bc98f', roof: '#5a9c62', name: 'sauge' },
  { base: '#f2c288', roof: '#d99a4e', name: 'miel' },
  { base: '#9ecbe0', roof: '#5fa3c4', name: 'ciel' },
  { base: '#e79b9b', roof: '#c26a6a', name: 'terracotta' },
  { base: '#c8b6e2', roof: '#9c81c4', name: 'lavande' },
  { base: '#f4dd7a', roof: '#d9b93f', name: 'ble' },
]

export function tileColorFor(seed: number) {
  return TILE_PALETTE[Math.abs(seed) % TILE_PALETTE.length]
}

export function randomSeed() {
  return Math.floor(Math.random() * 100000)
}
