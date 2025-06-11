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
import { Label } from "@/components/ui/label"
import { showToast } from "@/lib/toast"
import { Building, MapPin, Users, Globe, Search, Filter } from "lucide-react"
import Link from "next/link"

interface Company {
  id: string
  name: string
  logo: string
  website?: string
  industry?: string
  size?: string
  location?: string
  description?: string
  founded?: string
  activeJobs: number
}

interface Pagination {
  total: number
  page: number
  limit: number
  pages: number
}

export default function CompaniesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    industry: searchParams.get("industry") || "",
    size: searchParams.get("size") || "",
    location: searchParams.get("location") || "",
    sort: searchParams.get("sort") || "-activeJobs",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [filters, pagination.page])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", pagination.page.toString())
      params.set("limit", pagination.limit.toString())
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.set(key, value.toString())
        }
      })

      const response = await fetch(`/api/companies?${params}`)
      const data = await response.json()

      if (data.success) {
        setCompanies(data.companies)
        setPagination(data.pagination)
      } else {
        throw new Error(data.message)
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to fetch companies")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPagination((prev) => ({ ...prev, page: 1 })) // Reset to first page on filter change
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCompanies()
  }

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Media",
    "Transportation",
    "Energy",
    "Other",
  ]

  const companySizes = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
  ]

  const sortOptions = [
    { value: "-activeJobs", label: "Most Active" },
    { value: "activeJobs", label: "Least Active" },
    { value: "name", label: "Name (A-Z)" },
    { value: "-name", label: "Name (Z-A)" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Companies</h1>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search companies by name, industry, or location"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </form>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select
                  value={filters.industry}
                  onValueChange={(value) => handleFilterChange("industry", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select
                  value={filters.size}
                  onValueChange={(value) => handleFilterChange("size", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sizes</SelectItem>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="City, State, or Country"
                  value={filters.location}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={filters.sort}
                  onValueChange={(value) => handleFilterChange("sort", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No companies found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link 
                href={`/company/${encodeURIComponent(company.name.toLowerCase().replace(/\s+/g, "-"))}`} 
                key={company.id}
              >
                <Card className="hover:bg-muted/50 transition-colors h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-muted p-2">
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-20 w-20 object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-semibold">{company.name}</h2>
                        <div className="flex flex-wrap justify-center gap-2 text-muted-foreground">
                          {company.industry && (
                            <span className="flex items-center">
                              <Building className="mr-1 h-4 w-4" />
                              {company.industry}
                            </span>
                          )}
                          {company.location && (
                            <span className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4" />
                              {company.location}
                            </span>
                          )}
                          {company.size && (
                            <span className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              {company.size} employees
                            </span>
                          )}
                        </div>
                        {company.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {company.description}
                          </p>
                        )}
                        <div className="flex flex-wrap justify-center gap-2 pt-2">
                          {company.website && (
                            <Badge variant="outline" className="gap-1">
                              <Globe className="h-3 w-3" />
                              Website
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            {company.activeJobs} active jobs
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === pagination.page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
