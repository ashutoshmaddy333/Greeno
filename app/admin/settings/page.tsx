"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AlertCircle, Save, RotateCcw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Setting {
  _id: string
  key: string
  value: any
  description: string
  category: string
  type: string
  isPublic: boolean
  updatedAt: string
}

export default function AdminSettings() {
  const { isAdmin, isLoading } = useAdmin()
  const router = useRouter()
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/admin/login")
    }
  }, [isLoading, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      fetchSettings()
    }
  }, [isAdmin])

  // Safety check to ensure settings is always an array
  const safeSettings = Array.isArray(settings) ? settings : []

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/settings")
      if (!response.ok) throw new Error("Failed to fetch settings")
      const data = await response.json()
      
      // The API returns { settings: [...] }, so we need to extract the settings array
      if (data.settings && Array.isArray(data.settings)) {
        setSettings(data.settings)
      } else {
        console.error("Invalid settings data format:", data)
        toast.error("Invalid settings data format")
        setSettings([])
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to fetch settings")
      setSettings([]) // Set empty array as fallback
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: any, isPublic?: boolean) => {
    setSettings(prev => {
      const currentSettings = Array.isArray(prev) ? prev : []
      return currentSettings.map(setting =>
        setting.key === key ? { ...setting, value, ...(isPublic !== undefined && { isPublic }) } : setting
      )
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          safeSettings.map(({ key, value }) => ({ key, value }))
        ),
      })

      if (!response.ok) throw new Error("Failed to update settings")

      const data = await response.json()
      
      // The API returns { message: "...", updatedSettings: [...] }
      if (data.updatedSettings && Array.isArray(data.updatedSettings)) {
        setSettings(data.updatedSettings)
      } else {
        // If the API doesn't return updated settings, keep the current state
        console.log("Settings updated successfully:", data.message)
      }
      
      setHasChanges(false)
      toast.success("Settings updated successfully")
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error("Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all settings to default values?")) {
      return
    }

    try {
      setSaving(true)
      const response = await fetch("/api/admin/settings", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to reset settings")

      const data = await response.json()
      
      // The API returns { message: "...", settings: [...] }
      if (data.settings && Array.isArray(data.settings)) {
        setSettings(data.settings)
      } else {
        // If the API doesn't return settings, refetch them
        await fetchSettings()
      }
      
      setHasChanges(false)
      toast.success("Settings reset to defaults")
    } catch (error) {
      console.error("Error resetting settings:", error)
      toast.error("Failed to reset settings")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-2 sm:px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Application Settings</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="grid gap-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Changes to these settings will affect the entire application. Please review carefully before saving.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Job Posting Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Job Posting</CardTitle>
                <CardDescription>Settings related to job posting functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowJobPosting">Allow Job Posting</Label>
                  <Switch
                    id="allowJobPosting"
                    checked={safeSettings.find(s => s.key === "allowJobPosting")?.value}
                    onCheckedChange={(checked) =>
                      handleSettingChange("allowJobPosting", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxJobsPerEmployer">Max Jobs per Employer</Label>
                  <Input
                    id="maxJobsPerEmployer"
                    type="number"
                    min={1}
                    value={safeSettings.find(s => s.key === "maxJobsPerEmployer")?.value}
                    onChange={(e) =>
                      handleSettingChange("maxJobsPerEmployer", parseInt(e.target.value))
                    }
                    className="w-24"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="jobPostingFee">Job Posting Fee (USD)</Label>
                  <Input
                    id="jobPostingFee"
                    type="number"
                    min={0}
                    step={0.01}
                    value={safeSettings.find(s => s.key === "jobPostingFee")?.value}
                    onChange={(e) =>
                      handleSettingChange("jobPostingFee", parseFloat(e.target.value))
                    }
                    className="w-24"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Application Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Settings related to job applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allowJobApplications">Allow Job Applications</Label>
                  <Switch
                    id="allowJobApplications"
                    checked={safeSettings.find(s => s.key === "allowJobApplications")?.value}
                    onCheckedChange={(checked) =>
                      handleSettingChange("allowJobApplications", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxApplicationsPerJob">Max Applications per Job</Label>
                  <Input
                    id="maxApplicationsPerJob"
                    type="number"
                    min={1}
                    value={safeSettings.find(s => s.key === "maxApplicationsPerJob")?.value}
                    onChange={(e) =>
                      handleSettingChange("maxApplicationsPerJob", parseInt(e.target.value))
                    }
                    className="w-24"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Settings related to user accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <Switch
                    id="requireEmailVerification"
                    checked={safeSettings.find(s => s.key === "requireEmailVerification")?.value}
                    onCheckedChange={(checked) =>
                      handleSettingChange("requireEmailVerification", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General</CardTitle>
                <CardDescription>General application settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={safeSettings.find(s => s.key === "siteName")?.value}
                    onChange={(e) =>
                      handleSettingChange("siteName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={safeSettings.find(s => s.key === "contactEmail")?.value}
                    onChange={(e) =>
                      handleSettingChange("contactEmail", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance</CardTitle>
                <CardDescription>Settings for maintenance mode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <Switch
                    id="maintenanceMode"
                    checked={safeSettings.find(s => s.key === "maintenanceMode")?.value}
                    onCheckedChange={(checked) =>
                      handleSettingChange("maintenanceMode", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Input
                    id="maintenanceMessage"
                    value={safeSettings.find(s => s.key === "maintenanceMessage")?.value}
                    onChange={(e) =>
                      handleSettingChange("maintenanceMessage", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Public Visibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Public Visibility</CardTitle>
                <CardDescription>Control which settings are visible to users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {safeSettings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <Label htmlFor={`public-${setting.key}`} className="text-sm">
                      {setting.description}
                    </Label>
                    <Switch
                      id={`public-${setting.key}`}
                      checked={setting.isPublic}
                      onCheckedChange={(checked) =>
                        handleSettingChange(setting.key, setting.value, checked)
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
} 