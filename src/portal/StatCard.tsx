import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export const StatCard = ({ label, value, icon: Icon, hint, loading = false, tone = 'teal' }: { label: string; value: number | string; icon: LucideIcon; hint?: string; loading?: boolean; tone?: 'teal' | 'blue' | 'amber' | 'violet' }) => <Card className="py-5 shadow-none"><CardContent className="flex items-start justify-between gap-3 px-5"><div><p className="text-[11px] font-medium text-muted-foreground">{label}</p>{loading ? <Skeleton className="mt-3 h-7 w-16" /> : <p className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-foreground">{value}</p>}{hint && <p className="mt-2.5 text-[10px] text-muted-foreground">{hint}</p>}</div><span className={cn('grid size-10 shrink-0 place-items-center rounded-xl', { teal: 'bg-teal-500/10 text-teal-600', blue: 'bg-blue-500/10 text-blue-600', amber: 'bg-amber-500/10 text-amber-600', violet: 'bg-violet-500/10 text-violet-600' }[tone])}><Icon className="size-5" strokeWidth={1.6} /></span></CardContent></Card>
