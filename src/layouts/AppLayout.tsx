import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"

import { AppSidebar } from "@/components/app-sidebar"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import Header from "@/layouts/Header"
import Footer from "@/layouts/Footer"

export default function AppLayout() {
  const [open, setOpen] = useState(true)

  // Collapse sidebar on smaller screens, expand on large ones
  useEffect(() => {
    const handleResize = () => setOpen(window.innerWidth >= 1024)

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar />

      <SidebarInset className="min-w-0">
        <Header />

        <main className="portal-main flex-1 p-4">
          <Outlet />
        </main>

        <Footer />

      </SidebarInset>
    </SidebarProvider>
  )
}
