// Shareable links: the settings that differ from the defaults, plus the
// font, as base64url JSON in the URL hash.
import { changedFrom, clearHash, fromBase64Url, mergeKnown, toBase64Url } from '@stl-creator/stl-kit'
import type { FontChoice } from '@stl-creator/stl-kit/fonts'
import { DEFAULT_FONT } from './font'
import { DEFAULTS, type Params } from './scad/params'

export interface SharedTag {
  params: Params
  font: FontChoice
}

const PREFIX = '#tag='

export function shareUrl({ params, font }: SharedTag): string {
  const payload: { v: 1; p: Partial<Params>; f?: FontChoice } = { v: 1, p: changedFrom(DEFAULTS, params) }
  if (JSON.stringify(font) !== JSON.stringify(DEFAULT_FONT)) payload.f = font
  const url = new URL(location.href)
  url.hash = PREFIX.slice(1) + toBase64Url(JSON.stringify(payload))
  return url.toString()
}

/** The tag in the current URL, or null when there is none or it is invalid. */
export function readSharedTag(): SharedTag | null {
  if (!location.hash.startsWith(PREFIX)) return null
  try {
    const payload = JSON.parse(fromBase64Url(location.hash.slice(PREFIX.length)))
    if (payload.v !== 1) return null
    const params = mergeKnown(DEFAULTS, payload.p ?? {})
    if (!['left', 'right', 'top'].includes(params.hole_side)) params.hole_side = DEFAULTS.hole_side
    const font = payload.f?.id ? { ...DEFAULT_FONT, ...payload.f } : DEFAULT_FONT
    return { params, font }
  } catch {
    return null
  }
}

export const clearSharedTag = clearHash
