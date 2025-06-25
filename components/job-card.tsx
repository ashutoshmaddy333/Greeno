import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Clock, ArrowRight, Bookmark, BookmarkCheck, Send, IndianRupee, Briefcase, Target } from "lucide-react"
import { useState } from "react"
import { showToast } from "@/lib/toast"
import { useAuth } from "@/contexts/auth-context"
import { cn, getLogoUrl, getLogoDimensions } from "@/lib/utils"

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary?: {
    min?: number
    max?: number
  }
  posted: string
  logo: string
  isActive: boolean
  isSaved: boolean
  isApplied: boolean
  experienceLevel?: string
  skills?: string[]
  match?: number
  onSave: (id: string) => void
  onApply: (id: string) => void
}

export default function JobCard({
  title,
  company,
  location,
  type,
  salary,
  posted,
  logo,
  id,
  match,
  isActive,
  isSaved = false,
  isApplied = false,
  experienceLevel,
  skills = [],
  onSave,
  onApply,
}: JobCardProps) {
  const [saved, setSaved] = useState(isSaved)
  const [applied, setApplied] = useState(isApplied)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const isJobSeeker = user?.role === "jobseeker"
  const jobUrl = id ? `/job/${id}` : "#"
  const { width, height } = getLogoDimensions('card')

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

    try {
      setIsLoading(true)
      await onSave(id)
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

    try {
      setIsLoading(true)
      await onApply(id)
      setApplied(true)
      showToast.success("Application submitted successfully")
    } catch (error) {
      console.error("Error applying for job:", error)
      showToast.error("Failed to apply for job")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to format salary
  function formatSalary(min: number | undefined, max: number | undefined) {
    if (min === undefined || max === undefined || isNaN(min) || isNaN(max) || min === 0 && max === 0) {
      return "Salary not specified"
    }
    const minLakhs = Math.round(min / 100000)
    const maxLakhs = Math.round(max / 100000)
    return `${minLakhs}L-${maxLakhs}L`
  }

  return (
    <Link href={jobUrl} className="block">
      <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-primary/10 bg-white">
              <img
                src={getLogoUrl(logo)}
                alt={`${company} logo`}
                width={width}
                height={height}
                className="h-full w-full object-contain p-1"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg"
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base leading-tight hover:text-primary transition-colors truncate">
                  {title}
                </h3>
                {typeof isActive === 'boolean' && (
                  <Badge
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "text-xs sm:text-sm",
                      isActive ? "bg-green-500 hover:bg-green-600" : ""
                    )}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1">
                <Building className="mr-1 h-3 w-3 flex-shrink-0" />
                <span className="truncate">{company}</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-1">
                <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            </div>
            {match && (
              <Badge variant="outline" className="bg-primary/10 text-primary text-xs sm:text-sm ml-2">
                {match}% match
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
            <Badge variant="secondary" className="text-xs sm:text-sm">{type}</Badge>
            {experienceLevel && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                <Briefcase className="mr-1 h-3 w-3" />
                {experienceLevel}
              </Badge>
            )}
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {posted}
            </div>
          </div>

          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-primary/5">
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="outline" className="text-xs bg-primary/5">
                  +{skills.length - 3} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 sm:mt-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              <span>{formatSalary(salary?.min, salary?.max)}</span>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {Boolean(onSave) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 sm:px-3 gap-1 text-xs sm:text-sm"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {saved ? (
                    <BookmarkCheck className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                  <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
                </Button>
              )}
              {Boolean(onApply) && !applied && (
                <Button
                  size="sm"
                  className="h-8 px-2 sm:px-3 gap-1 text-xs sm:text-sm"
                  onClick={onApply ? () => onApply(id) : () => { window.location.href = `/job/${id}`; }}
                  disabled={isLoading}
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Apply</span>
                </Button>
              )}
              {applied && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 sm:px-3 gap-1 text-xs sm:text-sm"
                  disabled
                >
                  <span className="hidden sm:inline">Applied</span>
                  <span className="sm:hidden">✓</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
