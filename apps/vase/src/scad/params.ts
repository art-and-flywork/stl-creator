import { loadStored, saveStored, toScad, type Range } from '@stl-creator/stl-kit'
import { scadDefaults } from './files'

/** A bulge in the wall: [height, amount] in mm; amount > 0 bulges out. */
export type Bulge = [number, number]

export interface Params {
  height: number
  bottom_radius: number
  top_radius: number
  wall: number
  bulges: Bulge[]
}

const SETTINGS = ['height', 'bottom_radius', 'top_radius', 'wall', 'bulges'] as const

/** Defaults read from vase.scad itself (only the settings, not its internals). */
export const DEFAULTS = Object.fromEntries(
  Object.entries(scadDefaults()).filter(([name]) => (SETTINGS as readonly string[]).includes(name)),
) as unknown as Params

export const RANGES = {
  height: { min: 40, max: 250, step: 1, unit: 'mm' },
  radius: { min: 10, max: 95, step: 0.5, unit: 'mm' },
  wall: { min: 0.8, max: 6, step: 0.1, unit: 'mm' },
  amount: { min: -40, max: 40, step: 0.5, unit: 'mm' },
} satisfies Record<string, Range>

export const MAX_BULGES = 8

/**
 * Bulges the model can draw: sorted, away from base and rim, and far enough
 * apart that the curve through them can't loop. Bulges that don't fit go.
 */
export function normalizeBulges(bulges: Bulge[], height: number): Bulge[] {
  const lo = 0.05 * height
  const hi = 0.95 * height
  const gap = Math.max(2, 0.04 * height)
  const out: Bulge[] = []
  for (const [h, amount] of [...bulges].sort((a, b) => a[0] - b[0])) {
    const previous = out.at(-1)
    const at = round(Math.max(Math.min(Math.max(h, lo), hi), previous ? previous[0] + gap : lo))
    if (at > hi) continue
    out.push([at, amount])
  }
  return out
}

/** A new bulge in the middle of the largest free stretch of the wall. */
export function nextBulge(bulges: Bulge[], height: number): Bulge {
  const heights = [0, ...bulges.map((b) => b[0]).sort((a, b) => a - b), height]
  let best = 0
  for (let i = 1; i < heights.length; i++) {
    if (heights[i] - heights[i - 1] > heights[best + 1] - heights[best]) best = i - 1
  }
  return [Math.round((heights[best] + heights[best + 1]) / 2), 10]
}

/** `-D name=value` overrides for every setting. */
export function toDefines(params: Params): string[] {
  const clean = { ...params, bulges: normalizeBulges(params.bulges, params.height) }
  return Object.entries(clean).map(([name, value]) => `${name}=${toScad(value)}`)
}

const STORAGE_KEY = 'vase-stl:params'

export function loadParams(): Params {
  return loadStored(STORAGE_KEY, { ...DEFAULTS }, (defaults, saved) => ({
    ...defaults,
    ...Object.fromEntries(Object.entries(saved as object).filter(([k]) => k in defaults)),
  }))
}

export function saveParams(params: Params) {
  saveStored(STORAGE_KEY, params)
}

const round = (n: number) => Math.round(n * 100) / 100
