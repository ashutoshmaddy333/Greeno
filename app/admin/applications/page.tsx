"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { useRouter } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { MoreHorizontal, Search, Download, Eye, Briefcase, Building2, User, Calendar, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Application {
  _id: string
  job: {
    _id: string
    title: string
    company: {
      _id: string
      name: string
    }
  }
  applicant: {
    _id: string
    name: string
    email: string
  }
  status: string
  experience: string
  yearsOfExperience?: number
  education: Array<{
    degree: string
    field: string
    institution: string
    graduationYear: number
  }>
  resumeUrl: string
  coverLetter: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export default function ApplicationsPage() {
  const { isAdmin, isLoading } = useAdmin()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/admin/login")
    }
  }, [isLoading, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      fetchApplications()
    }
  }, [isAdmin, pagination.page, pagination.limit, search, status])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      if (search) params.append("search", search)
      if (status && status !== "all") params.append("status", status)

      const response = await fetch(`/api/admin/applications?${params}`)
      if (!response.ok) throw new Error("Failed to fetch applications")

      const data = await response.json()
      setApplications(data.applications)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error("Failed to fetch applications")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update application status")

      const updatedApplication = await response.json()
      setApplications(applications.map(app =>
        app._id === applicationId ? updatedApplication : app
      ))
      toast.success("Application status updated")
    } catch (error) {
      console.error("Error updating application:", error)
      toast.error("Failed to update application status")
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete application")

      setApplications(applications.filter(app => app._id !== applicationId))
      toast.success("Application deleted successfully")
    } catch (error) {
      console.error("Error deleting application:", error)
      toast.error("Failed to delete application")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400"
      case "reviewing":
        return "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400"
      case "shortlisted":
        return "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 dark:text-purple-400"
      case "rejected":
        return "bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400"
      case "accepted":
        return "bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400"
      default:
        return "bg-gray-500/10 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400"
    }
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6 px-2 sm:px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review job applications
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-[240px]"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[25%]">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Job
                      </div>
                    </TableHead>
                    <TableHead className="w-[15%]">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Company
                      </div>
                    </TableHead>
                    <TableHead className="w-[20%]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Applicant
                      </div>
                    </TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                    <TableHead className="w-[15%]">Experience</TableHead>
                    <TableHead className="w-[10%]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Applied
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                          <p className="text-sm text-muted-foreground">Loading applications...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No applications found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={application._id} className="group">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-semibold group-hover:text-primary transition-colors">
                              {application.job.title}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {application.job.company.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{application.job.company.name}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium group-hover:text-primary transition-colors">
                              {application.applicant.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {application.applicant.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${getStatusColor(application.status)} capitalize`}
                          >
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {application.yearsOfExperience
                              ? `${application.yearsOfExperience} years`
                              : application.experience}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(application.createdAt), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-muted"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px]">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedApplication(application)
                                  setShowDetails(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {application.resumeUrl && (
                                <DropdownMenuItem
                                  onClick={() => window.open(application.resumeUrl, "_blank")}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Resume
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(application._id, "reviewing")
                                }
                              >
                                Mark as Reviewing
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(application._id, "shortlisted")
                                }
                              >
                                Mark as Shortlisted
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(application._id, "rejected")
                                }
                              >
                                Mark as Rejected
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(application._id, "accepted")
                                }
                              >
                                Mark as Accepted
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteApplication(application._id)}
                              >
                                Delete Application
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.min(pagination.pages, prev.page + 1),
              }))
            }
            disabled={pagination.page === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Detailed information about the application
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Job Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Title:</span>
                      <span>{selectedApplication.job.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Company:</span>
                      <span>{selectedApplication.job.company.name}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Applicant Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Name:</span>
                      <span>{selectedApplication.applicant.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Email:</span>
                      <span className="text-muted-foreground">
                        {selectedApplication.applicant.email}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experience & Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedApplication.yearsOfExperience
                        ? `${selectedApplication.yearsOfExperience} years of experience`
                        : selectedApplication.experience}
                    </p>
                  </div>

                  {selectedApplication.education.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Education</h4>
                        <div className="space-y-3">
                          {selectedApplication.education.map((edu, index) => (
                            <div key={index} className="text-sm">
                              <p className="font-medium">
                                {edu.degree} in {edu.field}
                              </p>
                              <p className="text-muted-foreground">{edu.institution}</p>
                              <p className="text-muted-foreground text-xs">
                                Graduated: {edu.graduationYear}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {selectedApplication.coverLetter && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cover Letter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                      {selectedApplication.coverLetter}
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedApplication.resumeUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedApplication.resumeUrl, "_blank")}
                      className="w-full sm:w-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 