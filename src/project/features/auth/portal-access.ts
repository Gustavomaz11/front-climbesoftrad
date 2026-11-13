import type { AuthenticatedUser } from './auth.types'

export const portalKinds = ['sourad', 'hospital', 'configuracoes'] as const
export type PortalKind = (typeof portalKinds)[number]
export const currentPortal = (import.meta.env.VITE_PORTAL_KIND || 'sourad') as PortalKind
export const portalNames: Record<PortalKind, string> = { sourad: 'ClimbeSoftRad', hospital: 'Hospital', configuracoes: 'Gestão' }
export const canAccessPortal = (user: AuthenticatedUser | null, portal: string = currentPortal) =>
  Boolean(user && (user.isPlatformAdmin || user.allowedPortals?.includes(portal as PortalKind)))
export const portalAccessLabel = (portals: PortalKind[] = []) => portals.map(p => portalNames[p]).join(' · ') || 'Nenhum portal autorizado'
