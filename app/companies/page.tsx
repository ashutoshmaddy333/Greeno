"use client"

import { useState, useEffect, useCallback } from "react"
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
import { getLogoUrl } from "@/lib/utils"
import { Building, MapPin, Users, Globe, Search, Filter } from "lucide-react"
import Link from "next/link"

interface Company {
  _id: string
  name: string
  slug: string
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
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const currentPage = pagination?.page || 1
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    industry: searchParams.get("industry") || "",
    size: searchParams.get("size") || "",
    location: searchParams.get("location") || "",
    sort: searchParams.get("sort") || "-activeJobs",
  })
  const [showFilters, setShowFilters] = useState(false)

  // Update URL with current filters
  const updateUrl = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })
    if (currentPage > 1) {
      params.set("page", currentPage.toString())
    }
    router.push(`/companies?${params.toString()}`)
  }, [router, currentPage])

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchInput }))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Effect to update URL when filters change
  useEffect(() => {
    updateUrl(filters)
  }, [filters, updateUrl])

  useEffect(() => {
    fetchCompanies()
  }, [filters, currentPage])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        ...(filters.search !== "" && { search: filters.search }),
        ...(filters.industry !== "all" && { industry: filters.industry }),
        ...(filters.size !== "all" && { size: filters.size }),
        ...(filters.location && { location: filters.location }),
        ...(filters.sort !== "-activeJobs" && { sort: filters.sort }),
      })

      console.log('Fetching companies with params:', params.toString())
      const response = await fetch(`/api/companies?${params}`)
      const data = await response.json()
      console.log('Companies API response:', data)

      if (data.success) {
        console.log('Companies data with logos:', data.companies.map((c: any) => ({
          _id: c._id,
          name: c.name,
          slug: c.slug,
          rawLogo: c.logo,
          finalLogo: getLogoUrl(c.logo)
        })))
        setCompanies(data.companies)
        setPagination(data.pagination)
      } else {
        throw new Error(data.message || "Failed to fetch companies")
      }
    } catch (error: any) {
      console.error('Error fetching companies:', error)
      showToast.error(error.message || "Failed to fetch companies")
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      [key]: value === "all" ? "" : value 
    }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on filter change
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, search: searchInput }))
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
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1001-5000 employees",
    "5000+ employees",
  ]

  const sortOptions = [
    { value: "-activeJobs", label: "Most Active" },
    { value: "activeJobs", label: "Least Active" },
    { value: "name", label: "Name (A-Z)" },
    { value: "-name", label: "Name (Z-A)" },
  ]

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Find Companies</h1>
        <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search companies by name, industry, or location"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
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
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                    <SelectItem value="all">All Industries</SelectItem>
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
                    <SelectItem value="all">All Sizes</SelectItem>
                    {companySizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
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
        <div className="flex justify-center items-center min-h-[40vh] sm:min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <h3 className="text-lg font-medium">No companies found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link 
                href={`/company/${company.slug}`}
                key={company._id}
                className="block transition-transform hover:scale-[1.02]"
              >
                <Card className="hover:bg-muted/50 transition-colors h-full cursor-pointer">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-lg border bg-muted p-2 hover:bg-muted/80 transition-colors">
                        <img
                          src={getLogoUrl(company.logo)}
                          alt={company.name}
                          className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
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

          {pagination?.pages > 1 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: pagination?.pages || 0 }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination?.pages}
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
