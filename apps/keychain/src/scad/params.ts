import { loadStored, saveStored, toScad, type Range } from '@stl-creator/stl-kit'
import { scadDefaults } from './files'

export type HoleSide = 'left' | 'right' | 'top'

export interface Params {
  name: string
  text_size: number
  plate_thickness: number
  text_height: number
  border: number
  hole: boolean
  hole_side: HoleSide
}

const SETTINGS = ['name', 'text_size', 'plate_thickness', 'text_height', 'border', 'hole', 'hole_side'] as const

/** Defaults read from keychain.scad itself (only the settings, not its internals). */
export const DEFAULTS = Object.fromEntries(
  Object.entries(scadDefaults()).filter(([name]) => (SETTINGS as readonly string[]).includes(name)),
) as unknown as Params

export const RANGES = {
  text_size: { min: 6, max: 30, step: 0.5, unit: 'mm' },
  plate_thickness: { min: 1, max: 6, step: 0.2, unit: 'mm' },
  text_height: { min: 0, max: 4, step: 0.2, unit: 'mm' },
  border: { min: 1, max: 8, step: 0.5, unit: 'mm' },
} satisfies Record<string, Range>

export const MAX_NAME_LENGTH = 20

/** `-D name=value` overrides for every setting, plus the font when one is loaded. */
export function toDefines(params: Params, font?: string): string[] {
  const defines = Object.entries(params).map(([name, value]) => `${name}=${toScad(value)}`)
  if (font) defines.push(`font=${toScad(font)}`)
  return defines
}

/** Download name: the name in plain letters, e.g. "Robin-keychain.stl". */
export function fileName(name: string): string {
  const safe = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return safe ? `${safe}-keychain.stl` : 'keychain.stl'
}

const STORAGE_KEY = 'keychain-stl:params'
export const FONT_KEY = 'keychain-stl:font'

export function loadParams(): Params {
  return loadStored(STORAGE_KEY, { ...DEFAULTS }, (defaults, saved) => ({
    ...defaults,
    ...Object.fromEntries(Object.entries(saved as object).filter(([k]) => k in defaults)),
  }))
}

export function saveParams(params: Params) {
  saveStored(STORAGE_KEY, params)
}
