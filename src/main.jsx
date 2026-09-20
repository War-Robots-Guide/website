import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getLegacyHashPath } from './config/routes'

const legacyPath = getLegacyHashPath(window.location.pathname, window.location.hash)

if (legacyPath) {
  window.location.replace(legacyPath)
} else {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
