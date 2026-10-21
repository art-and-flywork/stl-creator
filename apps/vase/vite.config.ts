import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5172, strictPort: true },
  // the kit is linked from packages/; keep one copy of these
  resolve: { dedupe: ['react', 'react-dom', 'three', '@react-three/fiber'] },
  worker: { format: 'es' },
  // the OpenSCAD build is a single 11 MB ES module; no need to pre-bundle it
  optimizeDeps: { exclude: ['openscad-wasm-prebuilt'] },
})
