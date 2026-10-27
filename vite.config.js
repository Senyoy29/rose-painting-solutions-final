import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' keeps every asset path relative, so the built site works from
// any folder or sub-path (Netlify, Vercel, cPanel hosting, a USB stick…).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssMinify: true,
    sourcemap: false,
  },
})
