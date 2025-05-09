import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['@ffmpeg/ffmpeg'],
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})
