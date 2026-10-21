// Building blocks for shareable links: the settings that differ from the
// defaults, as base64url JSON in the URL hash.

/** Settings whose value differs from the default. */
export function changedFrom<T extends object>(defaults: T, values: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([key, value]) => JSON.stringify(value) !== JSON.stringify(defaults[key as keyof T]),
    ),
  ) as Partial<T>
}

/** Defaults overlaid with the known settings from `partial` that have the same shape. */
export function mergeKnown<T extends object>(defaults: T, partial: Record<string, unknown>): T {
  const out = { ...defaults }
  for (const [key, value] of Object.entries(partial ?? {})) {
    const fallback = defaults[key as keyof T]
    if (fallback === undefined) continue
    if (Array.isArray(fallback) !== Array.isArray(value) || typeof fallback !== typeof value) continue
    Object.assign(out, { [key]: value })
  }
  return out
}

/** Remove a shared set from the address bar once it has been applied. */
export function clearHash() {
  history.replaceState(null, '', location.pathname + location.search)
}

export function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64Url(text: string): string {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
}
