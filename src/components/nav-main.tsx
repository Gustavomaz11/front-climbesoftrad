"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

// Collapsed (icon-only) sidebar width, overridden from here instead of sidebar.tsx
const ICON_WIDTH = "4rem"
const DEFAULT_ICON_WIDTH = "3rem"

type MenuItem = {
  title: string
  url: string
  icon?: LucideIcon
  items?: MenuItem[]
}

// Submenu open/close animation (needs collapsible-down / collapsible-up keyframes in global CSS)
const collapseClass =
  "overflow-hidden " +
  "data-[state=open]:animate-[collapsible-down_220ms_cubic-bezier(0.32,0.72,0,1)] " +
  "data-[state=closed]:animate-[collapsible-up_180ms_ease-out]"

// Same hover + active look for parent and child items
const stateClass =
  "hover:bg-primary/10 hover:text-primary " +
  "data-[state=open]:hover:bg-primary/10 data-[state=open]:hover:text-foreground " +
  "data-[active=true]:bg-primary/10 data-[active=true]:text-foreground data-[active=true]:font-medium"

const mainButtonClass =
  "h-8 gap-3 px-3 [&>svg]:size-4.5 " +
  stateClass + " " +
  "group-data-[collapsible=icon]:size-9! " +
  "group-data-[collapsible=icon]:mx-auto " +
  "group-data-[collapsible=icon]:p-0! " +
  "group-data-[collapsible=icon]:justify-center " +
  "group-data-[collapsible=icon]:gap-0 " +
  "group-data-[collapsible=icon]:[&>span]:hidden"

const subButtonClass = "h-7 px-3 " + stateClass

// Pages that open in a new tab (matches the route paths in your router)
const NEW_TAB_PREFIXES = ["auth/", "error/"]

const linkProps = (url: string) =>
  NEW_TAB_PREFIXES.some((p) => url.replace(/^\//, "").startsWith(p))
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {}

export function NavMain({ items }: { items: MenuItem[] }) {
  const location = useLocation()
  const { isMobile, setOpenMobile, state } = useSidebar()
  const anchorRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  // Override --sidebar-width-icon on the SidebarProvider wrapper
  useLayoutEffect(() => {
    const wrapper = anchorRef.current?.closest<HTMLElement>(
      '[data-slot="sidebar-wrapper"], .group\\/sidebar-wrapper'
    )
    if (!wrapper) return

    const previous = wrapper.style.getPropertyValue("--sidebar-width-icon")
    wrapper.style.setProperty("--sidebar-width-icon", ICON_WIDTH)

    return () => {
      wrapper.style.setProperty(
        "--sidebar-width-icon",
        previous || DEFAULT_ICON_WIDTH
      )
    }
  }, [])

  // Hover anywhere on the sidebar (header, nav, footer, empty space)
  useLayoutEffect(() => {
    const container = anchorRef.current?.closest<HTMLElement>(
      '[data-slot="sidebar-container"]'
    )
    if (!container) return

    const enter = () => setHovered(true)
    const leave = () => setHovered(false)
    container.addEventListener("mouseenter", enter)
    container.addEventListener("mouseleave", leave)

    return () => {
      container.removeEventListener("mouseenter", enter)
      container.removeEventListener("mouseleave", leave)
    }
  }, [])

  // While collapsed + hovered, make the whole sidebar behave as expanded
  useLayoutEffect(() => {
    const root = anchorRef.current?.closest<HTMLElement>(
      '[data-slot="sidebar"]'
    )
    if (!root || isMobile) return

    const gap = root.querySelector<HTMLElement>('[data-slot="sidebar-gap"]')
    const container = root.querySelector<HTMLElement>(
      '[data-slot="sidebar-container"]'
    )
    const expand = state === "collapsed" && hovered

    // "" removes the icon-mode styles; "icon" restores them
    root.setAttribute(
      "data-collapsible",
      state === "collapsed" && !expand ? "icon" : ""
    )

    // keep page layout from shifting (sidebar overlays the content)
    if (gap) gap.style.width = expand ? "var(--sidebar-width-icon)" : ""
    if (container) {
      container.style.boxShadow = expand
        ? "0 10px 30px -10px rgb(0 0 0 / 0.25)"
        : ""
      container.style.zIndex = expand ? "50" : ""
    }

    return () => {
      if (gap) gap.style.width = ""
      if (container) {
        container.style.boxShadow = ""
        container.style.zIndex = ""
      }
    }
  }, [hovered, state, isMobile])

  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false)
  }

  const isActiveRoute = (url: string) =>
    location.pathname.startsWith('/' + url.replace(/^\//, ''))

  const renderMenuItems = (menuItems: MenuItem[]) => {
    return menuItems.map((item) => {
      const hasChildren = item.items && item.items.length > 0

      const isParentActive =
        hasChildren &&
        item.items!.some((sub) => {
          if (isActiveRoute(sub.url)) return true
          if (sub.items) {
            return sub.items.some((child) => isActiveRoute(child.url))
          }
          return false
        })

      // no tooltip while the sidebar is hover-expanded
      const tooltip = hovered ? undefined : item.title

      if (!hasChildren) {
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={tooltip}
              isActive={isActiveRoute(item.url)}
              className={mainButtonClass}
            >
              <Link to={item.url} onClick={closeOnMobile} {...linkProps(item.url)}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      }

      return (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={isParentActive}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                tooltip={tooltip}
                isActive={isParentActive}
                className={mainButtonClass}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto !size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent className={collapseClass}>
              <SidebarMenuSub>
                {item.items?.map((subItem) =>
                  subItem.items ? (
                    <SidebarMenuSubItem key={subItem.title}>
                      <Collapsible
                        className="group/sub"
                        defaultOpen={subItem.items.some((child) =>
                          isActiveRoute(child.url)
                        )}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuSubButton className={subButtonClass}>
                            <span>{subItem.title}</span>
                            <ChevronRight className="ml-auto !size-3.5 transition-transform duration-200 group-data-[state=open]/sub:rotate-90" />
                          </SidebarMenuSubButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent className={collapseClass}>
                          <SidebarMenuSub>
                            {subItem.items.map((child) => (
                              <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isActiveRoute(child.url)}
                                  className={subButtonClass}
                                >
                                  <Link to={child.url} onClick={closeOnMobile} {...linkProps(child.url)}>
                                    <span>{child.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuSubItem>
                  ) : (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={isActiveRoute(subItem.url)}
                        className={subButtonClass}
                      >
                        <Link to={subItem.url} onClick={closeOnMobile} {...linkProps(subItem.url)}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    })
  }

  return (
    <div ref={anchorRef} className="contents">
      <SidebarGroup className="group-data-[collapsible=icon]:px-0">
        <SidebarMenu>{renderMenuItems(items)}</SidebarMenu>
      </SidebarGroup>
    </div>
  )
}
