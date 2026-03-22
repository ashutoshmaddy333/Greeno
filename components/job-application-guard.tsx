"use client"

import { useSettings } from "@/contexts/settings-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface JobApplicationGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function JobApplicationGuard({ children, fallback }: JobApplicationGuardProps) {
  const { settings, loading } = useSettings()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!settings?.allowJobApplications) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Job Applications Disabled</AlertTitle>
        <AlertDescription>
          Job applications are currently disabled. Please check back later or contact support for more information.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
} 