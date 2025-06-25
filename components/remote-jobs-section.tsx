"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Globe } from "lucide-react"
import JobCard from "@/components/job-card"

interface RemoteJob {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  posted: string
  logo: string
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  remote: boolean
  experienceLevel: string
  educationLevel: string
  applicationDeadline: string
  views: number
  companyInfo: {
    name: string
    website: string
    logo: string
  }
}

export default function RemoteJobsSection() {
  const [jobs, setJobs] = useState<RemoteJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRemoteJobs = async () => {
      try {
        const response = await fetch("/api/jobs/remote")
        const data = await response.json()

        if (data.success) {
          setJobs(data.jobs)
        }
      } catch (error) {
        console.error("Error fetching remote jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRemoteJobs()
  }, [])

  if (loading) {
    return (
      <section className="container mx-auto py-16 px-4 md:px-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-primary" />
                <h2 className="text-3xl font-bold tracking-tighter">Remote Jobs</h2>
              </div>
              <p className="text-muted-foreground">Work from anywhere with these fully remote opportunities</p>
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
    <section className="container mx-auto py-16 px-4 md:px-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-primary" />
              <h2 className="text-3xl font-bold tracking-tighter">Remote Jobs</h2>
            </div>
            <p className="text-muted-foreground">Work from anywhere with these fully remote opportunities</p>
          </div>
          <Link href="/jobs?remote=true">
            <Button variant="outline" className="group">
              View All Remote Jobs
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  isActive={true}
                  isSaved={false}
                  isApplied={false}
                  onSave={() => {}}
                  onApply={() => { window.location.href = `/job/${job.id}`; }}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No remote jobs available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
