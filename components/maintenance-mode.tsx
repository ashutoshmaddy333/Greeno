"use client"

import { useSettings } from "@/contexts/settings-context"
import { usePathname } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function MaintenanceMode() {
  const { settings, loading } = useSettings()
  const pathname = usePathname()

  // Don't show maintenance mode on admin routes
  const isAdminRoute = pathname?.startsWith('/admin')
  
  if (loading || !settings?.maintenanceMode || isAdminRoute) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-md mx-auto p-6">
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Maintenance Mode</AlertTitle>
          <AlertDescription>
            {settings.maintenanceMessage || "The site is currently under maintenance. Please check back later."}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
} 