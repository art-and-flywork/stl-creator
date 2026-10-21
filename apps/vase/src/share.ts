// Shareable links: the settings that differ from the defaults, as base64url
// JSON in the URL hash.
import { changedFrom, clearHash, fromBase64Url, mergeKnown, toBase64Url } from '@stl-creator/stl-kit'
import { DEFAULTS, MAX_BULGES, type Params } from './scad/params'

const PREFIX = '#vase='

export function shareUrl(params: Params): string {
  const url = new URL(location.href)
  url.hash = PREFIX.slice(1) + toBase64Url(JSON.stringify({ v: 1, p: changedFrom(DEFAULTS, params) }))
  return url.toString()
}

/** The vase in the current URL, or null when there is none or it is invalid. */
export function readSharedVase(): Params | null {
  if (!location.hash.startsWith(PREFIX)) return null
  try {
    const payload = JSON.parse(fromBase64Url(location.hash.slice(PREFIX.length)))
    if (payload.v !== 1) return null
    const params = mergeKnown(DEFAULTS, payload.p ?? {})
    // a hand-edited link could hold anything in the list
    const valid = (b: unknown): b is [number, number] =>
      Array.isArray(b) && b.length === 2 && b.every((n) => typeof n === 'number' && Number.isFinite(n))
    return { ...params, bulges: params.bulges.filter(valid).slice(0, MAX_BULGES) }
  } catch {
    return null
  }
}

export const clearSharedVase = clearHash
