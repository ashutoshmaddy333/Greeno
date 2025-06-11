"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Mail, Phone, FileText, Eye, Ban, CheckCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { showToast } from "@/lib/toast"

interface JobSeeker {
  _id: string
  user: {
    email: string
    isVerified: boolean
    isEmailVerified: boolean
  }
  fullName: string
  headline: string
  bio: string
  phone: string
  location: string
  skills: string[]
  experience: string
  education: {
    degree: string
    field: string
    institution: string
    graduationYear: number
  } | null
  socialLinks: Record<string, string>
  resume: {
    url: string
    filename: string
  } | null
  stats: {
    totalApplications: number
    activeApplications: number
    savedJobs: number
  }
  createdAt: string
  status: "active" | "suspended"
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export default function JobSeekersPage() {
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })

  useEffect(() => {
    fetchJobSeekers()
  }, [pagination.page, searchQuery])

  const fetchJobSeekers = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { search: searchQuery }),
      })

      const response = await fetch(`/api/admin/job-seekers?${params}`)
      const data = await response.json()
      
      if (data.jobSeekers) {
        setJobSeekers(data.jobSeekers)
        setPagination(data.pagination)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Failed to fetch job seekers:", error)
      showToast.error("Failed to load job seekers")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleStatusChange = async (jobSeekerId: string, newStatus: "active" | "suspended") => {
    try {
      const response = await fetch(`/api/admin/job-seekers/${jobSeekerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      setJobSeekers((prev) =>
        prev.map((seeker) =>
          seeker._id === jobSeekerId ? { ...seeker, status: newStatus } : seeker
        )
      )

      showToast.success(`Job seeker ${newStatus === "active" ? "activated" : "suspended"} successfully`)
    } catch (error) {
      console.error("Failed to update job seeker status:", error)
      showToast.error("Failed to update status")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Job Seekers</h1>
        <p className="text-muted-foreground">Manage job seekers and their accounts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Job Seekers</CardTitle>
              <CardDescription>
                Showing {jobSeekers.length} of {pagination.total} job seekers
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search job seekers..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobSeekers.map((seeker) => (
                <TableRow key={seeker._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{seeker.fullName}</p>
                      <p className="text-sm text-muted-foreground">{seeker.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                        {seeker.phone}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        {seeker.user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{seeker.location}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {seeker.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {seeker.skills.length > 3 && (
                        <Badge variant="outline">+{seeker.skills.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={seeker.status === "active" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {seeker.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(seeker.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Resume
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {seeker.status === "active" ? (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleStatusChange(seeker._id, "suspended")}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => handleStatusChange(seeker._id, "active")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate Account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} job seekers
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 