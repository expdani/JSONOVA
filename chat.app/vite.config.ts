import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import checker from 'vite-plugin-checker'
import fs from 'fs'

const aliasses = fs
    .readdirSync('src', { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => ({
        find: dirent.name,
        replacement: path.resolve('src', dirent.name),
    }));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    jsxImportSource: '@emotion/react',
}),
  checker({
    overlay: false,
    typescript: true,
    eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint src/**/*.tsx src/**/*.ts',
    },
  })],
  resolve: {
    alias: aliasses,
  },
  server: {
    port: 3000,
    proxy: {
      '/ws': {
        target: 'ws://localhost:3002',
        ws: true,
      },
    },
  },
})
