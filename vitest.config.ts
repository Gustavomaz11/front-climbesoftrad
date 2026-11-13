import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { include: ['src/project/**/*.test.{ts,tsx}', 'src/portal/**/*.test.{ts,tsx}'] },
})
