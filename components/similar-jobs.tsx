import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, MapPin } from "lucide-react"

export default function SimilarJobs() {
  // Mock data for similar jobs
  const similarJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      company: "WebTech Inc.",
      location: "San Francisco, CA",
      logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      title: "React Developer",
      company: "AppWorks",
      location: "Remote",
      logo: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      title: "UI Engineer",
      company: "DesignSoft",
      location: "New York, NY",
      logo: "/placeholder.svg?height=40&width=40",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Jobs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0 divide-y">
          {similarJobs.map((job) => (
            <Link key={job.id} href={`/job/${job.id}`}>
              <div className="flex items-start space-x-3 p-4 transition-colors hover:bg-muted/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted p-2">
                  <img src={job.logo || "/placeholder.svg"} alt={job.company} className="h-6 w-6 object-contain" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{job.title}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building className="mr-1 h-3 w-3" />
                    {job.company}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    {job.location}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="p-4">
          <Button variant="outline" className="w-full">
            View More Similar Jobs
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
