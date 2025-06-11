"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import JobCard from "@/components/job-card"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  posted: string
  logo: string
  isActive: boolean
}

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await fetch("/api/jobs/featured")
        const data = await response.json()

        if (data.success) {
          setJobs(data.jobs)
        }
      } catch (error) {
        console.error("Error fetching featured jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedJobs()
  }, [])

  if (loading) {
    return (
      <section className="container mx-auto py-12 px-4 md:px-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Featured Jobs</h2>
              <p className="text-muted-foreground">Explore our handpicked selection of top job opportunities</p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto py-12 px-4 md:px-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Featured Jobs</h2>
            <p className="text-muted-foreground">Explore our handpicked selection of top job opportunities</p>
          </div>
          <Link href="/jobs">
            <Button variant="outline" className="group">
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                title={job.title}
                company={job.company}
                location={job.location}
                type={job.type}
                salary={job.salary}
                posted={job.posted}
                logo={job.logo}
                jobId={job.id}
                isActive={job.isActive}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No featured jobs available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
