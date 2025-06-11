"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ExternalLink } from "lucide-react"

interface Application {
  _id: string
  job: {
    _id: string
    title: string
    company: {
      name: string
      logo: string
    }
  }
  status: string
  createdAt: string
  updatedAt: string
}

interface RecentApplicationsProps {
  applications?: Application[]
}

export default function RecentApplications({ applications = [] }: RecentApplicationsProps) {
  // If no applications are provided, use mock data
  const mockApplications = [
    {
      _id: "1",
      job: {
        _id: "101",
        title: "Senior Frontend Developer",
        company: {
          name: "TechCorp",
          logo: "/placeholder.svg?height=40&width=40",
        },
      },
      status: "interviewing",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
      _id: "2",
      job: {
        _id: "102",
        title: "UX Designer",
        company: {
          name: "DesignHub",
          logo: "/placeholder.svg?height=40&width=40",
        },
      },
      status: "pending",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      _id: "3",
      job: {
        _id: "103",
        title: "Product Manager",
        company: {
          name: "InnovateCo",
          logo: "/placeholder.svg?height=40&width=40",
        },
      },
      status: "rejected",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    },
  ]

  const displayApplications = applications.length > 0 ? applications : mockApplications

  // Function to get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "interviewing":
        return "default"
      case "hired":
        return "success"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="space-y-4">
      {displayApplications.map((application) => (
        <div
          key={application._id}
          className="flex items-start space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted p-2">
            <img
              src={application.job.company.logo || "/placeholder.svg?height=40&width=40"}
              alt={application.job.company.name}
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{application.job.title}</h4>
              <Badge variant={getBadgeVariant(application.status)}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{application.job.company.name}</p>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              Applied on {formatDate(application.createdAt)}
              <Clock className="ml-3 mr-1 h-3 w-3" />
              Last updated {formatDate(application.updatedAt)}
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href={`/job/${application.job._id}`}>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      ))}
    </div>
  )
}
