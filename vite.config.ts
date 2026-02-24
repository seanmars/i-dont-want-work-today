import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  base: '/i-dont-want-work-today/',
  build: {
    outDir: 'docs',
    assetsDir: '',
    rollupOptions: {
      output: {
        chunkFileNames: '[name].js',
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
})
