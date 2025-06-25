"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { showToast } from "@/lib/toast"
import { Building, MapPin, Users, Globe, Calendar, Briefcase } from "lucide-react"
import Link from "next/link"
import { getLogoUrl } from "@/lib/utils"

interface Company {
  id: string
  name: string
  logo: string
  website?: string
  industry?: string
  size?: string
  location?: string
  description?: string
  foundedYear?: string
  activeJobs: number
  postedBy: {
    id: string
    name: string
    email: string
  }
}

interface Job {
  id: string
  title: string
  type: string
  location: string
  salary: string
  posted: string
  description: string
  requirements: string[]
  benefits?: string[]
  skills?: string[]
  remote: boolean
  experienceLevel: string
  educationLevel?: string
  applicationDeadline: string
  views: number
  totalApplications: number
}

export default function CompanyPage() {
  const params = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("about")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const slug = params.id as string
    console.log('Company detail page - params:', params)
    console.log('Company detail page - slug:', slug)
    if (!slug) {
      console.error('Company detail page - No slug provided')
      setError("Invalid company URL")
      setLoading(false)
      return
    }
    fetchCompany(slug)
  }, [params.id])

  const fetchCompany = async (slug: string) => {
    setLoading(true)
    setError(null)
    try {
      console.log('Company detail page - Fetching company with slug:', slug)
      const response = await fetch(`/api/companies/${slug}`)
      console.log('Company detail page - Response status:', response.status)
      const data = await response.json()
      console.log('Company detail page - Full response data:', data)
      
      if (data.success) {
        const companyData = data.company
        console.log('Company detail page - Company data:', {
          id: companyData.id,
          name: companyData.name,
          slug: companyData.slug,
          rawLogo: companyData.logo,
          isHttp: companyData.logo?.startsWith('http'),
          isUploads: companyData.logo?.startsWith('/uploads'),
          isPlaceholder: !companyData.logo,
          finalUrl: getLogoUrl(companyData.logo),
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
          windowOrigin: typeof window !== 'undefined' ? window.location.origin : 'undefined'
        })
        setCompany(companyData)
        setJobs(data.jobs)
      } else {
        throw new Error(data.message || "Failed to fetch company details")
      }
    } catch (error: any) {
      console.error('Company detail page - Error fetching company:', error)
      setError(error.message || "Failed to fetch company details")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Company not found</h3>
          <p className="text-muted-foreground">
            {error || "The company you're looking for doesn't exist or has been removed"}
          </p>
          <Button className="mt-4" asChild>
            <Link href="/companies">Browse Companies</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-32 w-32 items-center justify-center rounded-lg border bg-muted p-2">
            <img
              src={getLogoUrl(company.logo)}
              alt={company.name}
              className="h-28 w-28 object-contain"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{company.name}</h1>
            <div className="flex flex-wrap justify-center gap-4 text-muted-foreground">
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
              {company.foundedYear && (
                <span className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Founded {company.foundedYear}
                </span>
              )}
            </div>
            {company.website && (
              <Button variant="outline" asChild className="mt-2">
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" />
                  Visit Website
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="jobs">
            Jobs ({jobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">About {company.name}</h2>
              {company.description ? (
                <div className="prose prose-sm max-w-none">
                  <p>{company.description}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">No description available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No open positions</h3>
                <p className="text-muted-foreground">
                  This company doesn't have any active job listings at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Link href={`/job/${job.id}`} key={job.id}>
                  <Card className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <div className="flex-1 space-y-1.5">
                          <h2 className="text-xl font-semibold">{job.title}</h2>
                          <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                            <span className="flex items-center">
                              <MapPin className="mr-1 h-4 w-4" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              {job.posted}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <Badge variant="secondary">{job.type}</Badge>
                            {job.remote && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                Remote
                              </Badge>
                            )}
                            <Badge variant="outline">{job.salary}</Badge>
                            {job.experienceLevel && (
                              <Badge variant="outline">{job.experienceLevel}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 