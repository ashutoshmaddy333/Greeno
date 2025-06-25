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

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/settings")
      if (!response.ok) throw new Error("Failed to fetch settings")
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to fetch settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.key === key ? { ...setting, value } : setting
      )
    )
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          settings.map(({ key, value }) => ({ key, value }))
        ),
      })

      if (!response.ok) throw new Error("Failed to update settings")

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
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
      const response = await fetch("/api/admin/settings?action=reset", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to reset settings")

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
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

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
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
                    checked={settings.find(s => s.key === "allowJobPosting")?.value}
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
                    value={settings.find(s => s.key === "maxJobsPerEmployer")?.value}
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
                    value={settings.find(s => s.key === "jobPostingFee")?.value}
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
                    checked={settings.find(s => s.key === "allowJobApplications")?.value}
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
                    value={settings.find(s => s.key === "maxApplicationsPerJob")?.value}
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
                    checked={settings.find(s => s.key === "requireEmailVerification")?.value}
                    onCheckedChange={(checked) =>
                      handleSettingChange("requireEmailVerification", checked)
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
                    checked={settings.find(s => s.key === "maintenanceMode")?.value}
                    onCheckedChange={(checked) =>
                      handleSettingChange("maintenanceMode", checked)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Input
                    id="maintenanceMessage"
                    value={settings.find(s => s.key === "maintenanceMessage")?.value}
                    onChange={(e) =>
                      handleSettingChange("maintenanceMessage", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
} 