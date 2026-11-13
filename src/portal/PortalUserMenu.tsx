import { useState } from 'react'
import { ChevronsUpDown, LogOut, Signature } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthentication } from '@/project/features/auth/auth-context'
import { PhysicianSignatureModal } from '@/project/features/physicians/components/PhysicianSignatureModal'
import {toast} from 'sonner'

export const PortalUserMenu = () => {
  const { user,logout,refreshUser } = useAuthentication()
  const { isMobile } = useSidebar()
  const [signatureOpen,setSignatureOpen] = useState(false)
  if(!user)return null
  const initials=user.fullName.split(' ').map(name=>name[0]).slice(0,2).join('')
  return <><SidebarMenu><SidebarMenuItem><DropdownMenu><DropdownMenuTrigger asChild><SidebarMenuButton size="lg" className="rounded-lg border border-border bg-foreground/5 px-2 transition-colors hover:bg-primary/10 data-[state=open]:bg-primary/10 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-0!"><span className="relative shrink-0"><Avatar className="size-9 rounded-lg ring-2 ring-border"><AvatarFallback className="rounded-lg">{initials}</AvatarFallback></Avatar><span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-sidebar bg-emerald-500" /></span><div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden"><span className="truncate font-semibold">{user.fullName}</span><span className="truncate text-xs text-muted-foreground">{user.email || user.username}</span></div><ChevronsUpDown className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" /></SidebarMenuButton></DropdownMenuTrigger><DropdownMenuContent side={isMobile?'bottom':'right'} align="end" sideOffset={10} className="w-64 rounded-xl bg-popover/90 p-1.5 shadow-xl backdrop-blur-xl"><DropdownMenuLabel><p className="truncate">{user.fullName}</p><p className="mt-1 text-xs font-normal text-muted-foreground">{user.accessRole.name}</p></DropdownMenuLabel><DropdownMenuSeparator />{user.role==='DOCTOR' && <DropdownMenuItem onSelect={()=>setSignatureOpen(true)}><Signature />Minha assinatura</DropdownMenuItem>}<DropdownMenuItem onSelect={()=>void logout().catch(()=>toast.error('Não foi possível encerrar a sessão. Confira os avisos do laudário.'))}><LogOut />Sair do sistema</DropdownMenuItem></DropdownMenuContent></DropdownMenu></SidebarMenuItem></SidebarMenu><PhysicianSignatureModal open={signatureOpen} required={false} onClose={()=>setSignatureOpen(false)} onDone={async()=>{await refreshUser();setSignatureOpen(false)}} /></>
}
