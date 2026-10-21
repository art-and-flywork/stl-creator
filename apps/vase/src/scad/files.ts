// the /scad entry, not the main one: this file also runs in the render worker
import { modelFilesFrom, parseScadDefaults } from '@stl-creator/stl-kit/scad'

// The vase model, straight from models/vase, inlined by Vite.
const raw = import.meta.glob('../../../../models/vase/**/*.scad', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const modelFiles = modelFilesFrom(raw, 'vase')

export const MODEL_FILE = 'vase.scad'

export const scadDefaults = () => parseScadDefaults(modelFiles[MODEL_FILE] ?? '')
