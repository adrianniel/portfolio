import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ViewerProvider } from './lib/viewer'

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <ViewerProvider>
      <App />
    </ViewerProvider>
  </StrictMode>
)

// The production build ships prerendered HTML; the dev server does not.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
