"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Calendar, CheckCircle, DollarSign, Globe, Info, MapPin, Upload } from "lucide-react"
import { showToast } from "@/lib/toast"
import { postJob, getEmployerProfile } from "@/lib/actions"

export default function PostJobPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [companyProfile, setCompanyProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    category: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: "",
    applicationDeadline: "",
    isRemote: false,
    experienceLevel: "",
    educationLevel: "",
    skills: "",
    companyWebsite: "",
    companySize: "",
    companyIndustry: "",
    companyDescription: "",
  })

  // Add this useEffect to check for company profile
  useEffect(() => {
    const checkCompanyProfile = async () => {
      try {
        const result = await getEmployerProfile()
        if (result.success && result.company) {
          setCompanyProfile(result.company)
          // Pre-fill company name if available
          setFormData((prev) => ({
            ...prev,
            company: result.company.name,
            companyWebsite: result.company.website || "",
            companySize: result.company.size || "",
            companyIndustry: result.company.industry || "",
            companyDescription: result.company.description || "",
          }))
        } else {
          // Redirect to dashboard if no company profile
          router.push("/employer?message=create-company-first")
        }
      } catch (error) {
        console.error("Error checking company profile:", error)
        router.push("/employer")
      } finally {
        setProfileLoading(false)
      }
    }

    checkCompanyProfile()
  }, [router])

  // Add loading state
  if (profileLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
          <p className="text-muted-foreground">Checking your company profile...</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (checked: boolean, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: checked }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      showToast.error("File size exceeds 2MB limit")
      return
    }

    // Check file type
    const acceptedTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    if (!acceptedTypes.includes(file.type)) {
      showToast.error("File format not supported. Please upload JPG, PNG, or SVG")
      return
    }

    setLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const loadingToast = showToast.loading("Posting job...")

    try {
      // Validate salary format (now in lakhs)
      const salaryMatch = formData.salary.match(/^₹?(\d+)L?\s*-\s*₹?(\d+)L?$/i)
      if (!salaryMatch) {
        throw new Error("Invalid salary format. Please use format: ₹5L - ₹10L")
      }

      const salaryMin = parseInt(salaryMatch[1]) * 100000 // Convert L to actual number
      const salaryMax = parseInt(salaryMatch[2]) * 100000 // Convert L to actual number

      if (salaryMin > salaryMax) {
        throw new Error("Minimum salary cannot be greater than maximum salary")
      }

      if (salaryMin < 0 || salaryMax < 0) {
        throw new Error("Salary values cannot be negative")
      }

      // Validate required fields
      const requiredFields = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        category: formData.category,
        salary: formData.salary,
        description: formData.description,
        responsibilities: formData.responsibilities,
        requirements: formData.requirements,
        experienceLevel: formData.experienceLevel,
      }

      const missingFields = Object.entries(requiredFields)
        .filter(([key, value]) => !value || value.trim() === "")
        .map(([key]) => key)

      if (missingFields.length > 0) {
        showToast.dismiss(loadingToast)
        throw new Error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      }

      // Call the server action to post the job
      const result = await postJob({
        ...formData,
        logoFile: logoFile
      })

      if (result.success) {
        showToast.dismiss(loadingToast)
        showToast.success("Job posted successfully! It will be visible to job seekers shortly.")
        setIsSubmitting(false)
        setIsSubmitted(true)

        // Reset form
        setFormData({
          title: "",
          company: "",
          location: "",
          type: "",
          salary: "",
          category: "",
          description: "",
          responsibilities: "",
          requirements: "",
          benefits: "",
          applicationDeadline: "",
          isRemote: false,
          experienceLevel: "",
          educationLevel: "",
          skills: "",
          companyWebsite: "",
          companySize: "",
          companyIndustry: "",
          companyDescription: "",
        })
        setLogoFile(null)
        setLogoPreview(null)
      } else {
        showToast.dismiss(loadingToast)
        throw new Error(result.message || "Failed to post job")
      }
    } catch (error: any) {
      showToast.dismiss(loadingToast)
      showToast.error(error.message || "An error occurred while posting the job")
      setIsSubmitting(false)
    }
  }

  const jobTypes = ["Full-time", "Part-time", "Contract", "Temporary", "Internship", "Freelance"]

  const jobCategories = [
    // For B.Tech
    { value: "software-engineer", label: "💻 Software Engineer", education: "B.Tech" },
    { value: "mechanical-engineer", label: "⚙️ Mechanical Engineer", education: "B.Tech" },
    { value: "electrical-engineer", label: "⚡ Electrical Engineer", education: "B.Tech" },
    { value: "civil-engineer", label: "🏗️ Civil Engineer", education: "B.Tech" },
    { value: "electronics-engineer", label: "🔌 Electronics Engineer", education: "B.Tech" },
    { value: "chemical-engineer", label: "🧪 Chemical Engineer", education: "B.Tech" },
    { value: "aerospace-engineer", label: "✈️ Aerospace Engineer", education: "B.Tech" },
    { value: "robotics-engineer", label: "🤖 Robotics Engineer", education: "B.Tech" },
    { value: "ai-ml-engineer", label: "🧠 AI/ML Engineer", education: "B.Tech" },
    { value: "data-engineer", label: "📊 Data Engineer", education: "B.Tech" },
    { value: "network-engineer", label: "🌐 Network Engineer", education: "B.Tech" },
    { value: "embedded-systems-engineer", label: "🔧 Embedded Systems Engineer", education: "B.Tech" },
    { value: "biomedical-engineer", label: "🏥 Biomedical Engineer", education: "B.Tech" },
    { value: "environmental-engineer", label: "🌱 Environmental Engineer", education: "B.Tech" },
    { value: "industrial-engineer", label: "🏭 Industrial Engineer", education: "B.Tech" },
    // For 10th Pass
    { value: "peon-office-boy", label: "🧹 Peon / Office Boy", education: "10th Pass" },
    { value: "general-helper", label: "🛠 General Helper", education: "10th Pass" },
    { value: "packaging-assistant", label: "📦 Packaging Assistant", education: "10th Pass" },
    { value: "loading-unloading-staff", label: "🚚 Loading & Unloading Staff", education: "10th Pass" },
    { value: "cleaning-housekeeping-staff", label: "🧯 Cleaning / Housekeeping Staff", education: "10th Pass" },
    // For 12th Pass
    { value: "machine-operator", label: "🏭 Machine Operator", education: "12th Pass" },
    { value: "quality-checker", label: "🔍 Quality Checker", education: "12th Pass" },
    { value: "store-assistant", label: "🧾 Store Assistant", education: "12th Pass" },
    { value: "production-assistant", label: "📋 Production Assistant", education: "12th Pass" },
    { value: "warehouse-assistant", label: "📦 Warehouse Assistant", education: "12th Pass" },
    // For ITI Pass
    { value: "electrician", label: "🔌 Electrician", education: "ITI Pass" },
    { value: "fitter", label: "🔧 Fitter", education: "ITI Pass" },
    { value: "welder", label: "🔩 Welder", education: "ITI Pass" },
    { value: "machinist", label: "⚙️ Machinist", education: "ITI Pass" },
    { value: "maintenance-technician", label: "🛠️ Maintenance Technician", education: "ITI Pass" },
    { value: "cnc-machine-operator", label: "🖥 CNC Machine Operator", education: "ITI Pass" },
    { value: "tool-room-assistant", label: "🔧 Tool Room Assistant", education: "ITI Pass" },
    { value: "mechanical-technician", label: "🏗️ Mechanical Technician", education: "ITI Pass" },
    // Other Entry-Level / Support Roles
    { value: "store-keeper", label: "📋 Store Keeper", education: "Entry Level" },
    { value: "material-handler", label: "🪜 Material Handler", education: "Entry Level" },
    { value: "packing-supervisor", label: "📦 Packing Supervisor", education: "Entry Level" },
    { value: "inventory-assistant", label: "🛒 Inventory Assistant", education: "Entry Level" },
    { value: "assembly-line-worker", label: "🧰 Assembly Line Worker", education: "Entry Level" },
  ]

  const experienceLevels = ["Entry Level", "Mid Level", "Senior Level", "Executive", "Internship"]

  const educationLevels = [
    "High School",
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "Professional Certification",
    "No Specific Requirement",
  ]

  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1001-5000 employees",
    "5000+ employees"
  ]

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Media",
    "Hospitality",
    "Transportation",
    "Construction",
    "Energy",
    "Agriculture",
    "Government",
    "Non-profit",
  ]

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 max-w-3xl">
        <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Job Posted Successfully!</h2>
          <p className="text-muted-foreground max-w-md">
            Your job has been posted and is now visible to job seekers. You can manage your job postings from your
            dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/employer">
              <Button variant="outline" className="button-hover">
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/employer/post-job">
              <Button className="button-hover">Post Another Job</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/employer"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card className="card-3d border-primary/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 border-b border-primary/10">
          <CardTitle className="text-2xl md:text-3xl text-center text-primary">Post a New Job</CardTitle>
          <CardDescription className="text-center">Fill out the form below to create a new job posting</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={`step-${currentStep}`} className="w-full">
            <TabsList className="grid grid-cols-3 w-full rounded-none bg-muted/50">
              <TabsTrigger
                value="step-1"
                className={`data-[state=active]:bg-primary/10 data-[state=active]:text-primary ${currentStep >= 1 ? "text-primary" : ""}`}
                disabled
              >
                Job Details
              </TabsTrigger>
              <TabsTrigger
                value="step-2"
                className={`data-[state=active]:bg-primary/10 data-[state=active]:text-primary ${currentStep >= 2 ? "text-primary" : ""}`}
                disabled
              >
                Job Description
              </TabsTrigger>
              <TabsTrigger
                value="step-3"
                className={`data-[state=active]:bg-primary/10 data-[state=active]:text-primary ${currentStep >= 3 ? "text-primary" : ""}`}
                disabled
              >
                Company Info
              </TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <TabsContent value="step-1" className={currentStep === 1 ? "block" : "hidden"}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Job Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g. Senior Frontend Developer"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="transition-all border-primary/20 focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company">
                        Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="e.g. TechCorp"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="transition-all border-primary/20 focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">
                        Location <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            name="location"
                            placeholder="e.g. San Francisco, CA"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="pl-10 transition-all border-primary/20 focus:border-primary focus:ring-primary"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRemote"
                      checked={formData.isRemote}
                      onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, "isRemote")}
                    />
                    <Label htmlFor="isRemote" className="text-sm font-normal">
                      This is a remote position
                    </Label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="type">
                        Job Type <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.type} onValueChange={(value) => handleSelectChange(value, "type")}>
                        <SelectTrigger className="transition-all border-primary/20 focus:border-primary focus:ring-primary">
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">
                        Job Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange(value, "category")}
                      >
                        <SelectTrigger className="transition-all border-primary/20 focus:border-primary focus:ring-primary">
                          <SelectValue placeholder="Select job category" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobCategories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <span>{category.label}</span>
                                <span className="text-xs text-muted-foreground">({category.education})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salary">
                      Salary Range (per annum) <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="salary"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        placeholder="e.g., ₹5L - ₹10L"
                        className="transition-all border-primary/20 focus:border-primary focus:ring-primary"
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter salary range in lakhs (e.g., ₹5L - ₹10L)
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="experienceLevel">
                        Experience Level <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.experienceLevel}
                        onValueChange={(value) => handleSelectChange(value, "experienceLevel")}
                      >
                        <SelectTrigger className="transition-all border-primary/20 focus:border-primary focus:ring-primary">
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="educationLevel">Education Level</Label>
                      <Select
                        value={formData.educationLevel}
                        onValueChange={(value) => handleSelectChange(value, "educationLevel")}
                      >
                        <SelectTrigger className="transition-all border-primary/20 focus:border-primary focus:ring-primary">
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent>
                          {educationLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="applicationDeadline">Application Deadline</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="applicationDeadline"
                        name="applicationDeadline"
                        type="date"
                        value={formData.applicationDeadline}
                        onChange={handleInputChange}
                        className="pl-10 transition-all border-primary/20 focus:border-primary focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={nextStep} className="button-3d">
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="step-2" className={currentStep === 2 ? "block" : "hidden"}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Job Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Provide a detailed description of the job..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className="min-h-[100px] transition-all border-primary/20 focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="responsibilities">
                      Responsibilities <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="responsibilities"
                      name="responsibilities"
                      placeholder="List the key responsibilities for this role..."
                      value={formData.responsibilities}
                      onChange={handleInputChange}
                      className="min-h-[100px] transition-all border-primary/20 focus:border-primary focus:ring-primary"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Use bullet points for better readability (• Item 1)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">
                      Requirements <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      placeholder="List the requirements for this role..."
                      value={formData.requirements}
                      onChange={handleInputChange}
                      className="min-h-[100px] transition-all border-primary/20 focus:border-primary focus:ring-primary"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Use bullet points for better readability (• Item 1)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits</Label>
                    <Textarea
                      id="benefits"
                      name="benefits"
                      placeholder="List the benefits offered with this position..."
                      value={formData.benefits}
                      onChange={handleInputChange}
                      className="min-h-[100px] transition-all border-primary/20 focus:border-primary focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tip: Use bullet points for better readability (• Item 1)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills</Label>
                    <Textarea
                      id="skills"
                      name="skills"
                      placeholder="List the skills required for this role (e.g., JavaScript, React, Node.js)..."
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="min-h-[100px] transition-all border-primary/20 focus:border-primary focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground">Tip: Separate skills with commas</p>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={prevStep} className="button-3d border-primary/20">
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep} className="button-3d">
                    Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="step-3" className={currentStep === 3 ? "block" : "hidden"}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Company Logo</Label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-lg p-6 transition-all hover:border-primary/40">
                      {logoPreview ? (
                        <div className="flex flex-col items-center gap-4">
                          <img
                            src={logoPreview || "/placeholder.svg"}
                            alt="Logo Preview"
                            className="h-20 w-20 object-contain"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setLogoFile(null)
                              setLogoPreview(null)
                            }}
                            className="button-3d border-primary/20"
                          >
                            Remove Logo
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-primary/50 mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag & drop your company logo here or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground mb-4">
                            Accepted formats: JPG, PNG, SVG — Max size: 2MB
                          </p>
                          <Input
                            id="logo"
                            type="file"
                            className="hidden"
                            accept=".jpg,.jpeg,.png,.svg"
                            onChange={handleLogoChange}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("logo")?.click()}
                            className="button-3d border-primary/20"
                          >
                            Browse Files
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Company Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="companyWebsite"
                          name="companyWebsite"
                          placeholder="e.g. https://techcorp.com"
                          value={formData.companyWebsite}
                          onChange={handleInputChange}
                          className="pl-10 transition-all border-primary/20 focus:border-primary focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) => handleSelectChange(value, "companySize")}
                      >
                        <SelectTrigger className="transition-all border-primary/20 focus:border-primary focus:ring-primary">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyIndustry">Company Industry</Label>
                    <Select
                      value={formData.companyIndustry}
                      onValueChange={(value) => handleSelectChange(value, "companyIndustry")}
                    >
                      <SelectTrigger className="transition-all border-primary/20 focus:border-primary focus:ring-primary">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">Company Description</Label>
                    <Textarea
                      id="companyDescription"
                      name="companyDescription"
                      placeholder="Provide a brief description of your company..."
                      value={formData.companyDescription}
                      onChange={handleInputChange}
                      className="min-h-[100px] transition-all border-primary/20 focus:border-primary focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={prevStep} className="button-3d border-primary/20">
                    Previous
                  </Button>
                  <Button type="submit" className="button-3d" disabled={isSubmitting}>
                    {isSubmitting ? "Posting..." : "Post Job"}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-gradient-to-r from-blue-500/5 to-teal-500/5 border-t border-primary/10 p-4 text-xs text-center text-muted-foreground">
          <div className="flex items-center justify-center w-full gap-2">
            <Info className="h-4 w-4" />
            <span>
              Fields marked with <span className="text-red-500">*</span> are required
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
