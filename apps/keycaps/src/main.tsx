import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@stl-creator/stl-kit/styles/base.css'
import '@stl-creator/stl-kit/styles/app.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
