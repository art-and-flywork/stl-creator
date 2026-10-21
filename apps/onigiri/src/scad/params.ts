import { loadStored, saveStored, toScad, type Range } from '@stl-creator/stl-kit'
import { scadDefaults } from './files'

export interface Params {
  diameter: number
  height: number
  corners: number
  corner_radius: number
}

const SETTINGS = ['diameter', 'height', 'corners', 'corner_radius'] as const

/** Defaults read from onigiri.scad itself (only the settings, not its internals). */
export const DEFAULTS = Object.fromEntries(
  Object.entries(scadDefaults()).filter(([name]) => (SETTINGS as readonly string[]).includes(name)),
) as unknown as Params

export const RANGES = {
  diameter: { min: 50, max: 140, step: 1, unit: 'mm' },
  height: { min: 15, max: 60, step: 1, unit: 'mm' },
  corner_radius: { min: 2, max: 40, step: 0.5, unit: 'mm' },
} satisfies Record<string, Range>

export const CORNER_OPTIONS = [
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
] as const

/** Clamp corners to 3–5 for hand-edited share links. */
export function clampCorners(n: number): number {
  return Math.min(5, Math.max(3, Math.round(n)))
}

/** Keep corner radius in the UI range. */
export function clampCornerRadius(n: number): number {
  return Math.min(RANGES.corner_radius.max, Math.max(RANGES.corner_radius.min, n))
}

/** `-D name=value` overrides for every setting. */
export function toDefines(params: Params): string[] {
  const clean = {
    ...params,
    corners: clampCorners(params.corners),
    corner_radius: clampCornerRadius(params.corner_radius),
  }
  return Object.entries(clean).map(([name, value]) => `${name}=${toScad(value)}`)
}

const STORAGE_KEY = 'onigiri-stl:params'

export function loadParams(): Params {
  return loadStored(STORAGE_KEY, { ...DEFAULTS }, (defaults, saved) => {
    const merged = {
      ...defaults,
      ...Object.fromEntries(Object.entries(saved as object).filter(([k]) => k in defaults)),
    }
    return {
      ...merged,
      corners: clampCorners(merged.corners),
      corner_radius: clampCornerRadius(merged.corner_radius),
    }
  })
}

export function saveParams(params: Params) {
  saveStored(STORAGE_KEY, params)
}
