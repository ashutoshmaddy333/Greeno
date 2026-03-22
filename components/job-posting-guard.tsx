"use client"

import { useSettings } from "@/contexts/settings-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface JobPostingGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function JobPostingGuard({ children, fallback }: JobPostingGuardProps) {
  const { settings, loading } = useSettings()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!settings?.allowJobPosting) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Job Posting Disabled</AlertTitle>
        <AlertDescription>
          Job posting is currently disabled. Please check back later or contact support for more information.
        </AlertDescription>
      </Alert>
    )
  }

  return <>{children}</>
} 