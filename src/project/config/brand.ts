import { getPortalBrand } from './portal-brand'

export const brand = getPortalBrand(import.meta.env.VITE_PORTAL_KIND)
