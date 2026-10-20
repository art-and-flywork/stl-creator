// Shareable links: the whole configuration in the URL hash, as base64url JSON.
// Only settings that differ from the .scad defaults are included, so links
// stay short and pick up future default changes for untouched settings.
import { DEFAULT_FONT, type FontChoice } from './fonts'
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
  const changed = Object.fromEntries(
    Object.entries(params).filter(
      ([key, value]) => JSON.stringify(value) !== JSON.stringify(DEFAULTS[key as keyof Params]),
    ),
  )
  const payload: Payload = { v: 1, m: mode, p: changed }
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
    const params = { ...DEFAULTS }
    for (const [key, value] of Object.entries(payload.p ?? {})) {
      const fallback = DEFAULTS[key as keyof Params]
      if (fallback === undefined) continue
      if (Array.isArray(fallback) !== Array.isArray(value) || typeof fallback !== typeof value) continue
      Object.assign(params, { [key]: value })
    }
    const font = payload.f?.id ? { ...DEFAULT_FONT, ...payload.f } : DEFAULT_FONT
    return { mode: payload.m === 'key' ? 'key' : 'set', params, font }
  } catch {
    return null
  }
}

/** Remove the set from the address bar once it has been applied. */
export function clearSharedSet() {
  history.replaceState(null, '', location.pathname + location.search)
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): string {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}
