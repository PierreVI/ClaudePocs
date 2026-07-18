import { Suspense, useMemo } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { CatalogItem, PlacedItem, Space, WallSlot } from '../types/models'

interface RoomScene3DProps {
  space: Space
  placedItems: PlacedItem[]
  catalogById: Map<string, CatalogItem>
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function RoomScene3D({ space, placedItems, catalogById, selectedId, onSelect }: RoomScene3DProps) {
  const { width, length, height } = space
  const h = space.type === 'garden' ? 0.01 : Math.max(height, 0.1)
  const maxSpan = Math.max(width, length, 3)

  return (
    <Canvas
      shadows
      camera={{ position: [width * 0.9, Math.max(h, width, length) * 0.8 + 1.2, length * 1.3], fov: 45 }}
      onPointerMissed={() => onSelect(null)}
      className="rounded-xl"
    >
      <color attach="background" args={[space.type === 'garden' ? '#bfe6f5' : '#f4ece0']} />
      <hemisphereLight args={['#dfeeff', '#cbb994', 0.6]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        position={[width, Math.max(h * 3, 4), length]}
        intensity={1.2}
        castShadow
      />
      <Suspense fallback={null}>
        <RoomShell space={space} />
        {placedItems.map((item) => {
          const catalogItem = catalogById.get(item.catalogItemId)
          if (!catalogItem) return null
          return (
            <PlacedSprite
              key={item.id}
              item={item}
              catalogItem={catalogItem}
              selected={selectedId === item.id}
              onSelect={() => onSelect(item.id)}
            />
          )
        })}
      </Suspense>
      <OrbitControls
        makeDefault
        target={[width / 2, h / 2, length / 2]}
        minDistance={1}
        maxDistance={maxSpan * 3}
        maxPolarAngle={Math.PI / 2 - 0.02}
      />
    </Canvas>
  )
}

function RoomShell({ space }: { space: Space }) {
  const { width, length, height, type } = space
  const h = type === 'garden' ? 0 : height
  const photoBySlot = useMemo(() => {
    const map = new Map<WallSlot, string>()
    for (const p of space.photos) map.set(p.slot, p.dataUrl)
    return map
  }, [space.photos])

  const floorUrl = photoBySlot.get('floor')

  return (
    <group>
      {floorUrl ? (
        <TexturedFloor url={floorUrl} width={width} length={length} />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, length / 2]} receiveShadow>
          <planeGeometry args={[width, length]} />
          <meshStandardMaterial color={type === 'garden' ? '#7fbf6e' : '#dcd0b8'} />
        </mesh>
      )}

      {type === 'room' && (
        <>
          <Wall url={photoBySlot.get('south')} width={width} height={h} position={[width / 2, h / 2, 0]} rotationY={0} />
          <Wall
            url={photoBySlot.get('north')}
            width={width}
            height={h}
            position={[width / 2, h / 2, length]}
            rotationY={Math.PI}
          />
          <Wall
            url={photoBySlot.get('west')}
            width={length}
            height={h}
            position={[0, h / 2, length / 2]}
            rotationY={Math.PI / 2}
          />
          <Wall
            url={photoBySlot.get('east')}
            width={length}
            height={h}
            position={[width, h / 2, length / 2]}
            rotationY={-Math.PI / 2}
          />
        </>
      )}

      {/* ground extension so the plot reads nicely in context */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, -0.02, length / 2]} receiveShadow>
        <planeGeometry args={[width + 2, length + 2]} />
        <meshStandardMaterial color={type === 'garden' ? '#9fd48a' : '#e7e0cf'} />
      </mesh>
    </group>
  )
}

function TexturedFloor({ url, width, length }: { url: string; width: number; length: number }) {
  const texture = useLoader(THREE.TextureLoader, url)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[width / 2, 0, length / 2]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function Wall({
  url,
  width,
  height,
  position,
  rotationY,
}: {
  url?: string
  width: number
  height: number
  position: [number, number, number]
  rotationY: number
}) {
  if (height <= 0) return null
  return url ? (
    <TexturedWall url={url} width={width} height={height} position={position} rotationY={rotationY} />
  ) : (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial color="#f2e9d8" side={THREE.DoubleSide} />
    </mesh>
  )
}

function TexturedWall({
  url,
  width,
  height,
  position,
  rotationY,
}: {
  url: string
  width: number
  height: number
  position: [number, number, number]
  rotationY: number
}) {
  const texture = useLoader(THREE.TextureLoader, url)
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

function PlacedSprite({
  item,
  catalogItem,
  selected,
  onSelect,
}: {
  item: PlacedItem
  catalogItem: CatalogItem
  selected: boolean
  onSelect: () => void
}) {
  const texture = useLoader(THREE.TextureLoader, catalogItem.photoDataUrl)
  const w = catalogItem.realWidth * item.scaleFactor
  const hgt = catalogItem.realHeight * item.scaleFactor

  return (
    <group position={[item.x, hgt / 2, item.z]} rotation={[0, item.rotationY, 0]}>
      <mesh
        castShadow
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <planeGeometry args={[w, hgt]} />
        <meshStandardMaterial map={texture} transparent side={THREE.DoubleSide} />
      </mesh>
      {selected && (
        <mesh position={[0, -hgt / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[w * 0.35, w * 0.42, 32]} />
          <meshBasicMaterial color="#e8b23d" />
        </mesh>
      )}
    </group>
  )
}
