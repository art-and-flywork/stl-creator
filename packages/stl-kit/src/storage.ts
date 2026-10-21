// localStorage that never throws: in private mode or with storage blocked,
// settings just don't persist.

export function loadStored<T>(key: string, defaults: T, merge: (defaults: T, saved: unknown) => T = defaultMerge): T {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? defaults : merge(defaults, JSON.parse(raw))
  } catch {
    return defaults
  }
}

export function saveStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  } catch {
    // storage unavailable
  }
}

function defaultMerge<T>(defaults: T, saved: unknown): T {
  return typeof defaults === 'object' && defaults && typeof saved === 'object' && saved
    ? { ...defaults, ...saved }
    : (saved as T)
}
