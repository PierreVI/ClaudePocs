import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Actions runners set GITHUB_ACTIONS=true; only prefix the base path
  // there so local dev keeps serving from '/'.
  base: process.env.GITHUB_ACTIONS ? '/ClaudePocs/' : '/',
  plugins: [react(), tailwindcss()],
})
