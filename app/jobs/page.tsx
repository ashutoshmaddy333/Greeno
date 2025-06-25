"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { showToast } from "@/lib/toast"
import { Building, MapPin, Clock, DollarSign, Search, Filter } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import JobCard from "@/components/job-card"

interface Job {
  id: string
  title: string
  company: {
    id: string
    name: string
    logo: string
    website?: string
    industry?: string
    size?: string
  }
  location: string
  type: string
  category: string
  salary: string
  posted: string
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  remote: boolean
  experienceLevel: string
  views: number
  totalApplications: number
  isSaved?: boolean
  isApplied?: boolean
  savedBy?: string[]
  appliedBy?: string[]
}

interface Filters {
  location: string
  type: string
  category: string
  remote: boolean
  experience: string
  salary: string
}

export default function JobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, user } = useAuth()
  const isJobSeeker = user?.role === "jobseeker"

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    location: "",
    type: "",
    category: "",
    remote: false,
    experience: "",
    salary: "",
  })

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      
      // Add search query
      if (searchQuery) {
        queryParams.append("q", searchQuery)
      }

      // Add filters
      if (filters.location) queryParams.append("location", filters.location)
      if (filters.type) queryParams.append("type", filters.type)
      if (filters.category) queryParams.append("category", filters.category)
      if (filters.remote) queryParams.append("remote", "true")
      if (filters.experience) queryParams.append("experience", filters.experience)
      if (filters.salary) queryParams.append("salary", filters.salary)

      // Add sorting
      if (sortBy) queryParams.append("sort", sortBy)

      // Add pagination
      queryParams.append("page", currentPage.toString())
      queryParams.append("limit", "10")

      const response = await fetch(`/api/jobs?${queryParams.toString()}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch jobs")
      }

      const data = await response.json()
      setJobs(data.jobs.map((job: any) => ({
        ...job,
        isSaved: job.savedBy?.includes(user?.id),
        isApplied: job.appliedBy?.includes(user?.id),
      })))
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setError("Failed to load jobs. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [searchQuery, filters, sortBy, currentPage, user?.id])

  const handleSaveJob = async (jobId: string) => {
    if (!isAuthenticated) {
      showToast.error("Please sign in to save jobs")
      return
    }

    if (!isJobSeeker) {
      showToast.error("Only job seekers can save jobs")
      return
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to save job")
      }

      // Update the job in the list to reflect the saved state
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? { ...job, isSaved: !job.isSaved }
            : job
        )
      )
    } catch (error: any) {
      console.error("Error saving job:", error)
      showToast.error(error.message || "Failed to save job")
      throw error
    }
  }

  const handleApplyJob = async (jobId: string) => {
    if (!isAuthenticated) {
      showToast.error("Please sign in to apply for jobs")
      return
    }

    if (!isJobSeeker) {
      showToast.error("Only job seekers can apply for jobs")
      return
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to apply for job")
      }

      // Update the job in the list to reflect the applied state
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? { ...job, isApplied: true }
            : job
        )
      )
    } catch (error: any) {
      console.error("Error applying for job:", error)
      showToast.error(error.message || "Failed to apply for job")
      throw error
    }
  }
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    const params = new URLSearchParams(searchParams)
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }
    router.push(`/jobs?${params.toString()}`)
  }

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="container py-8 px-2 sm:px-4">
      <div className="flex flex-col gap-4 sm:gap-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">Search</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </form>

        {showFilters && (
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="City, State, or Remote"
                    value={filters.location}
                    onChange={(e) => handleFilterChange("location", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => handleFilterChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <Select
                    value={filters.experience}
                    onValueChange={(value) => handleFilterChange("experience", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <Select
                    value={filters.salary}
                    onValueChange={(value) => handleFilterChange("salary", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select salary range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Salaries</SelectItem>
                      <SelectItem value="0-5">Up to ₹5L</SelectItem>
                      <SelectItem value="5-10">₹5L - ₹10L</SelectItem>
                      <SelectItem value="10-15">₹10L - ₹15L</SelectItem>
                      <SelectItem value="15-20">₹15L - ₹20L</SelectItem>
                      <SelectItem value="20+">₹20L+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="salary-desc">Highest Salary</SelectItem>
                      <SelectItem value="applications-desc">Most Applied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Checkbox
                  id="remote"
                  checked={filters.remote}
                  onCheckedChange={(checked) =>
                    handleFilterChange("remote", checked as boolean)
                  }
                />
                <Label htmlFor="remote">Remote Only</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh] sm:min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 sm:py-12">
            <h3 className="text-lg font-medium text-destructive">{error}</h3>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setError(null)
                fetchJobs()
              }}
            >
              Try Again
            </Button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <h3 className="text-lg font-medium">No jobs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6">
              {jobs.map((job) => {
                // Dynamically parse salary string to {min, max} in INR
                let salaryObj: { min?: number; max?: number } | undefined = undefined;
                if (typeof job.salary === 'string' && job.salary.trim() !== '') {
                  const salaryStr = job.salary.trim();
                  if (/^\d+-\d+$/.test(salaryStr)) {
                    // Format: '5-10'
                    const [minStr, maxStr] = salaryStr.split('-');
                    const min = parseInt(minStr) * 100000;
                    const max = parseInt(maxStr) * 100000;
                    if (!isNaN(min) && !isNaN(max)) {
                      salaryObj = { min, max };
                    }
                  } else if (/^\d+\+$/.test(salaryStr)) {
                    // Format: '10+'
                    const min = parseInt(salaryStr);
                    if (!isNaN(min)) {
                      salaryObj = { min: min * 100000 };
                    }
                  } else if (/^\d+$/.test(salaryStr)) {
                    // Format: '10' (single value)
                    const value = parseInt(salaryStr) * 100000;
                    if (!isNaN(value)) {
                      salaryObj = { min: value, max: value };
                    }
                  }
                  // You can add more parsing logic here for other formats if needed
                }
                // If salary is not specified or invalid, salaryObj remains undefined
                return (
                  <JobCard
                    key={job.id}
                    id={job.id}
                    title={job.title}
                    company={job.company.name}
                    location={job.remote ? "Remote" : job.location}
                    type={job.type}
                    salary={salaryObj}
                    posted={job.posted}
                    logo={job.company.logo}
                    isActive={true}
                    isSaved={!!job.isSaved}
                    isApplied={!!job.isApplied}
                    experienceLevel={job.experienceLevel}
                    skills={job.skills}
                    onSave={handleSaveJob}
                    onApply={() => { window.location.href = `/job/${job.id}`; }}
                  />
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
