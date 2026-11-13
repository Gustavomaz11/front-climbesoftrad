import { Link } from 'react-router-dom'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NavMain } from '@/components/nav-main'
import { useAuthentication } from '@/project/features/auth/auth-context'
import { PortalBrand } from '@/portal/PortalBrand'
import { NavUser } from '@/components/nav-user'
import { canAccessPortal } from '@/project/features/auth/portal-access'
import { portalKind, portalLinks, portalNavigation } from '@/portal/portal-navigation'

export const AppSidebar = () => {
  const { user } = useAuthentication()
  if(!user)return null
  const items=portalNavigation(user).map(item=>({title:item.label,url:item.to,icon:item.icon,items: item.to.endsWith('/list') ? [{title:'Cadastrados',url:item.to},{title:'Cadastrar',url:item.to.replace('/list','/new')}] : undefined}))
  const areas=portalLinks.filter(item=>item.kind!==portalKind && canAccessPortal(user, item.kind))
  return <Sidebar collapsible="icon" className="portal-chrome z-50">
    <SidebarHeader className="h-16 justify-center border-b"><Link to="/dashboard" className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:justify-center"><span className="group-data-[collapsible=icon]:hidden"><PortalBrand /></span><span className="hidden group-data-[collapsible=icon]:block"><PortalBrand compact /></span></Link></SidebarHeader>
    <SidebarContent className="overflow-hidden"><ScrollArea className="h-full"><div className="flex min-h-full flex-col px-2"><NavMain items={items} /><SidebarGroup><SidebarGroupLabel>Áreas do sistema</SidebarGroupLabel><SidebarMenu>{areas.map(({name,url,icon:Icon})=><SidebarMenuItem key={name}><SidebarMenuButton asChild tooltip={name} className="h-8 gap-3 px-3 [&>svg]:size-4.5"><a href={url}><Icon /><span>{name}</span></a></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroup></div></ScrollArea></SidebarContent>
    <SidebarFooter className="h-16 justify-center border-t"><NavUser /></SidebarFooter>
  </Sidebar>
}
