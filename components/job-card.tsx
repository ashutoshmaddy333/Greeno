import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Clock, ArrowRight, Bookmark, BookmarkCheck, Send, DollarSign } from "lucide-react"
import { useState } from "react"
import { showToast } from "@/lib/toast"
import { useAuth } from "@/contexts/auth-context"

interface JobCardProps {
  title: string
  company: string
  location: string
  type: string
  salary: string
  posted: string
  logo: string
  jobId?: string
  match?: number
  id?: string
  isActive?: boolean
  isSaved?: boolean
  isApplied?: boolean
  onSave?: (jobId: string) => Promise<void>
  onApply?: (jobId: string) => Promise<void>
}

export default function JobCard({
  title,
  company,
  location,
  type,
  salary,
  posted,
  logo,
  jobId,
  id,
  match,
  isActive,
  isSaved = false,
  isApplied = false,
  onSave,
  onApply,
}: JobCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [applied, setApplied] = useState(isApplied)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const isJobSeeker = user?.role === "jobseeker"
  const jobUrl = jobId || id ? `/job/${jobId || id}` : "#"

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      showToast.error("Please sign in to save jobs")
      return
    }

    if (!isJobSeeker) {
      showToast.error("Only job seekers can save jobs")
      return
    }

    if (!onSave || !jobId) return

    try {
      setIsLoading(true)
      await onSave(jobId)
      setSaved(!saved)
      showToast.success(saved ? "Job removed from saved jobs" : "Job saved successfully")
    } catch (error) {
      console.error("Error saving job:", error)
      showToast.error("Failed to save job")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      showToast.error("Please sign in to apply for jobs")
      return
    }

    if (!isJobSeeker) {
      showToast.error("Only job seekers can apply for jobs")
      return
    }

    if (!onApply || !jobId) return

    try {
      setIsLoading(true)
      await onApply(jobId)
      setApplied(true)
      showToast.success("Application submitted successfully")
    } catch (error) {
      console.error("Error applying for job:", error)
      showToast.error("Failed to apply for job")
    } finally {
      setIsLoading(false)
    }
  }

  // Convert salary string to display format (e.g., "500000-1000000" to "₹5L - ₹10L")
  const formatSalary = (salaryStr: string) => {
    if (salaryStr.includes('L')) return salaryStr; // Already in lakhs format
    
    try {
      const [min, max] = salaryStr.split('-').map(s => parseInt(s.trim()));
      if (isNaN(min) || isNaN(max)) return salaryStr;
      
      const minLakhs = Math.round(min / 100000);
      const maxLakhs = Math.round(max / 100000);
      return `₹${minLakhs}L - ₹${maxLakhs}L`;
    } catch {
      return salaryStr;
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <img
              src={logo || "/placeholder.svg?height=32&width=32"}
              alt={`${company} logo`}
              className="h-8 w-8 rounded object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=32&width=32"
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold leading-tight hover:text-primary transition-colors truncate">
                <Link href={jobUrl} className="hover:underline">
                  {title}
                </Link>
              </h3>
              {typeof isActive === 'boolean' && (
                <Badge
                  variant={isActive ? "default" : "outline"}
                  className={isActive ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              )}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Building className="mr-1 h-3 w-3 flex-shrink-0" />
              <span className="truncate">{company}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          {match && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {match}% match
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="secondary">{type}</Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            {posted}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{formatSalary(salary)}</span>
          </div>
          <div className="flex items-center gap-2">
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={handleSave}
                disabled={isLoading}
              >
                {saved ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
                {saved ? "Saved" : "Save"}
              </Button>
            )}
            {onApply && !applied && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={handleApply}
                disabled={isLoading}
              >
                <Send className="h-4 w-4" />
                Apply
              </Button>
            )}
            {applied && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Applied
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href={jobUrl}>
                View Job
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
