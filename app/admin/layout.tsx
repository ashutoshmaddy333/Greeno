"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAdmin, AdminProvider } from "@/contexts/admin-context"
import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"
import { Loader2 } from "lucide-react"
import { SessionProvider } from "next-auth/react"

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAdmin()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [isAdmin, isLoading, pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin && pathname !== "/admin/login") {
    return null
  }

  if (pathname === "/admin/login") {
    return children
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-background">{children}</main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </AdminProvider>
    </SessionProvider>
  )
} 