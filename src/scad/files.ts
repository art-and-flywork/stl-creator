// The keycap model, straight from the keycaps/ submodule. Vite inlines every
// .scad file as a string, so the app never keeps its own copy of the model.
const raw = import.meta.glob('../../keycaps/**/*.scad', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Model files keyed by their path inside keycaps/, e.g. "key.scad". */
export const modelFiles: Record<string, string> = Object.fromEntries(
  Object.entries(raw)
    .filter(([path]) => !path.includes('/keycaps/images/'))
    .map(([path, source]) => [path.replace(/^.*?\/keycaps\//, ''), source]),
)

/**
 * Top-level assignments that fit on one line (`name = value;`) and whose value
 * is valid JSON: numbers, booleans, strings and flat lists. That covers every
 * setting the UI exposes, so the defaults always match the .scad files.
 */
export function scadDefaults(file: string): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const source = modelFiles[file] ?? ''
  for (const match of source.matchAll(/^([a-z_]\w*)\s*=\s*([^;\n]+);/gim)) {
    try {
      out[match[1]] = JSON.parse(match[2].trim())
    } catch {
      // not a plain value (expression, function call, multi-line list)
    }
  }
  return out
}
