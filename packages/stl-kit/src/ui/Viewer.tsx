import { Bounds, Grid, OrbitControls, useBounds } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { BufferGeometry, Vector3 } from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

interface Props {
  stl: ArrayBuffer | null
  /** Which kind of model `stl` is; the camera re-frames when it changes. */
  frameKey: string
  /** Draws the model instead of the plain mesh, e.g. with click handling. */
  children?: (model: Model) => ReactNode
  /** Called for clicks that hit nothing. */
  onPointerMissed?: () => void
}

export const MAT = '#2f5b4c'
export const PLASTIC = '#f1ece1'
export const FOCUS = '#e0a526'

export interface Model {
  geometry: BufferGeometry
  /** Model coordinates of the scene origin: the model is centred on the mat. */
  origin: Vector3
}

function useModel(stl: ArrayBuffer | null): Model | null {
  const model = useMemo(() => {
    if (!stl) return null
    const geometry = new STLLoader().parse(stl)
    geometry.computeBoundingBox()
    const box = geometry.boundingBox!
    const centre = box.getCenter(new Vector3())
    const origin = new Vector3(centre.x, centre.y, box.min.z)
    geometry.translate(-origin.x, -origin.y, -origin.z)
    return { geometry, origin }
  }, [stl])
  useEffect(() => () => model?.geometry.dispose(), [model])
  return model
}

export function PlasticMesh({ geometry }: { geometry: BufferGeometry }) {
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={PLASTIC} roughness={0.55} metalness={0} />
    </mesh>
  )
}

function Frame({ frameKey, geometry }: { frameKey: string; geometry: BufferGeometry | undefined }) {
  const bounds = useBounds()
  const framed = useRef<string | null>(null)
  useEffect(() => {
    // re-frame for the first model of each kind, not on every tweak
    if (!geometry || framed.current === frameKey) return
    framed.current = frameKey
    bounds.refresh().clip().fit()
  }, [bounds, frameKey, geometry])
  return null
}

/** The 3D stage: the model on a green cutting mat with a mm grid. */
export function Viewer({ stl, frameKey, children, onPointerMissed }: Props) {
  const model = useModel(stl)
  return (
    <Canvas
      // draw only when something changes (orbiting, a new model), not 60x a second
      frameloop="demand"
      gl={{ powerPreference: 'low-power' }}
      className="viewer-canvas"
      camera={{ position: [40, -60, 55], up: [0, 0, 1], fov: 35, near: 0.5, far: 5000 }}
      dpr={[1, 1.5]}
      onPointerMissed={onPointerMissed}
    >
      <color attach="background" args={[MAT]} />
      <hemisphereLight args={['#ffffff', '#1d3a30', 1.4]} />
      <directionalLight position={[60, -80, 120]} intensity={2.2} />
      <directionalLight position={[-80, 60, 40]} intensity={0.6} />

      <Grid
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, -0.01]}
        args={[400, 400]}
        cellSize={1}
        sectionSize={10}
        cellColor="#4a7a68"
        sectionColor="#9cc3b2"
        cellThickness={0.6}
        sectionThickness={1}
        fadeDistance={900}
        fadeStrength={1.5}
        infiniteGrid
      />

      <Bounds margin={1.2}>
        <Frame frameKey={frameKey} geometry={model?.geometry} />
        {model && children && children(model)}
        {model && !children && <PlasticMesh geometry={model.geometry} />}
      </Bounds>

      <OrbitControls makeDefault target={[0, 0, 4]} />
    </Canvas>
  )
}
