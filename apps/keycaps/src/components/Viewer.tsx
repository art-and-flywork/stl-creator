import { Bounds, Grid, Html, Line, OrbitControls, useBounds } from '@react-three/drei'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BufferGeometry, Vector3 } from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { keyAt, type LayoutKey } from '../scad/sofle'

/** Click-to-edit legends on a rendered layout. */
export interface KeyEditing {
  /** Keys of the model that is shown, in model coordinates. */
  keys: LayoutKey[]
  selected: string | null
  /** Show the legend input next to the selected key (off when editing in the panel). */
  inputOpen: boolean
  onSelect: (id: string | null) => void
  onLegend: (id: string, legend: string) => void
  /** CSS font family of the legend font, for the input. */
  fontFamily?: string
}

interface Props {
  stl: ArrayBuffer | null
  /** Which kind of model `stl` is; the camera re-frames when it changes. */
  frameKey: string
  editing?: KeyEditing
}

const MAT = '#2f5b4c'
const PLASTIC = '#f1ece1'

const FOCUS = '#e0a526'

interface Model {
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

/** Rectangle around a key's footprint, drawn on the mat. */
function Footprint({ k, color, width }: { k: LayoutKey; color: string; width: number }) {
  const m = 1.2 // margin around the keycap
  const x0 = k.x - k.width / 2 - m
  const x1 = k.x + k.width / 2 + m
  const y0 = k.y - k.depth / 2 - m
  const y1 = k.y + k.depth / 2 + m
  return (
    <Line
      points={[
        [x0, y0, 0.05],
        [x1, y0, 0.05],
        [x1, y1, 0.05],
        [x0, y1, 0.05],
        [x0, y0, 0.05],
      ]}
      color={color}
      lineWidth={width}
    />
  )
}

function LegendInput({
  k,
  editing,
}: {
  k: LayoutKey
  editing: KeyEditing
}) {
  const [draft, setDraft] = useState(k.legend)
  // set after saving or cancelling, so the blur that follows doesn't save again
  const done = useRef(false)

  const commit = () => {
    if (done.current) return
    done.current = true
    if (draft !== k.legend) editing.onLegend(k.id, draft)
  }
  const move = (step: number) => {
    commit()
    const i = editing.keys.findIndex((key) => key.id === k.id)
    const next = editing.keys[(i + step + editing.keys.length) % editing.keys.length]
    editing.onSelect(next.id)
  }

  return (
    <Html position={[k.x, k.y - k.depth / 2 - 2, 0]} className="legend-callout" zIndexRange={[20, 10]}>
      <label>
        <span>
          {k.half === 'left' ? 'Left' : 'Right'} half, {k.row === 4 ? 'thumb row' : `row ${k.row}`}, key {k.col + 1}
        </span>
        <input
          autoFocus
          value={draft}
          maxLength={8}
          placeholder="Blank"
          aria-label="Legend"
          style={editing.fontFamily ? { fontFamily: editing.fontFamily } : undefined}
          onFocus={(e) => {
            done.current = false
            e.currentTarget.select()
          }}
          onChange={(e) => {
            done.current = false
            setDraft(e.target.value)
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit()
              editing.onSelect(null)
            } else if (e.key === 'Escape') {
              done.current = true
              editing.onSelect(null)
            } else if (e.key === 'Tab') {
              e.preventDefault()
              move(e.shiftKey ? -1 : 1)
            }
          }}
        />
        <small>Enter saves, Tab goes to the next key</small>
      </label>
    </Html>
  )
}

/** Hover and click handling on the layout model. */
function KeyPicker({ model, editing }: { model: Model; editing: KeyEditing }) {
  const [hovered, setHovered] = useState<LayoutKey | null>(null)
  const selected = editing.keys.find((k) => k.id === editing.selected) ?? null

  const find = (e: ThreeEvent<PointerEvent | MouseEvent>) =>
    keyAt(editing.keys, e.point.x + model.origin.x, e.point.y + model.origin.y)

  return (
    <>
      <mesh
        geometry={model.geometry}
        onPointerMove={(e) => {
          e.stopPropagation()
          const key = find(e)
          if (key?.id !== hovered?.id) setHovered(key)
          document.body.style.cursor = key ? 'pointer' : ''
        }}
        onPointerOut={() => {
          setHovered(null)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          // ignore the click that ends an orbit drag
          if (e.delta > 4) return
          e.stopPropagation()
          const key = find(e)
          if (key) editing.onSelect(key.id)
        }}
      >
        <meshStandardMaterial color={PLASTIC} roughness={0.55} metalness={0} />
      </mesh>
      <group position={[-model.origin.x, -model.origin.y, -model.origin.z]}>
        {hovered && hovered.id !== selected?.id && <Footprint k={hovered} color={PLASTIC} width={1.5} />}
        {selected && (
          <>
            <Footprint k={selected} color={FOCUS} width={2.5} />
            {editing.inputOpen && <LegendInput key={selected.id} k={selected} editing={editing} />}
          </>
        )}
      </group>
    </>
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

export function Viewer({ stl, frameKey, editing }: Props) {
  const model = useModel(stl)
  return (
    <Canvas
      // draw only when something changes (orbiting, a new model), not 60x a second
      frameloop="demand"
      gl={{ powerPreference: 'low-power' }}
      className="viewer-canvas"
      camera={{ position: [40, -60, 55], up: [0, 0, 1], fov: 35, near: 0.5, far: 5000 }}
      dpr={[1, 1.5]}
      onPointerMissed={() => editing?.onSelect(null)}
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
        {model && editing && <KeyPicker model={model} editing={editing} />}
        {model && !editing && (
          <mesh geometry={model.geometry}>
            <meshStandardMaterial color={PLASTIC} roughness={0.55} metalness={0} />
          </mesh>
        )}
      </Bounds>

      <OrbitControls makeDefault target={[0, 0, 4]} />
    </Canvas>
  )
}
