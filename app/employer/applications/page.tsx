"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { showToast } from "@/lib/toast"
import { formatDistanceToNow } from "date-fns"
import {
  ChevronDown,
  FileText,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  MoreVertical,
} from "lucide-react"

interface Application {
  id: string
  status: string
  appliedAt: string
  resumeFilename: string
  resumeOriginalName: string
  resumeUrl: string
  coverLetter: string
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phoneNumber: string
  experience: "fresher" | "experienced"
  yearsOfExperience?: number
  education: Array<{
    degree: string
    field: string
    institution: string
    graduationYear: number
  }>
  applicant: {
    id: string
    name: string
    email: string
  }
  job: {
    id: string
    title: string
    company: string
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<string>("all")
  const [jobs, setJobs] = useState<Array<{ id: string; title: string }>>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showApplicationDetails, setShowApplicationDetails] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    if (selectedJob) {
      fetchApplications()
    }
  }, [selectedJob])

  const fetchJobs = async () => {
    try {
      setError(null)
      const response = await fetch("/api/employer/jobs")
      const data = await response.json()

      if (data.success) {
        setJobs(data.jobs || [])
        if (data.jobs?.length > 0) {
          setSelectedJob(data.jobs[0].id)
        }
      } else {
        throw new Error(data.message || "Failed to fetch jobs")
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch jobs"
      setError(errorMessage)
      showToast.error(errorMessage)
    }
  }

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const url = selectedJob === "all" 
        ? "/api/employer/applications"
        : `/api/jobs/${selectedJob}/apply`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setApplications(data.applications || [])
      } else {
        throw new Error(data.message || "Failed to fetch applications")
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch applications"
      setError(errorMessage)
      showToast.error(errorMessage)
      setApplications([]) // Reset applications on error
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${selectedJob}/apply`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showToast.success("Application status updated successfully")
        // Update the local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app
          )
        )
        // Update selected application if it's the one being modified
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication(prev => prev ? { ...prev, status: newStatus } : null)
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to update application status")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewing: "bg-blue-100 text-blue-800",
      shortlisted: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
      hired: "bg-green-100 text-green-800",
    }

    return (
      <Badge className={`${statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "reviewing":
        return <AlertCircle className="h-4 w-4" />
      case "shortlisted":
        return <UserCheck className="h-4 w-4" />
      case "rejected":
        return <UserX className="h-4 w-4" />
      case "hired":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-red-500">Error Loading Applications</h2>
          <p className="text-muted-foreground text-center">{error}</p>
          <Button onClick={fetchApplications} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs?.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {!applications?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No applications found for this job
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {application.firstName} {application.middleName} {application.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {application.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{application.job.title}</TableCell>
                      <TableCell>
                        {(() => {
                          try {
                            const date = new Date(application.appliedAt);
                            if (isNaN(date.getTime())) {
                              return "Invalid date";
                            }
                            return formatDistanceToNow(date, {
                              addSuffix: true,
                            });
                          } catch (error) {
                            console.error("Error formatting date:", error);
                            return "Invalid date";
                          }
                        })()}
                      </TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        {application.experience === "experienced" 
                          ? `${application.yearsOfExperience} years`
                          : "Fresher"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application)
                              setShowApplicationDetails(true)
                            }}
                          >
                            View Details
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => updateApplicationStatus(application.id, "reviewing")}
                                disabled={application.status === "reviewing"}
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Mark as Reviewing
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateApplicationStatus(application.id, "shortlisted")}
                                disabled={application.status === "shortlisted"}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Shortlist
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateApplicationStatus(application.id, "rejected")}
                                disabled={application.status === "rejected"}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateApplicationStatus(application.id, "hired")}
                                disabled={application.status === "hired"}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Hired
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={showApplicationDetails} onOpenChange={setShowApplicationDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedApplication && (
            <>
              <DialogHeader>
                <DialogTitle>Application Details</DialogTitle>
                <DialogDescription>
                  Review the candidate's application for {selectedApplication.job.title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Full Name</div>
                      <div className="text-sm">
                        {selectedApplication.firstName} {selectedApplication.middleName} {selectedApplication.lastName}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Email</div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4" />
                        {selectedApplication.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Phone</div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4" />
                        {selectedApplication.phoneNumber}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Experience</div>
                      <div className="flex items-center text-sm">
                        <Briefcase className="mr-2 h-4 w-4" />
                        {selectedApplication.experience === "experienced"
                          ? `${selectedApplication.yearsOfExperience} years`
                          : "Fresher"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Education</h3>
                  <div className="space-y-4">
                    {selectedApplication.education.map((edu, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          <div className="font-medium">{edu.degree}</div>
                        </div>
                        <div className="grid gap-2 text-sm">
                          <div>
                            <span className="font-medium">Field:</span> {edu.field}
                          </div>
                          <div>
                            <span className="font-medium">Institution:</span> {edu.institution}
                          </div>
                          <div>
                            <span className="font-medium">Graduation Year:</span> {edu.graduationYear}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Application Materials */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Application Materials</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          <span className="font-medium">Resume</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedApplication.resumeUrl, "_blank")}
                        >
                          View Resume
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedApplication.resumeOriginalName}
                      </div>
                    </div>
                    {selectedApplication.coverLetter && (
                      <div>
                        <div className="font-medium mb-2">Cover Letter</div>
                        <div className="text-sm whitespace-pre-wrap">
                          {selectedApplication.coverLetter}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Management */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Application Status</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {getStatusIcon(selectedApplication.status)}
                      <span className="ml-2">{getStatusBadge(selectedApplication.status)}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Change Status
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateApplicationStatus(selectedApplication.id, "reviewing")}
                          disabled={selectedApplication.status === "reviewing"}
                        >
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Mark as Reviewing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateApplicationStatus(selectedApplication.id, "shortlisted")}
                          disabled={selectedApplication.status === "shortlisted"}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Shortlist
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}
                          disabled={selectedApplication.status === "rejected"}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateApplicationStatus(selectedApplication.id, "hired")}
                          disabled={selectedApplication.status === "hired"}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Hired
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 