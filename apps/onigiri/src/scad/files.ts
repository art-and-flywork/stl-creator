// the /scad entry, not the main one: this file also runs in the render worker
import { modelFilesFrom, parseScadDefaults } from '@stl-creator/stl-kit/scad'

const raw = import.meta.glob('../../../../models/onigiri/**/*.scad', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const modelFiles = modelFilesFrom(raw, 'onigiri')

export const MODEL_FILE = 'onigiri.scad'

export const scadDefaults = () => parseScadDefaults(modelFiles[MODEL_FILE] ?? '')
