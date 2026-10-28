import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { motionTier } from './lib/motion.js'

// Set the motion tier from static signals before first paint (refined by a frame probe later).
motionTier()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
