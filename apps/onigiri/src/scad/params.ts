import { loadStored, saveStored, toScad, type Range } from '@stl-creator/stl-kit'
import { scadDefaults } from './files'

export interface Params {
  diameter: number
  height: number
  corners: number
  corner_radius: number
  handle_length: number
  handle_height: number
}

const SETTINGS = [
  'diameter',
  'height',
  'corners',
  'corner_radius',
  'handle_length',
  'handle_height',
] as const

/** Defaults read from onigiri.scad itself (only the settings, not its internals). */
export const DEFAULTS = Object.fromEntries(
  Object.entries(scadDefaults()).filter(([name]) => (SETTINGS as readonly string[]).includes(name)),
) as unknown as Params

/** Handle tip-to-tip must stay this much shorter than the press plate. */
export const HANDLE_LENGTH_MARGIN = 5

/** Matches models/onigiri clearance. */
const PRESS_CLEARANCE = 0.4

export const RANGES = {
  diameter: { min: 50, max: 140, step: 1, unit: 'mm' },
  height: { min: 15, max: 60, step: 1, unit: 'mm' },
  corner_radius: { min: 2, max: 40, step: 0.5, unit: 'mm' },
  handle_length: { min: 15, max: 90, step: 1, unit: 'mm' },
  handle_height: { min: 10, max: 40, step: 1, unit: 'mm' },
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

function clampRange(n: number, range: Range): number {
  return Math.min(range.max, Math.max(range.min, n))
}

/**
 * Smallest width of the press plate (flat-to-flat of the n-gon).
 * Same formula as OpenSCAD: (diameter - 2·clearance) · cos(180/corners).
 */
export function pressMinWidth(diameter: number, corners: number): number {
  const n = clampCorners(corners)
  return (diameter - 2 * PRESS_CLEARANCE) * Math.cos(Math.PI / n)
}

/** Longest allowed handle: always ≥5 mm shorter than the press plate. */
export function maxHandleLength(diameter: number, corners: number): number {
  return Math.max(RANGES.handle_length.min, pressMinWidth(diameter, corners) - HANDLE_LENGTH_MARGIN)
}

/** Slider range for handle length, capped by the press plate. */
export function handleLengthRange(diameter: number, corners: number): Range {
  return { ...RANGES.handle_length, max: maxHandleLength(diameter, corners) }
}

export function clampHandleLength(length: number, diameter: number, corners: number): number {
  return clampRange(length, handleLengthRange(diameter, corners))
}

/** Keep every setting in a valid range (including handle vs press plate). */
export function clampParams(params: Params): Params {
  const diameter = clampRange(params.diameter, RANGES.diameter)
  const corners = clampCorners(params.corners)
  return {
    diameter,
    height: clampRange(params.height, RANGES.height),
    corners,
    corner_radius: clampRange(params.corner_radius, RANGES.corner_radius),
    handle_length: clampHandleLength(params.handle_length, diameter, corners),
    handle_height: clampRange(params.handle_height, RANGES.handle_height),
  }
}

/** `-D name=value` overrides for every setting. */
export function toDefines(params: Params): string[] {
  return Object.entries(clampParams(params)).map(([name, value]) => `${name}=${toScad(value)}`)
}

const STORAGE_KEY = 'onigiri-stl:params'

export function loadParams(): Params {
  return loadStored(STORAGE_KEY, { ...DEFAULTS }, (defaults, saved) =>
    clampParams({
      ...defaults,
      ...Object.fromEntries(Object.entries(saved as object).filter(([k]) => k in defaults)),
    }),
  )
}

export function saveParams(params: Params) {
  saveStored(STORAGE_KEY, clampParams(params))
}
