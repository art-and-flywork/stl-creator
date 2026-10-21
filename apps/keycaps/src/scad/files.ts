// the /scad entry, not the main one: this file also runs in the render worker
import { modelFilesFrom, parseScadDefaults } from '@stl-creator/stl-kit/scad'

// The keycap model, straight from models/keycaps. Vite inlines every
// .scad file as a string, so the app never keeps its own copy of the model.
const raw = import.meta.glob('../../../../models/keycaps/**/*.scad', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Model files keyed by their path inside models/keycaps/, e.g. "key.scad". */
export const modelFiles = modelFilesFrom(raw, 'keycaps', /\/keycaps\/images\//)

/** Plain top-level settings of a model file, so defaults match the .scad files. */
export function scadDefaults(file: string): Record<string, unknown> {
  return parseScadDefaults(modelFiles[file] ?? '')
}
