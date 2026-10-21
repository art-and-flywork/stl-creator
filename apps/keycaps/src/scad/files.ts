// The keycap model, straight from models/keycaps. Vite inlines every
// .scad file as a string, so the app never keeps its own copy of the model.
const raw = import.meta.glob('../../../../models/keycaps/**/*.scad', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Model files keyed by their path inside models/keycaps/, e.g. "key.scad". */
export const modelFiles: Record<string, string> = Object.fromEntries(
  Object.entries(raw)
    .filter(([path]) => !path.includes('/keycaps/images/'))
    .map(([path, source]) => [path.replace(/^.*?\/keycaps\//, ''), source]),
)

/**
 * Top-level assignments (`name = value;`) whose value is valid JSON: numbers,
 * booleans, strings and (nested) lists, also over several lines. That covers
 * every setting the UI exposes, so the defaults always match the .scad files.
 */
export function scadDefaults(file: string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const source = modelFiles[file] ?? ''
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
