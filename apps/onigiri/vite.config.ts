import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // its path on the combined site (see the catalog in packages/stl-kit)
  base: '/onigiri/',
  server: { port: 5174, strictPort: true },
  resolve: { dedupe: ['react', 'react-dom', 'three', '@react-three/fiber'] },
  worker: { format: 'es' },
  optimizeDeps: { exclude: ['openscad-wasm-prebuilt'] },
})
