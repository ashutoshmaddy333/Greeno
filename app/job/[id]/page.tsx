"use client"

import { useState, useEffect, useRef } from "react"
import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Flag,
  Globe,
  MapPin,
  Share2,
  Users,
  Eye,
  Plus,
  Trash2,
  Briefcase,
  GraduationCap,
  Send,
  Loader2,
} from "lucide-react"
import SimilarJobs from "@/components/similar-jobs"
import { getJobById, applyForJob } from "@/lib/actions"
import { showToast } from "@/lib/toast"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface CompanyInfo {
  name: string
  size: string
  website: string
  founded: string
  description: string
  logo: string
  industry: string
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  posted: string
  description: string
  requirements: string[]
  benefits: string[]
  skills: string[]
  logo: string
  views: number
  isActive: boolean
  remote: boolean
  experienceLevel: string
  responsibilities: string[]
  applicationDeadline?: string
  companyInfo?: CompanyInfo
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [applicationData, setApplicationData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    experience: "fresher",
    yearsOfExperience: "",
    education: [{
      degree: "",
      field: "",
      institution: "",
      graduationYear: new Date().getFullYear(),
    }],
    coverLetter: "",
    resumeFile: null as File | null,
  })
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchJob()
  }, [])

  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated && user?.role === "jobseeker") {
        try {
          const response = await fetch("/api/profile")
          const data = await response.json()
          if (response.ok) {
            setProfile(data)
            // Auto-fill application form with profile data
            if (data) {
              setApplicationData(prev => ({
                ...prev,
                firstName: data.user?.name?.split(' ')[0] || "",
                lastName: data.user?.name?.split(' ').slice(1).join(' ') || "",
                email: data.user?.email || "",
                phoneNumber: data.phone || "",
                education: data.education?.length > 0 ? data.education.map((edu: any) => ({
                  degree: edu.degree || "",
                  field: edu.field || "",
                  institution: edu.institution || "",
                  graduationYear: edu.graduationYear || new Date().getFullYear(),
                })) : prev.education,
              }))
            }
          } else {
            showToast.error(data.message || "Failed to load profile")
          }
        } catch (error) {
          console.error("Error loading profile:", error)
          showToast.error("Failed to load profile")
        } finally {
          setProfileLoading(false)
        }
      }
    }

    loadProfile()
  }, [isAuthenticated, user])

  const fetchJob = async () => {
    setLoading(true)
    try {
      const result = await getJobById(resolvedParams.id)

      if (result.success) {
        setJob(result.job)
      } else {
        throw new Error(result.message || "Failed to fetch job details")
      }
    } catch (error: any) {
      showToast.error(error.message || "An error occurred while fetching job details")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveJob = () => {
    setIsSaved(!isSaved)

    if (!isSaved) {
      showToast.success(`${job?.title} at ${job?.company} saved to your favorites!`)
    } else {
      showToast.custom(`${job?.title} removed from your favorites`)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field?: string,
    index?: number
  ) => {
    if (field === "education" && typeof index === "number") {
      const { name, value } = e.target
      setApplicationData((prev) => ({
        ...prev,
        education: prev.education.map((edu, i) =>
          i === index ? { ...edu, [name]: value } : edu
        ),
      }))
    } else {
      const { name, value } = e.target
      setApplicationData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const addEducation = () => {
    setApplicationData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          degree: "",
          field: "",
          institution: "",
          graduationYear: new Date().getFullYear(),
        },
      ],
    }))
  }

  const removeEducation = (index: number) => {
    setApplicationData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      showToast.error("Please sign in to apply for jobs")
      router.push("/login?redirect=/job/" + resolvedParams.id)
      return
    }

    if (user?.role !== "jobseeker") {
      showToast.error("Only job seekers can apply to jobs")
      return
    }

    if (!profile) {
      showToast.error("Please complete your profile before applying for jobs")
      router.push("/profile")
      return
    }

    setShowApplyDialog(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast.error("Please upload a PDF file")
        e.target.value = ''
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("File size must be less than 5MB")
        e.target.value = ''
        return
      }
      setApplicationData(prev => ({ ...prev, resumeFile: file }))
    }
  }

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsApplying(true)
    setIsUploading(true)

    try {
      if (!profile) {
        throw new Error("Please complete your profile before applying for jobs")
      }

      // Validate required fields
      if (!applicationData.firstName || !applicationData.lastName || !applicationData.email || 
          !applicationData.phoneNumber || !applicationData.resumeFile) {
        throw new Error("Please fill in all required fields")
      }

      if (applicationData.experience === "experienced" && !applicationData.yearsOfExperience) {
        throw new Error("Please provide years of experience")
      }

      if (applicationData.education.some(edu => !edu.degree || !edu.field || !edu.institution)) {
        throw new Error("Please fill in all education details")
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('resume', applicationData.resumeFile)
      formData.append('firstName', applicationData.firstName)
      formData.append('middleName', applicationData.middleName)
      formData.append('lastName', applicationData.lastName)
      formData.append('email', applicationData.email)
      formData.append('phoneNumber', applicationData.phoneNumber)
      formData.append('experience', applicationData.experience)
      if (applicationData.experience === "experienced") {
        formData.append('yearsOfExperience', applicationData.yearsOfExperience)
      }
      formData.append('education', JSON.stringify(applicationData.education))
      formData.append('coverLetter', applicationData.coverLetter)

      const result = await applyForJob(resolvedParams.id, formData)

      if (result.success) {
        showToast.success(result.message || "Application submitted successfully!")
        setShowApplyDialog(false)
        setApplicationData({
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          experience: "fresher",
          yearsOfExperience: "",
          education: [{
            degree: "",
            field: "",
            institution: "",
            graduationYear: new Date().getFullYear(),
          }],
          resumeFile: null,
          coverLetter: "",
        })
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        throw new Error(result.message || "Failed to submit application")
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to submit application")
      if (error.message.includes("profile")) {
        router.push("/profile")
      }
    } finally {
      setIsApplying(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const formatDescription = (text: any) => {
    // Handle null or undefined
    if (!text) {
      return ""
    }

    // If text is an array, convert it to a bulleted list
    if (Array.isArray(text)) {
      return `<ul>${text.map(item => `<li>${item.trim()}</li>`).join('')}</ul>`
    }

    // If text is a string, handle bullet points and line breaks
    if (typeof text === 'string') {
      return text
        .split("\n")
        .map((line: string) => {
          if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
            return `<li>${line.trim().substring(1).trim()}</li>`
          }
          return line.trim() ? `<p>${line.trim()}</p>` : ""
        })
        .join("")
        .replace(/(<li>.*<\/li>)/g, "<ul>$1</ul>")
    }

    return ""
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Job not found</h3>
          <p className="text-muted-foreground">The job you're looking for doesn't exist or has been removed</p>
          <Link href="/jobs">
            <Button className="mt-4">Browse All Jobs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="mb-6">
        <Link
          href="/jobs"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted p-2">
                  <img
                    src={job.logo || "/placeholder.svg?height=64&width=64"}
                    alt={job.company}
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{job.title}</h1>
                    <Badge
                      variant={job.isActive ? "default" : "outline"}
                      className={job.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                    >
                      {job.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                    <span className="flex items-center">
                      <Building className="mr-1 h-4 w-4" />
                      {job.company}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {job.location}
                    </span>
                    {job.views && (
                      <span className="flex items-center">
                        <Eye className="mr-1 h-4 w-4" />
                        {job.views} views
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary" className="rounded-md">
                      {job.type}
                    </Badge>
                    {job.remote && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Remote
                      </Badge>
                    )}
                    <Badge variant="outline" className="rounded-md">
                      <span>{job.salary}</span>
                    </Badge>
                    <Badge variant="outline" className="rounded-md">
                      <Clock className="mr-1 h-3 w-3" />
                      {job.posted}
                    </Badge>
                    {job.experienceLevel && (
                      <Badge variant="outline" className="rounded-md">
                        {job.experienceLevel}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-row gap-2 sm:flex-col">
                  <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex-1" onClick={handleApplyClick}>Apply Now</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Apply for {job?.title}</DialogTitle>
                        <DialogDescription>
                          Complete the form below to submit your application to {job?.company}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleApply} className="space-y-6 py-4">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Personal Information</h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">
                                First Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="firstName"
                                name="firstName"
                                value={applicationData.firstName}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="middleName">Middle Name</Label>
                              <Input
                                id="middleName"
                                name="middleName"
                                value={applicationData.middleName}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">
                                Last Name <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="lastName"
                                name="lastName"
                                value={applicationData.lastName}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={applicationData.email}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phoneNumber">
                                Phone Number <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                value={applicationData.phoneNumber}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Professional Information</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Experience Level <span className="text-red-500">*</span></Label>
                              <RadioGroup
                                value={applicationData.experience}
                                onValueChange={(value) => 
                                  setApplicationData(prev => ({ ...prev, experience: value as "fresher" | "experienced" }))
                                }
                                className="flex gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="fresher" id="fresher" />
                                  <Label htmlFor="fresher">Fresher</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="experienced" id="experienced" />
                                  <Label htmlFor="experienced">Experienced</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {applicationData.experience === "experienced" && (
                              <div className="space-y-2">
                                <Label htmlFor="yearsOfExperience">
                                  Years of Experience <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  id="yearsOfExperience"
                                  name="yearsOfExperience"
                                  type="number"
                                  min="0"
                                  value={applicationData.yearsOfExperience}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Education */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Education</h3>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addEducation}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Education
                            </Button>
                          </div>
                          {applicationData.education.map((edu, index) => (
                            <div key={index} className="space-y-4 rounded-lg border p-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">Education #{index + 1}</h4>
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeEducation(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label htmlFor={`degree-${index}`}>
                                    Degree <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={`degree-${index}`}
                                    name="degree"
                                    value={edu.degree}
                                    onChange={(e) => handleInputChange(e, "education", index)}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`field-${index}`}>
                                    Field of Study <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={`field-${index}`}
                                    name="field"
                                    value={edu.field}
                                    onChange={(e) => handleInputChange(e, "education", index)}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`institution-${index}`}>
                                    Institution <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={`institution-${index}`}
                                    name="institution"
                                    value={edu.institution}
                                    onChange={(e) => handleInputChange(e, "education", index)}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`graduationYear-${index}`}>
                                    Graduation Year <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={`graduationYear-${index}`}
                                    name="graduationYear"
                                    type="number"
                                    min="1900"
                                    max={new Date().getFullYear() + 4}
                                    value={edu.graduationYear}
                                    onChange={(e) => handleInputChange(e, "education", index)}
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Application Materials */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Application Materials</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="resume">
                                Resume (PDF) <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="resume"
                                name="resume"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                required
                                className="cursor-pointer"
                              />
                              <p className="text-xs text-muted-foreground">
                                Upload your resume in PDF format (max 5MB)
                              </p>
                              {applicationData.resumeFile && (
                                <p className="text-sm text-muted-foreground">
                                  Selected file: {applicationData.resumeFile.name}
                                </p>
                              )}
                              {isUploading && (
                                <div className="w-full bg-secondary rounded-full h-2.5">
                                  <div
                                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="coverLetter">Cover Letter</Label>
                              <Textarea
                                id="coverLetter"
                                name="coverLetter"
                                placeholder="Why are you a good fit for this position?"
                                value={applicationData.coverLetter}
                                onChange={handleInputChange}
                                className="min-h-[150px]"
                              />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setShowApplyDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isApplying}>
                            {isApplying ? "Submitting..." : "Submit Application"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="icon" onClick={handleSaveJob} className="h-10 w-10">
                    {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="description">
                <TabsList className="w-full rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="description"
                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
                  >
                    Job Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="company"
                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary"
                  >
                    Company
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="p-6 space-y-6">
                  {job.description && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                      <div
                        className="prose max-w-none dark:prose-invert text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: formatDescription(job.description) }}
                      />
                    </div>
                  )}

                  {job.responsibilities && job.responsibilities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Responsibilities</h3>
                      <div
                        className="prose max-w-none dark:prose-invert text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: formatDescription(job.responsibilities) }}
                      />
                    </div>
                  )}

                  {job.requirements && job.requirements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                      <div
                        className="prose max-w-none dark:prose-invert text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: formatDescription(job.requirements) }}
                      />
                    </div>
                  )}

                  {job.benefits && job.benefits.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                      <div
                        className="prose max-w-none dark:prose-invert text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: formatDescription(job.benefits) }}
                      />
                    </div>
                  )}

                  {job.skills && job.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="rounded-md">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={handleApplyClick}>Apply Now</Button>
                      </DialogTrigger>
                    </Dialog>
                    <Button variant="outline" onClick={handleSaveJob}>
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="mr-2 h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="mr-2 h-4 w-4" />
                          Save Job
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="company" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-lg border bg-muted p-2">
                        <img
                          src={job.companyInfo?.logo || "/placeholder.svg?height=64&width=64"}
                          alt={job.companyInfo?.name || job.company}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{job.companyInfo?.name || job.company}</h3>
                        <p className="text-sm text-muted-foreground">{job.companyInfo?.industry || "Technology"}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{job.companyInfo?.size || "1-50 employees"}</span>
                      </div>
                      {job.companyInfo?.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={job.companyInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {job.companyInfo.website}
                          </a>
                        </div>
                      )}
                      {job.companyInfo?.founded && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Founded in {job.companyInfo.founded}</span>
                        </div>
                      )}
                    </div>
                    {job.companyInfo?.description && (
                      <div>
                        <h4 className="mb-2 font-medium">About {job.companyInfo.name || job.company}</h4>
                        <p className="text-muted-foreground">{job.companyInfo.description}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Job Summary</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Building className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Company</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Job Type</p>
                    <p className="text-sm text-muted-foreground">{job.type}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Salary Range</p>
                    <p className="text-sm text-muted-foreground">{job.salary}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Posted</p>
                    <p className="text-sm text-muted-foreground">{job.posted}</p>
                  </div>
                </div>
                {job.applicationDeadline && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Application Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.applicationDeadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <SimilarJobs />
        </div>
      </div>
    </div>
  )
}
