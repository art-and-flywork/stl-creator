import { loadStored, saveStored, toScad, type Range } from '@stl-creator/stl-kit'
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
  left: string[][]
  right: string[][]
  thumb_length: number
  thumb_roll: number
  half: Half
}

export const ROW_KEYS = ['heights', 'tilts', 'skews', 'fontSizes'] as const
export type RowKey = (typeof ROW_KEYS)[number]

const KEY_ONLY = ['legend_text', 'row', 'length', 'roll', 'bump'] as const
const SET_ONLY = ['left', 'right', 'thumb_length', 'thumb_roll', 'half'] as const

/** Defaults read from the .scad files themselves. */
export const DEFAULTS = {
  ...scadDefaults('profile.scad'),
  ...scadDefaults('layouts/sofle.scad'),
  ...scadDefaults('key.scad'),
} as unknown as Params

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

export function modelFile(mode: Mode): string {
  return mode === 'key' ? 'key.scad' : 'layouts/sofle.scad'
}

// KeyV2 draws arcs with $fs=0.1 and rounded corners with 30 facets. These
// coarser values halve the triangle count and render time, with no visible
// difference at keycap size, so lighter machines keep up.
const RESOLUTION_DEFINES = ['$fs=0.4', '$shape_facets=12']

/** `-D name=value` overrides for every setting that applies to the mode. */
export function toDefines(params: Params, mode: Mode, font?: string): string[] {
  const skip = new Set<string>(mode === 'key' ? SET_ONLY : KEY_ONLY)
  const defines = Object.entries(params)
    .filter(([name]) => !skip.has(name))
    .map(([name, value]) => `${name}=${toScad(value)}`)
  if (font) defines.push(`$font=${toScad(font)}`)
  defines.push(...RESOLUTION_DEFINES)
  return defines
}

const STORAGE_KEY = 'keycap-stl:params'

export function loadParams(): Params {
  // only keep known settings, so renamed .scad variables don't linger
  return loadStored(STORAGE_KEY, { ...DEFAULTS }, (defaults, saved) => ({
    ...defaults,
    ...Object.fromEntries(Object.entries(saved as object).filter(([k]) => k in defaults)),
  }))
}

export function saveParams(params: Params) {
  saveStored(STORAGE_KEY, params)
}
