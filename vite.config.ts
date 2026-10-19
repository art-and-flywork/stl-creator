import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: { format: 'es' },
  // the OpenSCAD build is a single 11 MB ES module; no need to pre-bundle it
  optimizeDeps: { exclude: ['openscad-wasm-prebuilt'] },
})
