import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    react(),
    viteStaticCopy({
      targets: [
        { src: 'scripts/background.js', dest: '' },
        { src: 'scripts/content.js', dest: '' },
        { src: 'scripts/content_spotify.js', dest: '' },
        { src: 'public/manifest.json', dest: '' },
        { src: 'public/icon128.png', dest: '' }
      ]
    })
  ],
  server: {
    proxy: {
      '/geocode': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/geocode/, '')
      }
    }
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  }
})
