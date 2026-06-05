import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isCapacitor = process.env.BUILD_TARGET === 'capacitor'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isCapacitor ? './' : '/Woori/',
  server: { port: 5174 },
  build: {
    outDir: isCapacitor
      ? path.resolve(__dirname, 'dist')
      : path.resolve(__dirname, '../docs'),
    emptyOutDir: true,
  },
})
