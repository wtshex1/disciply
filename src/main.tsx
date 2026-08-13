import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { isTauri } from '@tauri-apps/api/core'
import './styles.css'
import './theme'
import { migrateFromStorage } from './db'
import App from './App'

declare global {
  interface Window {
    __toggleMockup?: () => void
  }
}

migrateFromStorage()

const inTauri = isTauri()

if (inTauri || window.matchMedia('(max-width: 520px)').matches) {
  document.documentElement.classList.add('app-mode')
} else {
  document.documentElement.classList.add('standalone')
}

window.__toggleMockup = () => {
  document.documentElement.classList.toggle('app-mode')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
