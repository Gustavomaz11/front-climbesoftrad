import { createHash } from 'node:crypto'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { getPortalBrand } from './src/project/config/portal-brand.ts'

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // hash-wasm uses WebAssembly to checksum uploads without reading the whole file into memory.
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' http://localhost:3000 ws: wss: https:",
  "frame-src 'self' blob: http://localhost:8050 https:",
  "worker-src 'self' blob:",
].join('; ')

const securityHeaders = {
  'Content-Security-Policy': contentSecurityPolicy,
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), geolocation=(), microphone=()',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}

// Allow only React's Fast Refresh preamble during development.
const reactPreambleHash = createHash('sha256')
  .update(react.preambleCode.replace('__BASE__', '/'))
  .digest('base64')
const developmentScriptPolicy = `script-src 'self' 'wasm-unsafe-eval' 'sha256-${reactPreambleHash}'`
const developmentContentSecurityPolicy = contentSecurityPolicy.replace(
  "script-src 'self' 'wasm-unsafe-eval'",
  developmentScriptPolicy,
)

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const environment = loadEnv(mode, process.cwd(), 'VITE_')
  const apiUrl = environment.VITE_API_URL || '/api/v1'
  const configuredApi = /^https?:\/\//.test(apiUrl) ? new URL(apiUrl) : null
  const proxyTarget = configuredApi?.origin || environment.VITE_API_PROXY_TARGET || 'https://api-climbesoftrad.onrender.com'
  // Local pages use a same-origin proxy; production builds use the public API URL.
  const browserApiUrl = command === 'serve' && configuredApi ? configuredApi.pathname : apiUrl
  return {
    cacheDir: `node_modules/.vite-${mode}`,
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)),

      },
    },
    define: {
      'import.meta.env.VITE_PORTAL_KIND': JSON.stringify(
        mode === 'configuracoes' ? 'configuracoes' : mode === 'hospital' ? 'hospital' : 'sourad',
      ),
      'import.meta.env.VITE_API_URL': JSON.stringify(browserApiUrl),
      'import.meta.env.VITE_SOURAD_URL': JSON.stringify(command === 'serve' ? 'http://localhost:5173' : environment.VITE_SOURAD_URL || 'https://climbesoftrad.vercel.app'),
      'import.meta.env.VITE_HOSPITAL_URL': JSON.stringify(command === 'serve' ? 'http://localhost:5174' : environment.VITE_HOSPITAL_URL || 'https://hospital-climbesoftrad.vercel.app'),
      'import.meta.env.VITE_CONFIGURACOES_URL': JSON.stringify(command === 'serve' ? 'http://localhost:5175' : environment.VITE_CONFIGURACOES_URL || 'https://gestao-climbesoftrad.vercel.app'),
    },
    build: {
      outDir: ['hospital', 'sourad', 'configuracoes'].includes(mode) ? `dist-${mode}` : 'dist',
    },
    plugins: [
      {
        name: 'portal-brand',
        transformIndexHtml: (html) =>
          html
            .replace('<title>ClimbeSoftRad</title>', `<title>${getPortalBrand(mode).name}</title>`)
            .replace(
              'ClimbeSoftRad: recebimento de exames DICOM e elaboração de laudos.',
              getPortalBrand(mode).description,
            ),
      },
      react(),
      tailwindcss(),
      {
        name: 'development-react-csp',
        apply: 'serve',
        transformIndexHtml: (html) =>
          html.replace("script-src 'self' 'wasm-unsafe-eval'", developmentScriptPolicy),
      },
    ],
    server: {
      headers: {
        ...securityHeaders,
        'Content-Security-Policy': developmentContentSecurityPolicy,
      },
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          // The proxy is the HTTPS API's client; browser requests remain same-origin locally.
          ...(proxyTarget.startsWith('https:') ? { headers: { Origin: proxyTarget } } : {}),
        },
      },
    },
    preview: {
      headers: securityHeaders,
    },
  }
})
