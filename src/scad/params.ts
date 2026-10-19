import { scadDefaults } from './files'

export type Mode = 'key' | 'set'
export type Bump = 'auto' | 'on' | 'off'
export type Half = 'both' | 'left' | 'right'

export interface Params {
  // key.scad
  legend_text: string
  row: number
  length: number
  roll: number
  bump: Bump
  // profile.scad, one value per row 0–4
  heights: number[]
  tilts: number[]
  skews: number[]
  fontSizes: number[]
  // profile.scad
  top_bevel: number
  top_bevel_steps: number
  home_keys: string[]
  bump_depth: number
  bump_edge: number
  stem_slop: number
  stem_tines: boolean
  stem_tine_width: number
  stem_tine_height: number
  // layouts/sofle.scad
  thumb_length: number
  thumb_roll: number
  half: Half
}

export const ROW_KEYS = ['heights', 'tilts', 'skews', 'fontSizes'] as const
export type RowKey = (typeof ROW_KEYS)[number]

const KEY_ONLY = ['legend_text', 'row', 'length', 'roll', 'bump'] as const
const SET_ONLY = ['thumb_length', 'thumb_roll', 'half'] as const

/** Defaults read from the .scad files themselves. */
export const DEFAULTS = {
  ...scadDefaults('profile.scad'),
  ...scadDefaults('layouts/sofle.scad'),
  ...scadDefaults('key.scad'),
} as unknown as Params

export interface Range {
  min: number
  max: number
  step: number
  unit?: string
}

export const RANGES: Record<string, Range> = {
  length: { min: 1, max: 2.25, step: 0.25, unit: 'u' },
  roll: { min: -20, max: 20, step: 0.5, unit: '°' },
  heights: { min: 3, max: 16, step: 0.25, unit: 'mm' },
  tilts: { min: -25, max: 25, step: 0.5, unit: '°' },
  skews: { min: 0, max: 4, step: 0.05, unit: 'mm' },
  fontSizes: { min: 1, max: 12, step: 0.5, unit: 'mm' },
  top_bevel: { min: 0, max: 2.5, step: 0.1, unit: 'mm' },
  top_bevel_steps: { min: 1, max: 10, step: 1 },
  bump_depth: { min: 0, max: 1.5, step: 0.05, unit: 'mm' },
  bump_edge: { min: 0, max: 6, step: 0.1, unit: 'mm' },
  stem_slop: { min: 0, max: 1, step: 0.01, unit: 'mm' },
  stem_tine_width: { min: 0.1, max: 1.2, step: 0.05, unit: 'mm' },
  stem_tine_height: { min: 0.05, max: 0.6, step: 0.01, unit: 'mm' },
  thumb_length: { min: 1, max: 2.25, step: 0.25, unit: 'u' },
  thumb_roll: { min: 0, max: 25, step: 0.5, unit: '°' },
}

/** OpenSCAD literal for a JS value. JSON string escaping matches OpenSCAD's. */
export function toScad(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(toScad).join(', ')}]`
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  throw new Error(`Cannot pass ${String(value)} to OpenSCAD`)
}

export function modelFile(mode: Mode): string {
  return mode === 'key' ? 'key.scad' : 'layouts/sofle.scad'
}

export type Quality = 'fine' | 'fast'

// KeyV2 draws arcs with $fs=0.1 and rounded corners with 30 facets. Coarser
// values roughly halve the triangle count; only used for the preview.
const FAST_DEFINES = ['$fs=0.4', '$shape_facets=12']

/** `-D name=value` overrides for every setting that applies to the mode. */
export function toDefines(params: Params, mode: Mode, font?: string, quality: Quality = 'fine'): string[] {
  const skip = new Set<string>(mode === 'key' ? SET_ONLY : KEY_ONLY)
  const defines = Object.entries(params)
    .filter(([name]) => !skip.has(name))
    .map(([name, value]) => `${name}=${toScad(value)}`)
  if (font) defines.push(`$font=${toScad(font)}`)
  if (quality === 'fast') defines.push(...FAST_DEFINES)
  return defines
}

/** Fast preview unless the viewer picked high quality before. */
export function loadQuality(): Quality {
  try {
    return localStorage.getItem('keycap-stl:quality') === 'fine' ? 'fine' : 'fast'
  } catch {
    return 'fast'
  }
}

export function saveQuality(quality: Quality) {
  try {
    localStorage.setItem('keycap-stl:quality', quality)
  } catch {
    // storage unavailable
  }
}

const STORAGE_KEY = 'keycap-stl:params'

export function loadParams(): Params {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    // only keep known settings, so renamed .scad variables don't linger
    const known = Object.fromEntries(
      Object.entries(saved).filter(([k]) => k in DEFAULTS),
    )
    return { ...DEFAULTS, ...known }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveParams(params: Params) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params))
  } catch {
    // storage unavailable (private mode); settings just won't persist
  }
}
