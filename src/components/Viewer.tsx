import { Bounds, Grid, OrbitControls, useBounds } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Vector3 } from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import type { Quality } from '../scad/params'

interface Props {
  stl: ArrayBuffer | null
  /** Which kind of model `stl` is; the camera re-frames when it changes. */
  frameKey: string
  /** Fast: no antialiasing and no high-DPI rendering, for slower GPUs. */
  quality: Quality
}

const MAT = '#2f5b4c'
const PLASTIC = '#f1ece1'

function useGeometry(stl: ArrayBuffer | null): BufferGeometry | null {
  const geometry = useMemo(() => {
    if (!stl) return null
    const geom = new STLLoader().parse(stl)
    // sit the model on the mat, centred
    geom.computeBoundingBox()
    const box = geom.boundingBox!
    const centre = box.getCenter(new Vector3())
    geom.translate(-centre.x, -centre.y, -box.min.z)
    return geom
  }, [stl])
  useEffect(() => () => geometry?.dispose(), [geometry])
  return geometry
}

function Frame({ frameKey, geometry }: { frameKey: string; geometry: BufferGeometry | null }) {
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

export function Viewer({ stl, frameKey, quality }: Props) {
  const geometry = useGeometry(stl)
  const fast = quality === 'fast'
  return (
    <Canvas
      // antialiasing is fixed at context creation, so switching remounts
      key={quality}
      // draw only when something changes (orbiting, a new model), not 60x a second
      frameloop="demand"
      gl={{ antialias: !fast, powerPreference: fast ? 'low-power' : 'default' }}
      className="viewer-canvas"
      camera={{ position: [40, -60, 55], up: [0, 0, 1], fov: 35, near: 0.5, far: 5000 }}
      dpr={fast ? 1 : [1, 2]}
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
        <Frame frameKey={frameKey} geometry={geometry} />
        {geometry && (
          <mesh geometry={geometry}>
            <meshStandardMaterial color={PLASTIC} roughness={0.55} metalness={0} />
          </mesh>
        )}
      </Bounds>

      <OrbitControls makeDefault target={[0, 0, 4]} />
    </Canvas>
  )
}
