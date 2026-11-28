import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths, so the build works on GitHub Pages (/portfolio/) or any root.
  base: './',
  plugins: [react(), tailwindcss()],
})
