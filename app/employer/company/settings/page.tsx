"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Building, Shield, Trash2, AlertTriangle } from "lucide-react"
import { getEmployerProfile, deleteCompanyProfile } from "@/lib/actions"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Company {
  _id: string;
  name: string;
  industry: string;
  location: string;
  size: string;
  website?: string;
  foundedYear?: string;
  description: string;
}

export default function CompanySettingsPage() {
  const { isAuthenticated, isEmployer, isLoading } = useAuth()
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployer)) {
      router.push("/login")
    }
  }, [isAuthenticated, isEmployer, isLoading, router])

  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated && isEmployer) {
        try {
          const result = await getEmployerProfile()
          if (result.success && result.company) {
            setCompany(result.company)
          } else {
            router.push("/employer")
          }
        } catch (error) {
          console.error("Error loading profile:", error)
        } finally {
          setProfileLoading(false)
        }
      }
    }

    loadProfile()
  }, [isAuthenticated, isEmployer, router])

  const handleDeleteCompany = async () => {
    if (!company) return;
    setDeleting(true)
    try {
      const result = await deleteCompanyProfile(company._id)
      if (result.success) {
        router.push("/employer")
      }
    } catch (error) {
      console.error("Error deleting company:", error)
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading || profileLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>No company profile found. Please create one first.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/employer">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
              <p className="text-muted-foreground">Manage your company preferences and account settings</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>Basic information about your company</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                    <p className="text-sm">{company.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Industry</label>
                    <p className="text-sm">{company.industry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="text-sm">{company.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Company Size</label>
                    <p className="text-sm">{company.size}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Website</label>
                    <p className="text-sm">{company.website || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Founded</label>
                    <p className="text-sm">{company.foundedYear || "Not provided"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{company.description}</p>
                </div>
                <div className="flex justify-end">
                  <Button asChild>
                    <Link href="/employer/company/profile">Edit Company Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Control how your company information is displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Privacy settings are coming soon. Currently, all company profiles are public and visible to job
                    seekers.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="space-y-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Deleting your company profile will permanently remove all associated job postings and applications.
                    This action cannot be undone.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between items-center p-4 border border-destructive rounded-lg">
                  <div>
                    <h4 className="font-medium">Delete Company Profile</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your company profile and all associated data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={deleting}>
                        Delete Company
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your company profile "
                          {company.name}" and remove all associated job postings and applications from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteCompany}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Company
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
