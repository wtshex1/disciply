import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
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

window.__toggleMockup = () => {
  document.documentElement.classList.toggle('app-mode')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
