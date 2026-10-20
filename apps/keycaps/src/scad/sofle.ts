import type { Params } from './params'

// Mirrors the placement in keycaps/layouts/sofle.scad (sofle_half and the two
// calls below it). Keep in sync when that file changes.
const UNIT = 19.05 // $unit in keycaps/src/constants.scad
const BASE = 18.16 // DCS bottom width and depth

const HALVES = {
  left: { x0: -2, offsets: [-1, -1, -1, -1, 1], bigCol: 4 },
  right: { x0: 7, offsets: [-1, -1, -1, -2, -2], bigCol: 0 },
} as const

export type HalfName = keyof typeof HALVES

export interface LayoutKey {
  id: string
  half: HalfName
  row: number
  col: number
  legend: string
  /** Centre of the footprint in model coordinates (mm). */
  x: number
  y: number
  /** Footprint size in mm. */
  width: number
  depth: number
  /** Column in the editing grid, 0-based, aligned within the half. */
  gridCol: number
  big: boolean
}

export function keyId(half: HalfName, row: number, col: number) {
  return `${half}-${row}-${col}`
}

/** Every key of the rendered halves, in reading order. */
export function layoutKeys(params: Params, only: Params['half'] = params.half): LayoutKey[] {
  const keys: LayoutKey[] = []
  for (const half of ['left', 'right'] as const) {
    if (only !== 'both' && only !== half) continue
    const { x0, offsets, bigCol } = HALVES[half]
    const minOffset = Math.min(...offsets)
    params[half].forEach((row, r) =>
      row.forEach((legend, c) => {
        const big = r === 4 && c === bigCol
        const length = big ? params.thumb_length : 1
        keys.push({
          id: keyId(half, r, c),
          half,
          row: r,
          col: c,
          legend,
          x: (x0 + c + offsets[r]) * UNIT,
          y: (-r - (big ? (params.thumb_length - 1) / 2 : 0)) * UNIT,
          width: BASE,
          depth: BASE + (length - 1) * UNIT,
          gridCol: c + offsets[r] - minOffset,
          big,
        })
      }),
    )
  }
  return keys
}

/** The key whose footprint contains (or is nearest to) a point, within 3 mm. */
export function keyAt(keys: LayoutKey[], x: number, y: number): LayoutKey | null {
  let best: LayoutKey | null = null
  let bestDistance = 3
  for (const key of keys) {
    const dx = Math.max(0, Math.abs(x - key.x) - key.width / 2)
    const dy = Math.max(0, Math.abs(y - key.y) - key.depth / 2)
    const distance = Math.hypot(dx, dy)
    if (distance < bestDistance || (distance === 0 && bestDistance === 0)) {
      best = key
      bestDistance = distance
    }
  }
  return best
}

export function setLegend(params: Params, id: string, legend: string): Params {
  const [half, r, c] = id.split('-') as [HalfName, string, string]
  return {
    ...params,
    [half]: params[half].map((row, ri) =>
      ri === Number(r) ? row.map((v, ci) => (ci === Number(c) ? legend : v)) : row,
    ),
  }
}
