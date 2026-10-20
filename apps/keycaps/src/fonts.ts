// Google Fonts via Fontsource: a JSON list of every family, and static TTF
// files on jsDelivr. Both send CORS headers, and OpenSCAD's FreeType reads
// TTF directly (the Google Fonts CSS API serves WOFF2 to browsers).

export interface FontFamily {
  id: string
  family: string
  category: string
  weights: number[]
  styles: string[]
  subsets: string[]
  defSubset: string
}

export interface FontChoice {
  id: string
  family: string
  weight: number
  italic: boolean
}

export interface LoadedFont {
  bytes: Uint8Array
  /** Font name for OpenSCAD's text(), e.g. "Roboto Mono:style=Bold". */
  scadName: string
  /** Family registered with document.fonts, for previews in the UI. */
  cssFamily: string
}

export const DEFAULT_FONT: FontChoice = {
  id: 'noto-sans-mono',
  family: 'Noto Sans Mono',
  weight: 400,
  italic: false,
}

let listPromise: Promise<FontFamily[]> | null = null

export function fetchFontList(): Promise<FontFamily[]> {
  listPromise ??= fetch('https://api.fontsource.org/v1/fonts?type=google')
    .then((response) => {
      if (!response.ok) throw new Error(`Font list: HTTP ${response.status}`)
      return response.json() as Promise<FontFamily[]>
    })
    .catch((error) => {
      listPromise = null
      throw error
    })
  return listPromise
}

const cache = new Map<string, Promise<LoadedFont>>()

export function loadFont(choice: FontChoice, subset = 'latin'): Promise<LoadedFont> {
  const style = choice.italic ? 'italic' : 'normal'
  const url = `https://cdn.jsdelivr.net/fontsource/fonts/${choice.id}@latest/${subset}-${choice.weight}-${style}.ttf`
  let promise = cache.get(url)
  if (!promise) {
    promise = fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`${choice.family} ${choice.weight}: HTTP ${response.status}`)
        return response.arrayBuffer()
      })
      .then(async (buffer) => {
        const bytes = new Uint8Array(buffer)
        const { family, subfamily } = readFontNames(bytes)
        const cssFamily = `legend-${choice.id}-${choice.weight}-${style}`
        const face = new FontFace(cssFamily, buffer.slice(0))
        document.fonts.add(await face.load())
        return { bytes, scadName: `${family}:style=${subfamily}`, cssFamily }
      })
    promise.catch(() => cache.delete(url))
    cache.set(url, promise)
  }
  return promise
}

/**
 * Family and style from the font's own `name` table. Fontconfig matches on
 * these, not on the Fontsource id, so they have to be exact.
 */
export function readFontNames(bytes: Uint8Array): { family: string; subfamily: string } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const numTables = view.getUint16(4)
  let nameOffset = -1
  for (let i = 0; i < numTables; i++) {
    const record = 12 + i * 16
    const tag = String.fromCharCode(...bytes.subarray(record, record + 4))
    if (tag === 'name') nameOffset = view.getUint32(record + 8)
  }
  if (nameOffset < 0) throw new Error('Font has no name table')

  const count = view.getUint16(nameOffset + 2)
  const strings = nameOffset + view.getUint16(nameOffset + 4)
  const names = new Map<number, string>()
  for (let i = 0; i < count; i++) {
    const r = nameOffset + 6 + i * 12
    const platform = view.getUint16(r)
    const nameId = view.getUint16(r + 6)
    const length = view.getUint16(r + 8)
    const start = strings + view.getUint16(r + 10)
    const raw = bytes.subarray(start, start + length)
    if (platform === 3) {
      // Windows: UTF-16BE, preferred
      let text = ''
      for (let j = 0; j + 1 < raw.length; j += 2) text += String.fromCharCode((raw[j] << 8) | raw[j + 1])
      names.set(nameId, text)
    } else if (platform === 1 && !names.has(nameId)) {
      names.set(nameId, String.fromCharCode(...raw))
    }
  }
  return { family: names.get(1) ?? 'Unknown', subfamily: names.get(2) ?? 'Regular' }
}

const STORAGE_KEY = 'keycap-stl:font'

export function loadFontChoice(): FontChoice {
  try {
    return { ...DEFAULT_FONT, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  } catch {
    return DEFAULT_FONT
  }
}

export function saveFontChoice(choice: FontChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choice))
  } catch {
    // storage unavailable
  }
}
