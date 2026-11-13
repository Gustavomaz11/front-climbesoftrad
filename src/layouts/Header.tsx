import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, Building2, ChevronDown, Grid2X2Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { useAuthentication } from '@/project/features/auth/auth-context'
import { WorkspaceContextBar } from '@/project/features/companies/WorkspaceContextBar'
import { listWorkflowNotifications } from '@/project/features/exam-workflow/workflow-api'
import type { WorkflowNotification } from '@/project/features/exam-workflow/workflow.types'
import { portalKind, portalLinks, portalNavigation } from '@/portal/portal-navigation'

const Header = () => {
  const { user } = useAuthentication()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false), [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    const onKey = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key === 'k') { event.preventDefault(); setSearchOpen(value => !value) } }
    window.addEventListener('scroll', onScroll); window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('keydown', onKey) }
  }, [])
  const canViewNotifications = portalKind === 'sourad' && Boolean(user?.permissions.includes('exams.view'))
  useEffect(() => {
    if (!canViewNotifications) return
    let active = true
    const load = () => void listWorkflowNotifications().then(items => { if (active) setNotifications(items) }).catch(() => {})
    load(); const timer = setInterval(load, 30000)
    return () => { active = false; clearInterval(timer) }
  }, [canViewNotifications, user?.id, user?.activeCompany?.selectedUnitId])
  if (!user) return null
  const items = portalNavigation(user)
  const selectedUnit = user.companies.find(company => company.id === user.activeCompany?.id)?.units.find(unit => unit.id === user.activeCompany?.selectedUnitId)
  return <>
    <header className={cn('portal-chrome sticky top-0 z-40 flex h-16 w-full shrink-0 items-center gap-2 border-b px-4 transition-all duration-200', scrolled ? 'bg-background/80 shadow-md backdrop-blur-sm supports-backdrop-filter:bg-background/60' : 'bg-background/0 supports-backdrop-filter:bg-background/0')}>
      <div className="flex items-center gap-1"><SidebarTrigger aria-label="Alternar navegação" className="-ml-1 h-9 w-9 transition-colors [&_svg]:size-5!" /><div className="hidden items-center gap-1 md:flex">{items.slice(0, 3).map(({ label, to }) => <Button key={to} variant="ghost" asChild><NavLink to={to} className={({ isActive }) => cn(isActive && 'bg-accent text-accent-foreground')}>{label}</NavLink></Button>)}</div></div>
      <div className="ml-auto flex items-center gap-1">
        {portalKind !== 'configuracoes' && <Popover><PopoverTrigger asChild><Button variant="ghost" className="h-9 gap-2" aria-label="Selecionar hospital de origem"><Building2 className="size-4.5" /><span className="hidden max-w-40 truncate text-xs xl:block">{selectedUnit?.name || 'Hospitais autorizados'}</span><ChevronDown className="hidden size-3 xl:block" /></Button></PopoverTrigger><PopoverContent align="end" className="w-80"><WorkspaceContextBar compact /></PopoverContent></Popover>}
        <Button variant="ghost" size="icon" className="size-9" aria-label="Buscar no sistema" onClick={() => setSearchOpen(true)}><Search className="size-5" /></Button><ThemeToggle />
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="hidden size-9 sm:inline-flex" aria-label="Idioma: Português do Brasil"><span className="text-base">🇧🇷</span></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Idioma</DropdownMenuLabel><DropdownMenuItem>Português do Brasil</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="size-9" aria-label="Áreas do sistema"><Grid2X2Plus className="size-5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-60"><DropdownMenuLabel>Áreas do sistema</DropdownMenuLabel><DropdownMenuSeparator />{portalLinks.filter(item => item.kind !== 'configuracoes' || user.role === 'ADMIN' || user.permissions.some(permission => /^(physicians|units|roles|users)\./.test(permission))).map(({ name, url, icon: Icon, kind }) => <DropdownMenuItem key={name} asChild><a href={kind === portalKind ? '/dashboard' : url}><Icon />{name}</a></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="relative size-9" aria-label="Notificações"><Bell className="size-5" />{notifications.filter(item => !item.seen_at).length > 0 && <span className="absolute -top-0.5 -right-0.5 rounded-full bg-rose-500 px-1 text-[10px] leading-4 text-white">{notifications.filter(item => !item.seen_at).length}</span>}</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-80"><DropdownMenuLabel>Notificações</DropdownMenuLabel><DropdownMenuSeparator />{notifications.slice(0, 5).map(item => <DropdownMenuItem key={item.id} onSelect={() => navigate('/dashboard')} className="block py-3"><p className="text-xs font-medium">{item.patient_name}</p><p className="mt-1 text-xs text-muted-foreground">{item.reason}</p></DropdownMenuItem>)}{!notifications.length && <p className="px-3 py-5 text-xs text-muted-foreground">Nenhuma notificação de pendência para exibir.</p>}</DropdownMenuContent></DropdownMenu>
      </div>
    </header>
    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}><CommandInput placeholder="Buscar páginas e configurações…" /><CommandList><CommandEmpty>Nenhuma página encontrada.</CommandEmpty><CommandGroup heading="Navegação">{items.map(({ label, to, icon: Icon }) => <CommandItem key={to} onSelect={() => { navigate(to); setSearchOpen(false) }}><Icon />{label}</CommandItem>)}</CommandGroup></CommandList></CommandDialog>
  </>
}

export default Header
