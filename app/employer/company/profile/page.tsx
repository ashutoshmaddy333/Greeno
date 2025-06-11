"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Building, Globe, MapPin, Users, Calendar, Briefcase, ArrowLeft, Save, Upload } from "lucide-react"
import { getEmployerProfile, updateCompanyProfile, updateCompanyLogo } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { useForm } from "react-hook-form"

interface Company {
  _id: string
  name: string
  website?: string
  industry: string
  size: string
  location: string
  foundedYear?: number
  description: string
  logo?: string
}

export default function CompanyProfilePage() {
  const { isAuthenticated, isEmployer, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [company, setCompany] = useState<Company | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm()

  const watchedSize = watch("size")
  const watchedIndustry = watch("industry")

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isEmployer)) {
      router.push("/login")
    }
  }, [isAuthenticated, isEmployer, isLoading, router])

  useEffect(() => {
    const loadProfile = async () => {
      if (isAuthenticated && isEmployer) {
        try {
          const result = await getEmployerProfile()
          if (result.success && result.company) {
            setCompany(result.company)
            reset(result.company)
          } else {
            router.push("/employer")
          }
        } catch (error) {
          console.error("Error loading profile:", error)
          setError("Failed to load company profile")
        } finally {
          setProfileLoading(false)
        }
      }
    }

    loadProfile()
  }, [isAuthenticated, isEmployer, reset, router])

  const onSubmit = async (data: any) => {
    setSaving(true)
    setError("")
    setSuccess("")

    if (!company) {
      setError("Company profile not found")
      setSaving(false)
      return
    }

    try {
      console.log("Form data before submission:", data)
      console.log("Current company size:", watchedSize)
      const result = await updateCompanyProfile(company._id, data)
      console.log("Update result:", result)

      if (result.success) {
        setCompany(result.company)
        toast({
          title: "Success!",
          description: "Company profile updated successfully",
          duration: 3000,
        })
        setTimeout(() => {
          router.push("/employer")
        }, 1000)
      } else {
        setError(result.error || "Failed to update company profile")
      }
    } catch (err) {
      console.error("Form submission error:", err)
      setError("An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size exceeds 2MB limit",
        variant: "destructive"
      })
      return
    }

    // Check file type
    const acceptedTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "File format not supported. Please upload JPG, PNG, or SVG",
        variant: "destructive"
      })
      return
    }

    setLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload logo immediately
    if (company?._id) {
      setUploadingLogo(true)
      try {
        const result = await updateCompanyLogo(company._id, file)
        if (result.success) {
          setCompany(result.company)
          toast({
            title: "Success",
            description: "Company logo updated successfully",
          })
        } else {
          throw new Error(result.message)
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to update company logo",
          variant: "destructive"
        })
      } finally {
        setUploadingLogo(false)
      }
    }
  }

  if (isLoading || profileLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>No company profile found. Please create one first.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Consulting",
    "Media & Entertainment",
    "Real Estate",
    "Transportation",
    "Energy",
    "Non-profit",
    "Government",
    "Other",
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

  

  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/employer">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
              <p className="text-muted-foreground">Manage your company information and settings</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
            <CardDescription>Update your company details to attract the best candidates</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center rounded-lg border bg-muted p-2">
                    <img
                      src={logoPreview || company?.logo || "/placeholder.svg"}
                      alt={company?.name}
                      className="h-28 w-28 object-contain"
                    />
                    {uploadingLogo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex justify-center">
                    <Input
                      id="logo"
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.svg"
                      onChange={handleLogoChange}
                      disabled={uploadingLogo}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("logo")?.click()}
                      disabled={uploadingLogo}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingLogo ? "Uploading..." : "Change Logo"}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Company Name *
                    </Label>
                    <Input
                      id="name"
                      {...register("name", { required: "Company name is required" })}
                      placeholder="Enter your company name"
                    />
                    {errors.name && <p className="text-sm text-destructive">{String(errors.name.message)}</p>}
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input id="website" {...register("website")} placeholder="https://yourcompany.com" type="url" />
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Industry *
                    </Label>
                    <Select value={watchedIndustry} onValueChange={(value) => setValue("industry", value)}>
                      <SelectTrigger>
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
                    {errors.industry && <p className="text-sm text-destructive">{String(errors.industry.message)}</p>}
                  </div>

                  {/* Company Size */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Company Size *
                    </Label>
                    <Select value={watchedSize} onValueChange={(value) => setValue("size", value)}>
                      <SelectTrigger>
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
                    {errors.size && <p className="text-sm text-destructive">{String(errors.size.message)}</p>}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location *
                    </Label>
                    <Input
                      id="location"
                      {...register("location", { required: "Location is required" })}
                      placeholder="City, State/Country"
                    />
                    {errors.location && <p className="text-sm text-destructive">{String(errors.location.message)}</p>}
                  </div>

                  {/* Founded Year */}
                  <div className="space-y-2">
                    <Label htmlFor="foundedYear" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Founded Year
                    </Label>
                    <Input
                      id="foundedYear"
                      {...register("foundedYear", {
                        valueAsNumber: true,
                        min: { value: 1800, message: "Please enter a valid year" },
                        max: { value: new Date().getFullYear(), message: "Year cannot be in the future" },
                      })}
                      type="number"
                      placeholder="2020"
                    />
                    {errors.foundedYear && <p className="text-sm text-destructive">{String(errors.foundedYear.message)}</p>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Company Description *</Label>
                <Textarea
                  id="description"
                  {...register("description", { required: "Company description is required" })}
                  placeholder="Tell us about your company, mission, and what makes you unique..."
                  rows={4}
                />
                {errors.description && <p className="text-sm text-destructive">{String(errors.description.message)}</p>}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" asChild>
                  <Link href="/employer">Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving || !isDirty} className="min-w-[120px]">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
