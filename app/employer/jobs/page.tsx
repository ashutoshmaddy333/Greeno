"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  ArrowRight,
  Building,
  Clock,
  Edit,
  Eye,
  Filter,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  Loader2,
} from "lucide-react"
import { getEmployerJobs } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"

interface Job {
  id: string
  title: string
  location: string
  type: string
  salary: string
  posted: string
  applicants: number
  status: "active" | "expired"
  category: string
  views: number
  company: {
    name: string
    logo: string
  }
}

interface Pagination {
  total: number
  pages: number
  currentPage: number
  limit: number
}

export default function EmployerJobsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [jobs, setJobs] = useState<Job[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError("")
      
      const result = await getEmployerJobs({
        search: searchQuery,
        status: statusFilter,
        page: currentPage,
        limit: 5
      })

      if (result.success) {
        setJobs(result.jobs)
        setPagination(result.pagination)
      } else {
        setError(result.message || "Failed to fetch jobs")
        toast({
          title: "Error",
          description: result.message || "Failed to fetch jobs",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error("Error fetching jobs:", err)
      setError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch jobs when filters or page changes
  useEffect(() => {
    fetchJobs()
  }, [searchQuery, statusFilter, currentPage])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1) // Reset to first page on new search
      fetchJobs()
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page on filter change
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/employer" className="mr-4">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Manage Jobs</h1>
              <p className="text-muted-foreground">View and manage all your job postings</p>
            </div>
          </div>
          <Link href="/employer/post-job">
            <Button className="button-hover">
              <Plus className="mr-2 h-4 w-4" />
              Post a New Job
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, location, or category"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="active">Active Jobs</SelectItem>
                    <SelectItem value="expired">Expired Jobs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="rounded-lg border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Job Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Salary</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Posted</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Applicants</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading jobs...
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-destructive">
                          {error}
                        </td>
                      </tr>
                    ) : jobs.length > 0 ? (
                      jobs.map((job) => (
                        <tr key={job.id} className="border-b">
                          <td className="px-4 py-3 text-sm font-medium">{job.title}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {job.location}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="rounded-md">
                              {job.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <span>{job.salary}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {job.posted}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{job.applicants}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge
                              variant={job.status === "active" ? "default" : "outline"}
                              className={job.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                              {job.status === "active" ? "Active" : "Expired"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2">
                              <Link href={`/employer/jobs/${job.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/employer/jobs/${job.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                          No jobs found matching your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages || loading}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading jobs...
              </div>
            ) : error ? (
              <div className="text-center text-destructive py-8">{error}</div>
            ) : jobs.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden transition-all hover-lift card-hover">
                    <CardContent className="p-0">
                      <div className="flex flex-col space-y-4 p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold leading-tight">{job.title}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Building className="mr-1 h-3 w-3" />
                              {job.company.name}
                            </div>
                          </div>
                          <Badge
                            variant={job.status === "active" ? "default" : "outline"}
                            className={job.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {job.status === "active" ? "Active" : "Expired"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-3 w-3" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{job.salary}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {job.posted}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="rounded-md">
                            {job.type}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="mr-1 h-4 w-4" />
                            {job.applicants} applicants
                          </div>
                        </div>
                      </div>

                      <div className="flex border-t">
                        <Link href={`/employer/jobs/${job.id}`} className="flex-1">
                          <Button variant="ghost" className="w-full rounded-none py-3 button-hover">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </Link>
                        <div className="border-l">
                          <Link href={`/employer/jobs/${job.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-full rounded-none px-4">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                        <div className="border-l">
                          <Button variant="ghost" size="icon" className="h-full rounded-none px-4 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No jobs found matching your search criteria.
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages || loading}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
