/// <reference lib="webworker" />
import { serveRenders } from '@stl-creator/stl-kit/worker'
import { modelFiles } from './scad/files'

serveRenders(modelFiles, 'keychain')
