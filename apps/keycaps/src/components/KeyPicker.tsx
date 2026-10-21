import { Html, Line } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { FOCUS, PLASTIC, type Model } from '@stl-creator/stl-kit'
import { useRef, useState } from 'react'
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
export function KeyPicker({ model, editing }: { model: Model; editing: KeyEditing }) {
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
