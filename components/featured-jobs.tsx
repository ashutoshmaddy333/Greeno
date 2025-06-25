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
      <section className="container mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Jobs</h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Explore our handpicked selection of top job opportunities</p>
            </div>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 sm:h-48 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Featured Jobs</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Explore our handpicked selection of top job opportunities</p>
          </div>
          <Link href="/jobs" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto group">
              <span className="text-sm sm:text-base">View All Jobs</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.length > 0 ? (
            jobs.map((job) => {
              let salaryObj: { min?: number; max?: number } | undefined = undefined;
              if (typeof job.salary === 'string' && job.salary.trim() !== '') {
                const salaryStr = job.salary.trim();
                if (/^\d+-\d+$/.test(salaryStr)) {
                  const [minStr, maxStr] = salaryStr.split('-');
                  const min = parseInt(minStr) * 100000;
                  const max = parseInt(maxStr) * 100000;
                  if (!isNaN(min) && !isNaN(max)) {
                    salaryObj = { min, max };
                  }
                } else if (/^\d+\+$/.test(salaryStr)) {
                  const min = parseInt(salaryStr);
                  if (!isNaN(min)) {
                    salaryObj = { min: min * 100000 };
                  }
                } else if (/^\d+$/.test(salaryStr)) {
                  const value = parseInt(salaryStr) * 100000;
                  if (!isNaN(value)) {
                    salaryObj = { min: value, max: value };
                  }
                }
              }
              return (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  type={job.type}
                  salary={salaryObj}
                  posted={job.posted}
                  logo={job.logo}
                  isActive={job.isActive}
                  isSaved={false}
                  isApplied={false}
                  onSave={() => {}}
                  onApply={() => { window.location.href = `/job/${job.id}`; }}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-8 sm:py-12">
              <p className="text-sm sm:text-base text-muted-foreground">No featured jobs available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
