// Shareable links: the whole configuration in the URL hash, as base64url JSON.
// Only settings that differ from the .scad defaults are included, so links
// stay short and pick up future default changes for untouched settings.
import { changedFrom, clearHash, fromBase64Url, mergeKnown, toBase64Url } from '@stl-creator/stl-kit'
import { DEFAULT_FONT, type FontChoice } from '@stl-creator/stl-kit/fonts'
import { DEFAULTS, type Mode, type Params } from './scad/params'

export interface SharedSet {
  mode: Mode
  params: Params
  font: FontChoice
}

interface Payload {
  v: 1
  m: Mode
  p: Partial<Params>
  f?: FontChoice
}

const PREFIX = '#set='

export function shareUrl({ mode, params, font }: SharedSet): string {
  const payload: Payload = { v: 1, m: mode, p: changedFrom(DEFAULTS, params) }
  if (JSON.stringify(font) !== JSON.stringify(DEFAULT_FONT)) payload.f = font
  const url = new URL(location.href)
  url.hash = PREFIX.slice(1) + toBase64Url(JSON.stringify(payload))
  return url.toString()
}

/** The set in the current URL, or null when there is none or it is invalid. */
export function readSharedSet(): SharedSet | null {
  if (!location.hash.startsWith(PREFIX)) return null
  try {
    const payload = JSON.parse(fromBase64Url(location.hash.slice(PREFIX.length))) as Payload
    if (payload.v !== 1) return null
    // keep only known settings with the same shape as their default
    const params = mergeKnown(DEFAULTS, payload.p ?? {})
    const font = payload.f?.id ? { ...DEFAULT_FONT, ...payload.f } : DEFAULT_FONT
    return { mode: payload.m === 'key' ? 'key' : 'set', params, font }
  } catch {
    return null
  }
}

/** Remove the set from the address bar once it has been applied. */
export function clearSharedSet() {
  clearHash()
}
