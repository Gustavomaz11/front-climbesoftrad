import { execFileSync } from 'node:child_process'

const portal = process.env.PORTAL_KIND
if (!['sourad', 'hospital', 'configuracoes'].includes(portal)) {
  throw new Error('Configure PORTAL_KIND como sourad, hospital ou configuracoes no projeto Vercel.')
}

execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-b'], { stdio: 'inherit' })
execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--mode', portal, '--outDir', 'dist'], { stdio: 'inherit' })
