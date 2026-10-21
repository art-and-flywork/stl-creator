import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5170, strictPort: true },
  // the kit is linked from packages/; keep one copy of these
  resolve: { dedupe: ['react', 'react-dom'] },
})
