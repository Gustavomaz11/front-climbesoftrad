import { Activity } from 'lucide-react'
import { brand } from '@/project/config/brand'

export const PortalBrand = ({ compact = false }: { compact?: boolean; light?: boolean }) => <div className="flex items-center gap-2"><div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white"><Activity className="size-4" /></div>{!compact && <div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-medium">{brand.name}</span><span className="mt-0.5 truncate text-xs">{brand.productLabel}</span></div>}</div>
