// the /scad entry, not the main one: this file also runs in the render worker
import { modelFilesFrom, parseScadDefaults } from '@stl-creator/stl-kit/scad'

// The keychain model, straight from models/keychain, inlined by Vite.
const raw = import.meta.glob('../../../../models/keychain/**/*.scad', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export const modelFiles = modelFilesFrom(raw, 'keychain')

export const MODEL_FILE = 'keychain.scad'

export const scadDefaults = () => parseScadDefaults(modelFiles[MODEL_FILE] ?? '')
