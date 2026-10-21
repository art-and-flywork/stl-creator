// Shareable links: the settings that differ from the defaults, as base64url
// JSON in the URL hash.
import { changedFrom, clearHash, fromBase64Url, mergeKnown, toBase64Url } from '@stl-creator/stl-kit'
import { clampParams, DEFAULTS, type Params } from './scad/params'

const PREFIX = '#onigiri='

export function shareUrl(params: Params): string {
  const url = new URL(location.href)
  url.hash = PREFIX.slice(1) + toBase64Url(JSON.stringify({ v: 1, p: changedFrom(DEFAULTS, params) }))
  return url.toString()
}

/** The mold in the current URL, or null when there is none or it is invalid. */
export function readSharedOnigiri(): Params | null {
  if (!location.hash.startsWith(PREFIX)) return null
  try {
    const payload = JSON.parse(fromBase64Url(location.hash.slice(PREFIX.length)))
    if (payload.v !== 1) return null
    return clampParams(mergeKnown(DEFAULTS, payload.p ?? {}))
  } catch {
    return null
  }
}

export const clearSharedOnigiri = clearHash
