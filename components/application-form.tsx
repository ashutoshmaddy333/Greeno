"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, CheckCircle, Upload, Calendar, User, Phone, Mail, Briefcase } from "lucide-react"

const jobRoles = [
  "Software Developer",
  "UI/UX Designer",
  "Data Scientist",
  "Product Manager",
  "DevOps Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Mobile App Developer",
  "Cloud Engineer",
  "Machine Learning Engineer",
  "Blockchain Developer",
  "Sustainability Specialist",
  "Green Energy Consultant",
  "Environmental Engineer",
  "Renewable Energy Technician",
  "Climate Tech Researcher",
  "Sustainable Product Designer",
  "Green IT Specialist",
  "Eco-Solutions Architect",
]

export default function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<{
    fullName: string;
    dateOfBirth: string;
    gender: string;
    contactNumber: string;
    email: string;
    jobRole: string;
    resume: File | null;
  }>({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    email: "",
    jobRole: "",
    resume: null,
  })
  const [fileName, setFileName] = useState("")
  const [fileError, setFileError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size exceeds 5MB limit")
      return
    }

    // Check file type
    const acceptedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!acceptedTypes.includes(file.type)) {
      setFileError("File format not supported. Please upload PDF, JPG, PNG, or DOC")
      return
    }

    setFileError("")
    setFileName(file.name)
    setFormData((prev) => ({ ...prev, resume: file }))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Application Submitted Successfully!</h2>
        <p className="text-muted-foreground max-w-md">
          Thank you for your interest. Our team will review your application and get back to you soon.
        </p>
        <Button className="button-3d mt-4" onClick={() => (window.location.href = "/")}>
          Return to Home
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="card-3d border-primary/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 border-b border-primary/10">
        <CardTitle className="text-2xl md:text-3xl text-center text-primary">
  Join GreenoTechJobs
</CardTitle>

          <CardDescription className="text-center">
            Fill out the form below to get started with your job search journey
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={`step-${currentStep}`} className="w-full">
            <TabsList className="grid grid-cols-3 w-full rounded-none bg-muted/50">
              <TabsTrigger
                value="step-1"
                className={`data-[state=active]:bg-primary/10 data-[state=active]:text-primary ${currentStep >= 1 ? "text-primary" : ""}`}
                disabled
              >
                Basic Details
              </TabsTrigger>
              <TabsTrigger
                value="step-2"
                className={`data-[state=active]:bg-primary/10 data-[state=active]:text-primary ${currentStep >= 2 ? "text-primary" : ""}`}
                disabled
              >
                Job Role
              </TabsTrigger>
              <TabsTrigger
                value="step-3"
                className={`data-[state=active]:bg-primary/10 data-[state=active]:text-primary ${currentStep >= 3 ? "text-primary" : ""}`}
                disabled
              >
                Resume
              </TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <TabsContent value="step-1" className={currentStep === 1 ? "block" : "hidden"}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-primary" />
                      <Label htmlFor="fullName">Full Name</Label>
                    </div>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="transition-all border-primary/20 focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    </div>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="transition-all border-primary/20 focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-primary" />
                      <Label>Gender</Label>
                    </div>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => handleSelectChange(value, "gender")}
                      className="flex flex-wrap gap-4"
                      required
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <Label htmlFor="contactNumber">Contact Number</Label>
                    </div>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      placeholder="Enter your contact number"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      className="transition-all border-primary/20 focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <Label htmlFor="email">Email ID (Optional)</Label>
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="transition-all border-primary/20 focus:border-primary focus:ring-primary"
                    />
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
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <Label htmlFor="jobRole">Job Role Interested</Label>
                    </div>
                    <Select value={formData.jobRole} onValueChange={(value) => handleSelectChange(value, "jobRole")}>
                      <SelectTrigger className="transition-all border-primary/20 focus:border-primary focus:ring-primary">
                        <SelectValue placeholder="Select job role" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4 text-primary" />
                      <Label htmlFor="resume">Upload Resume</Label>
                    </div>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-lg p-6 transition-all hover:border-primary/40">
                      <Upload className="h-10 w-10 text-primary/50 mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag & drop your resume here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Accepted formats: PDF, JPG, PNG, DOC — Max size: 5MB
                      </p>
                      <Input
                        id="resume"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("resume")?.click()}
                        className="button-3d border-primary/20"
                      >
                        Browse Files
                      </Button>
                      {fileName && (
                        <p className="text-sm text-primary mt-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" /> {fileName}
                        </p>
                      )}
                      {fileError && <p className="text-sm text-red-500 mt-2">{fileError}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={prevStep} className="button-3d border-primary/20">
                    Previous
                  </Button>
                  <Button type="submit" className="button-3d" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="bg-gradient-to-r from-blue-500/5 to-teal-500/5 border-t border-primary/10 p-4 text-xs text-center text-muted-foreground">
          By submitting this form, you agree to our Terms of Service and Privacy Policy
        </CardFooter>
      </Card>
    </div>
  )
}
