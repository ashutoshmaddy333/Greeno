"use client"

import { useSettings } from "@/contexts/settings-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Info } from "lucide-react"

interface SettingsDisplayProps {
  showAll?: boolean
  className?: string
}

export function SettingsDisplay({ showAll = false, className = "" }: SettingsDisplayProps) {
  const { settings, loading } = useSettings()

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Loading system settings...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!settings) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Unable to load system settings</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const publicSettings = showAll ? settings : {
    allowJobPosting: settings.allowJobPosting,
    allowJobApplications: settings.allowJobApplications,
    maintenanceMode: settings.maintenanceMode,
    siteName: settings.siteName,
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          System Status
        </CardTitle>
        <CardDescription>Current system configuration and status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Job Posting</span>
            <Badge variant={settings.allowJobPosting ? "default" : "secondary"}>
              {settings.allowJobPosting ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Disabled
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Job Applications</span>
            <Badge variant={settings.allowJobApplications ? "default" : "secondary"}>
              {settings.allowJobApplications ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Disabled
                </>
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Maintenance Mode</span>
            <Badge variant={settings.maintenanceMode ? "destructive" : "default"}>
              {settings.maintenanceMode ? (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>

          {showAll && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Verification</span>
                <Badge variant={settings.requireEmailVerification ? "default" : "secondary"}>
                  {settings.requireEmailVerification ? "Required" : "Optional"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Max Jobs per Employer</span>
                <Badge variant="outline">{settings.maxJobsPerEmployer}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Max Applications per Job</span>
                <Badge variant="outline">{settings.maxApplicationsPerJob}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Job Posting Fee</span>
                <Badge variant="outline">${settings.jobPostingFee}</Badge>
              </div>
            </>
          )}
        </div>

        {settings.maintenanceMode && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Maintenance Notice:</strong> {settings.maintenanceMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 