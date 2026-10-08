import fs from 'node:fs'

// Fallback empty env vars to silence HTML replacement warnings when OpenPanel is not configured
process.env.VITE_OPENPANEL_API_URL = process.env.VITE_OPENPANEL_API_URL || ''
process.env.VITE_OPENPANEL_CLIENT_ID = process.env.VITE_OPENPANEL_CLIENT_ID || ''

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import seo from './vite-plugin-seo'

// Backend target for the dev proxy. Defaults to localhost:8000 when running on
// host, or backend:8000 inside Docker Compose; overridable with VITE_PROXY_TARGET.
const isDocker = fs.existsSync('/.dockerenv')
const backend = process.env.VITE_PROXY_TARGET || (isDocker ? 'http://backend:8000' : 'http://localhost:8000')
const renderer = process.env.VITE_RENDER_TARGET || (isDocker ? 'http://renderer:3100' : 'http://localhost:3100')

const proxy = {
  '/api': { target: backend, changeOrigin: true },
  '/videos': { target: backend, changeOrigin: true },
  '/thumbnails': { target: backend, changeOrigin: true },
  '/gallery': { target: backend, changeOrigin: true },
  '/video': { target: backend, changeOrigin: true },
  '/render': { target: renderer, changeOrigin: true },
}

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
  // seo() runs on build only. It injects the crawler-visible homepage content
  // into #root and emits the static /alternatives pages, sitemap.xml and
  // llms.txt. See vite-plugin-seo.js.
  plugins: [react(), seo()],
  // The free tools (/youtube-transcript-generator and friends) are static
  // pages emitted by seo(); their behaviour ships as small standalone entries
  // with no React in them. vite-plugin-seo.js finds each entry's hashed file
  // name in the bundle and adds the <script> to its page.
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        'tool-transcript': 'tools/transcript.js',
        'tool-metadata': 'tools/metadata.js',
        'tool-vertical': 'tools/vertical.js',
      },
    },
  },
  server: {
    allowedHosts: [
      'openshorts.app',
      'www.openshorts.app'
    ],
    proxy,
  },
  preview: {
    allowedHosts: [
      'openshorts.app',
      'www.openshorts.app'
    ],
    proxy,
  }
})
