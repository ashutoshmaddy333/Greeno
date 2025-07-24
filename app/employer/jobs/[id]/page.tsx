"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  ArrowUpDown,
  Building,
  Calendar,
  Clock,
  Download,
  Edit,
  Eye,
  Globe,
  MapPin,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Share2,
  Trash2,
  Users,
  Briefcase,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { showToast } from "@/lib/toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"
import { getLogoUrl } from "@/lib/utils"

interface Job {
  id: string
  title: string
  location: string
  type: string
  salary: string
  posted: string
  expires: string
  views: number
  applicants: number
  status: "active" | "inactive"
  isActive: boolean
  category: string
  description: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  skills: string[]
  company: {
    name: string
    logo: string
    size: string
    industry: string
    website: string
    founded: string
    description: string
  }
}

interface Applicant {
  id: string
  name: string
  title: string
  location: string
  applied: string
  experience: string
  match: number
  status: "new" | "reviewed" | "interviewed" | "rejected"
  resumeUrl?: string
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState("overview")
  const [job, setJob] = useState<Job | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/jobs/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch job details")
      }
      
      const data = await response.json()
      if (data.success) {
        setJob(data.job)
        setApplicants(data.applicants || [])
      } else {
        throw new Error(data.message || "Failed to fetch job details")
      }
    } catch (err) {
      console.error("Error fetching job details:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      showToast.error("Failed to fetch job details")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async () => {
    if (!confirm("Are you sure you want to delete this job posting? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete job")
      }

      showToast.success("Job deleted successfully")
      router.push("/employer/jobs")
    } catch (err) {
      console.error("Error deleting job:", err)
      showToast.error("Failed to delete job")
    }
  }

  const handleStatusToggle = async () => {
    if (!job) return
    
    const toastId = toast.loading("Updating job status...")
    setUpdatingStatus(true)
    
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !job.isActive,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update job status")
      }

      if (data.success) {
        // Update local state
        setJob(prev => prev ? { ...prev, isActive: !prev.isActive, status: !prev.isActive ? "active" : "inactive" } : null)
        
        // Show success toast
        toast.success(`Job ${!job.isActive ? "activated" : "deactivated"} successfully!`, {
          id: toastId,
          duration: 3000,
        })
      } else {
        throw new Error(data.message || "Failed to update job status")
      }
    } catch (err) {
      console.error("Error updating job status:", err)
      toast.error("Failed to update job status. Please try again.", {
        id: toastId,
        duration: 3000,
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleShareJob = async () => {
    try {
      // Get the current URL
      const jobUrl = `${window.location.origin}/jobs/${id}`
      
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: job?.title || "Job Posting",
          text: `Check out this ${job?.title} position at ${job?.company.name}`,
          url: jobUrl,
        })
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(jobUrl)
        showToast.success("Job link copied to clipboard!")
      }
    } catch (err) {
      console.error("Error sharing job:", err)
      showToast.error("Failed to share job")
    }
  }

  useEffect(() => {
    fetchJobDetails()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading job details...</span>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Error Loading Job Details</h2>
          <p className="mt-2 text-muted-foreground">{error || "Job not found"}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/employer/jobs")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
      case "reviewed":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Reviewed</Badge>
      case "interviewed":
        return <Badge className="bg-green-500 hover:bg-green-600">Interviewed</Badge>
      case "rejected":
        return <Badge variant="outline">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Format job description sections
  const formatDescription = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return content.map((item, index) => `<li>${item}</li>`).join("")
    }
    return content
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/employer/jobs"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>
        <div className="flex items-center space-x-2">
          <Switch
            id="job-status"
            checked={job.isActive}
            onCheckedChange={handleStatusToggle}
            disabled={updatingStatus}
          />
          <Label htmlFor="job-status" className="text-sm font-medium">
            {job.isActive ? "Active" : "Inactive"}
          </Label>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <Badge
                    variant={job.status === "active" ? "default" : "outline"}
                    className={job.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {job.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <span>{job.salary ? `Salary specified: ${job.salary}` : 'Salary not specified'}</span>
                  </span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Posted {job.posted}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant="secondary" className="rounded-md">
                    {job.type}
                  </Badge>
                  <Badge variant="outline" className="rounded-md">
                    {job.category}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/employer/jobs/${id}/edit`}>
                  <Button variant="outline" className="button-hover">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Job
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                    <CardDescription>Complete job details and requirements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ __html: job.description }} />
                      
                      {job.responsibilities && job.responsibilities.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold">Responsibilities</h3>
                          <ul className="mt-2 list-disc pl-6">
                            {job.responsibilities.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold">Requirements</h3>
                          <ul className="mt-2 list-disc pl-6">
                            {job.requirements.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {job.benefits && job.benefits.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold">Benefits</h3>
                          <ul className="mt-2 list-disc pl-6">
                            {job.benefits.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {job.skills && job.skills.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold">Required Skills</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {job.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>Details about your company</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-lg border bg-muted p-2">
                          <img
                            src={getLogoUrl(job.company.logo)}
                            alt={job.company.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{job.company.name}</h3>
                          <p className="text-sm text-muted-foreground">{job.company.industry}</p>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{job.company.size}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={job.company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {job.company.website}
                          </a>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Founded in {job.company.founded}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-2 font-medium">About {job.company.name}</h4>
                        <p className="text-muted-foreground">{job.company.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applicants" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Applicants</CardTitle>
                      <CardDescription>Manage candidates who have applied for this position</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ArrowUpDown className="h-4 w-4" />
                      Sort by
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {applicants.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Applicants Yet</h3>
                        <p className="text-muted-foreground">Applications will appear here as candidates apply to this job.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applicants.map((applicant) => (
                          <div key={applicant.id} className="rounded-lg border p-4 transition-all hover:bg-muted/50">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">{applicant.name}</h3>
                                  {getStatusBadge(applicant.status)}
                                </div>
                                <p className="text-sm text-muted-foreground">{applicant.title}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                  <span className="flex items-center">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {applicant.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Applied {applicant.applied}
                                  </span>
                                  <span className="flex items-center">
                                    <Briefcase className="mr-1 h-3 w-3" />
                                    {applicant.experience} experience
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <Badge variant="outline" className="bg-primary/10 text-primary">
                                  {applicant.match}% Match
                                </Badge>
                                <div className="w-32">
                                  <div className="flex items-center justify-between text-xs">
                                    <span>Match</span>
                                    <span className="font-medium">{applicant.match}%</span>
                                  </div>
                                  <Progress value={applicant.match} className="h-2" />
                                </div>
                                <div className="flex gap-2">
                                  {applicant.resumeUrl && (
                                    <Button variant="outline" size="sm" onClick={() => window.open(applicant.resumeUrl, "_blank")}>
                                      <Download className="mr-1 h-3 w-3" />
                                      Resume
                                    </Button>
                                  )}
                                  <Link href={`/employer/applicants/${applicant.id}`}>
                                    <Button size="sm">View</Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Performance</CardTitle>
                    <CardDescription>Analytics and statistics for this job posting</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-sm text-muted-foreground">Total Views</span>
                        <span className="text-2xl font-bold">{job.views}</span>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-sm text-muted-foreground">Applications</span>
                        <span className="text-2xl font-bold">{job.applicants}</span>
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-sm text-muted-foreground">Time Remaining</span>
                        <span className="text-2xl font-bold">{job.expires}</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <h3 className="text-sm font-medium">Application Rate</h3>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {Math.round((job.applicants / job.views) * 100)}% of viewers applied
                          </span>
                          <span className="font-medium">
                            {job.applicants}/{job.views}
                          </span>
                        </div>
                        <Progress value={(job.applicants / job.views) * 100} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-6">
                      <p className="text-sm text-muted-foreground">
                        This job is performing better than 75% of jobs in the {job.category} category.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Building className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Company</p>
                      <p className="text-sm text-muted-foreground">{job.company.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Job Type</p>
                      <p className="text-sm text-muted-foreground">{job.type}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div>
                      <p className="text-sm font-medium">Salary Range</p>
                      <p className="text-sm text-muted-foreground">{job.salary ? `Salary specified: ${job.salary}` : 'Salary not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Posted</p>
                      <p className="text-sm text-muted-foreground">{job.posted}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Applicants</p>
                      <p className="text-sm text-muted-foreground">{job.applicants} candidates</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/employer/jobs/${id}/edit`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Job Posting
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleShareJob}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Job
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive"
                  onClick={handleDeleteJob}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Job
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
