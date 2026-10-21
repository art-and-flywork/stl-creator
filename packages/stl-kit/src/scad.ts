// Talking to OpenSCAD from JS: literals for -D overrides, and the plain
// top-level settings of a .scad file, so UI defaults follow the model.

/** OpenSCAD literal for a JS value. JSON string escaping matches OpenSCAD's. */
export function toScad(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(toScad).join(', ')}]`
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  throw new Error(`Cannot pass ${String(value)} to OpenSCAD`)
}

/**
 * Model files from an `import.meta.glob` over `models/<folder>/`, keyed by
 * their path inside that folder, e.g. "layouts/sofle.scad".
 */
export function modelFilesFrom(raw: Record<string, string>, folder: string, skip?: RegExp): Record<string, string> {
  const prefix = new RegExp(`^.*?/${folder}/`)
  return Object.fromEntries(
    Object.entries(raw)
      .filter(([path]) => !skip?.test(path))
      .map(([path, source]) => [path.replace(prefix, ''), source]),
  )
}

/**
 * Top-level assignments (`name = value;`) whose value is valid JSON: numbers,
 * booleans, strings and (nested) lists, also over several lines.
 */
export function parseScadDefaults(source: string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const match of source.matchAll(/^([a-z_]\w*)\s*=\s*/gim)) {
    const value = readValue(source, match.index + match[0].length)
    if (value === null) continue
    try {
      out[match[1]] = JSON.parse(value)
    } catch {
      // not a plain value (expression, function call)
    }
  }
  return out
}

/** Text up to the `;` that ends the statement, skipping strings and comments. */
function readValue(source: string, start: number): string | null {
  let text = ''
  for (let i = start; i < source.length; i++) {
    const ch = source[i]
    if (ch === '"') {
      const end = stringEnd(source, i)
      text += source.slice(i, end + 1)
      i = end
    } else if (ch === '/' && source[i + 1] === '/') {
      i = source.indexOf('\n', i) - 1
      if (i < 0) return null
    } else if (ch === ';') {
      return text.trim()
    } else {
      text += ch
    }
  }
  return null
}

function stringEnd(source: string, open: number): number {
  for (let i = open + 1; i < source.length; i++) {
    if (source[i] === '\\') i++
    else if (source[i] === '"') return i
  }
  return source.length
}
