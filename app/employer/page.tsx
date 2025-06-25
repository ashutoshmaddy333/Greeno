"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Building, Plus, Users, Eye, Settings, Briefcase, MapPin, Globe, Edit, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { CreateCompanyForm } from "@/components/create-company-form"
import { getEmployerProfile } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { getLogoUrl } from "@/lib/utils"

interface Company {
  _id: string
  name: string
  description: string
  website?: string
  industry: string
  size: string
  location: string
  foundedYear?: number
  logo?: string
  jobs: any[]
}

interface Stats {
  activeJobs: number
  totalApplications: number
  viewsToday: number
  newApplications?: number
  totalViews?: number
}

export default function EmployerDashboard() {
  const { isAuthenticated, isEmployer, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [company, setCompany] = useState<Company | null>(null)
  const [stats, setStats] = useState<Stats>({ activeJobs: 0, totalApplications: 0, viewsToday: 0 })
  const [profileLoading, setProfileLoading] = useState(true)
  const [showCreateCompany, setShowCreateCompany] = useState(false)
  const [error, setError] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Check for URL parameters
  const message = searchParams.get("message")

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployer)) {
      router.push("/login")
    }
  }, [isAuthenticated, isEmployer, isLoading, router])

  useEffect(() => {
    if (message === "create-company-first") {
      setShowCreateCompany(true)
    }
  }, [message])

  const fetchProfile = useCallback(async () => {
    if (isAuthenticated && isEmployer) {
      try {
        setRefreshing(true)
        const result = await getEmployerProfile()
        if (result.success) {
          setCompany(result.company)
          setStats(result.stats || { activeJobs: 0, totalApplications: 0, viewsToday: 0 })
          setError("")
        } else {
          // No company profile found
          setShowCreateCompany(true)
          toast({
            title: "Profile Not Found",
            description: "Please create your company profile to get started.",
            variant: "default"
          })
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        setError("Failed to load employer profile")
        toast({
          title: "Error",
          description: "Failed to load employer profile. Please try again.",
          variant: "destructive"
        })
      } finally {
        setProfileLoading(false)
        setRefreshing(false)
      }
    }
  }, [isAuthenticated, isEmployer, toast])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (company) {
        fetchProfile()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [company, fetchProfile])

  const handleCompanyCreated = async (newCompany: Company) => {
    setCompany(newCompany)
    setShowCreateCompany(false)
    toast({
      title: "Success",
      description: "Company profile created successfully!",
      variant: "default"
    })
    // Fetch updated stats
    await fetchProfile()
  }

  if (isLoading || profileLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading employer dashboard...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isEmployer) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Company Creation Dialog */}
      <Dialog open={showCreateCompany} onOpenChange={setShowCreateCompany}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Create Your Company Profile
            </DialogTitle>
            <DialogDescription>
              Before you can post jobs, you need to create a company profile. This helps job seekers learn about your
              organization.
            </DialogDescription>
          </DialogHeader>
          <CreateCompanyForm onSuccess={handleCompanyCreated} />
        </DialogContent>
      </Dialog>

      {company ? (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full">
              <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-muted p-2 mx-auto sm:mx-0">
                <img
                  src={getLogoUrl(company.logo)}
                  alt={company.name}
                  className="h-20 w-20 object-contain"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{company.name}</h1>
                <p className="text-muted-foreground">Manage your jobs and company profile</p>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  <Badge variant="secondary">{company.industry}</Badge>
                  <Badge variant="secondary">{company.size}</Badge>
                  <Badge variant="secondary">{company.location}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => fetchProfile()}
                disabled={refreshing}
                className="w-10 h-10"
              >
                <Loader2 className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/employer/post-job">
                  <Plus className="mr-2 h-4 w-4" />
                  Post New Job
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.newApplications ? `+${stats.newApplications} new applications` : "Currently accepting applications"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">Across all job postings</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews || stats.viewsToday}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalViews ? "All time views" : "Views today"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks for employers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button asChild className="w-full justify-start">
                      <Link href="/employer/post-job">
                        <Plus className="mr-2 h-4 w-4" />
                        Post a New Job
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href="/employer/jobs">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Manage Jobs
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href="/employer/applications">
                        <Users className="mr-2 h-4 w-4" />
                        View Applications
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-start">
                      <Link href="/employer/company/profile">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Company Profile
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Company Overview</CardTitle>
                    <CardDescription>Your company information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted p-2">
                        <img
                          src={getLogoUrl(company.logo)}
                          alt={company.name}
                          className="h-14 w-14 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.description}</p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{company.industry}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{company.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{company.size}</span>
                      </div>
                      {company.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {company.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="jobs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Job Postings</CardTitle>
                  <CardDescription>Manage your active and inactive job listings</CardDescription>
                </CardHeader>
                <CardContent>
                  {company.jobs && company.jobs.length > 0 ? (
                    <div className="space-y-4">
                      {company.jobs.map((job: any) => (
                        <div key={job._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                          <div>
                            <h3 className="font-medium">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.location}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={job.isActive ? "default" : "secondary"}>
                              {job.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/employer/jobs/${job._id}`}>View</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No jobs posted yet</h3>
                      <p className="text-muted-foreground">Start by posting your first job to attract candidates.</p>
                      <Button asChild className="mt-4">
                        <Link href="/employer/post-job">
                          <Plus className="mr-2 h-4 w-4" />
                          Post Your First Job
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Profile</CardTitle>
                  <CardDescription>Manage your company information and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="flex h-32 w-32 items-center justify-center rounded-lg border bg-muted p-2">
                      <img
                        src={getLogoUrl(company.logo)}
                        alt={company.name}
                        className="h-28 w-28 object-contain"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{company.name}</h3>
                      <p className="text-sm text-muted-foreground">{company.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{company.industry}</Badge>
                        <Badge variant="secondary">{company.size}</Badge>
                        <Badge variant="secondary">{company.location}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-medium">Company Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{company.industry}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{company.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{company.size}</span>
                        </div>
                        {company.website && (
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {company.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">About {company.name}</h4>
                      <p className="text-sm text-muted-foreground">{company.description}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button asChild>
                      <Link href="/employer/company/profile">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/employer/company/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold">Welcome to Your Employer Dashboard</h2>
          <p className="text-muted-foreground mt-2">Create your company profile to get started with posting jobs.</p>
          <Button onClick={() => setShowCreateCompany(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Create Company Profile
          </Button>
        </div>
      )}
    </div>
  )
}
