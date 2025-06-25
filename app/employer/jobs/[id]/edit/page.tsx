"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"

interface Job {
  id: string
  title: string
  location: string
  type: string
  salary: string
  category: string
  description: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  skills: string[]
}

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [job, setJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "",
    salary: "",
    category: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    skills: "",
  })

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/jobs/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch job details")
      }
      
      const data = await response.json()
      if (data.success) {
        setJob(data.job)
        setFormData({
          title: data.job.title,
          location: data.job.location,
          type: data.job.type,
          salary: data.job.salary,
          category: data.job.category,
          description: data.job.description,
          responsibilities: data.job.responsibilities.join("\n"),
          requirements: data.job.requirements.join("\n"),
          benefits: data.job.benefits.join("\n"),
          skills: data.job.skills.join(", "),
        })
      } else {
        throw new Error(data.message || "Failed to fetch job details")
      }
    } catch (err) {
      console.error("Error fetching job details:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      toast.error("Failed to fetch job details")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const toastId = toast.loading("Saving job changes...", {
      duration: 2000,
    })
    
    try {
      setSaving(true)
      setError(null)

      // Convert newline-separated strings to arrays
      const jobData = {
        ...formData,
        responsibilities: formData.responsibilities.split("\n").filter(Boolean),
        requirements: formData.requirements.split("\n").filter(Boolean),
        benefits: formData.benefits.split("\n").filter(Boolean),
        skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
      }

      const response = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update job")
      }

      if (data.success) {
        // Dismiss the loading toast
        toast.dismiss(toastId)
        
        // Show success toast
        toast.success("Job updated successfully!", {
          duration: 3000,
          position: "top-center",
        })
        
        // Wait for toast to be visible
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Redirect to the specific job details page
        router.push(`/employer/jobs/${id}`)
        router.refresh() // Refresh the page data
      } else {
        throw new Error(data.message || "Failed to update job")
      }
    } catch (err) {
      console.error("Error updating job:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      
      // Dismiss the loading toast
      toast.dismiss(toastId)
      
      // Show error toast
      toast.error("Failed to update job. Please try again.", {
        duration: 3000,
        position: "top-center",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    fetchJobDetails()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading job details...</span>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Error Loading Job Details</h2>
          <p className="mt-2 text-muted-foreground">{error || "Job not found"}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/employer/jobs")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mb-6">
        <Link
          href={`/employer/jobs/${id}`}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Job Details
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Job Posting</CardTitle>
            <CardDescription>Update the details of your job posting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA (Remote)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select
                  name="type"
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary Range</Label>
                <Input
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={(e) => {
                    // Only allow valid salary format
                    const value = e.target.value;
                    if (value === '' || /^\$?\d+K?\s*-\s*\$?\d+K?$/i.test(value)) {
                      handleChange(e);
                    }
                  }}
                  placeholder="e.g. $120K - $150K"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter salary in format: $120K - $150K (numbers followed by K for thousands)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  name="category"
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Customer Service">Customer Service</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a detailed description of the job..."
                className="min-h-[200px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities</Label>
              <Textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                placeholder="Enter each responsibility on a new line"
                className="min-h-[150px]"
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter each responsibility on a new line
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Enter each requirement on a new line"
                className="min-h-[150px]"
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter each requirement on a new line
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                placeholder="Enter each benefit on a new line"
                className="min-h-[150px]"
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter each benefit on a new line
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Required Skills</Label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Enter skills separated by commas"
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter skills separated by commas (e.g., React, TypeScript, Node.js)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/employer/jobs/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 