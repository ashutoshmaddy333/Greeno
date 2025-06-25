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
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { MoreHorizontal, Search } from "lucide-react"
import { CardContent } from "@/components/ui/card"

interface Job {
  _id: string
  title: string
  company: {
    _id: string
    name: string
  }
  location: string
  type: string
  salary: {
    min: number
    max: number
    currency: string
  }
  isActive: boolean
  views: number
  applications: number
  createdAt: string
  updatedAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export default function AdminJobs() {
  const { isAdmin, isLoading } = useAdmin()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [type, setType] = useState<string>("all")
  const [isActive, setIsActive] = useState<string>("all")

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/admin/login")
    }
  }, [isLoading, isAdmin, router])

  useEffect(() => {
    if (isAdmin) {
      fetchJobs()
    }
  }, [isAdmin, pagination.page, pagination.limit, search, type, isActive])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      if (search) params.append("search", search)
      if (type && type !== "all") params.append("type", type)
      if (isActive && isActive !== "all") params.append("isActive", isActive)

      const response = await fetch(`/api/admin/jobs?${params}`)
      if (!response.ok) throw new Error("Failed to fetch jobs")

      const data = await response.json()
      setJobs(data.jobs)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to fetch jobs")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateJob = async (jobId: string, updates: Partial<Job>) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update job")

      const updatedJob = await response.json()
      setJobs(jobs.map(job => 
        job._id === jobId ? updatedJob : job
      ))
      toast.success("Job updated successfully")
    } catch (error) {
      console.error("Error updating job:", error)
      toast.error("Failed to update job")
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete job")

      setJobs(jobs.filter(job => job._id !== jobId))
      toast.success("Job deleted successfully")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error("Failed to delete job")
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
          <p className="text-muted-foreground">Manage and monitor all job listings</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[200px] bg-background"
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
          <Select value={isActive} onValueChange={setIsActive}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No jobs found
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job._id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-semibold group-hover:text-primary transition-colors">
                          {job.title}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {job.company.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{job.company.name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{job.location}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize bg-background">
                        {job.type ? job.type.replace("-", " ") : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {job.salary.currency} {job.salary.min.toLocaleString()} -{" "}
                        {job.salary.max.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={job.isActive ? "default" : "secondary"}
                        className={job.isActive ? "bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400" : "bg-gray-500/10 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400"}
                      >
                        {job.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Views: {job.views}</p>
                        <p className="text-sm text-muted-foreground">
                          Applications: {job.applications}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(job.createdAt), "MMM d, yyyy")}
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
                        <DropdownMenuContent align="end" className="bg-background">
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateJob(job._id, {
                                isActive: !job.isActive,
                              })
                            }
                            className="cursor-pointer"
                          >
                            {job.isActive
                              ? "Mark as inactive"
                              : "Mark as active"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer"
                            onClick={() => handleDeleteJob(job._id)}
                          >
                            Delete job
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
      </CardContent>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: Math.max(1, prev.page - 1),
              }))
            }
            disabled={pagination.page === 1}
            className="bg-background"
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
            className="bg-background"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
} 