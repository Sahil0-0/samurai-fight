import { defineConfig } from 'vite'

export default defineConfig({
  // Relative base so a production build can be dropped on itch.io, GitHub
  // Pages, or any subpath without rewriting asset URLs.
  base: './',
  server: {
    open: true
  },
  build: {
    outDir: 'dist',
    // Sprite sheets must stay as real files under dist/img so the './img/...'
    // paths in the character data keep resolving. Vite copies public/ verbatim.
    assetsDir: 'assets'
  }
})
