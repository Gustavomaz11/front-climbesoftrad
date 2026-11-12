import { mergeConfig } from 'vite'
import applicationConfig from './vite.config'

// Browser verification uses only the synthetic _test fixture on loopback.
export default mergeConfig(applicationConfig, {
  server: {
    host: '127.0.0.1', port: 5174, strictPort: true,
    proxy: {
      '/api': { target: 'http://127.0.0.1:3301', changeOrigin: false },
      '/qa-objects': { target: 'http://127.0.0.1:3301', changeOrigin: false },
    },
  },
})
