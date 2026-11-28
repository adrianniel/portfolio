import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { ViewerProvider } from './lib/viewer'

/** Renders the page to HTML at build time (see scripts/prerender.mjs). */
export function render() {
  return renderToString(
    <StrictMode>
      <ViewerProvider>
        <App />
      </ViewerProvider>
    </StrictMode>,
  )
}
