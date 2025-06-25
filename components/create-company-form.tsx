"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Building, Globe, MapPin, Users, Calendar, Briefcase } from "lucide-react"
import { createCompanyProfile } from "@/lib/actions"

interface CreateCompanyFormProps {
  onSuccess: (company: any) => void
}

export function CreateCompanyForm({ onSuccess }: CreateCompanyFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      website: "",
      industry: "",
      size: "",
      location: "",
      foundedYear: new Date().getFullYear(),
    },
  })

  // Register select fields
  register("industry", { required: "Industry is required" })
  register("size", { required: "Company size is required" })

  const watchedSize = watch("size")
  const watchedIndustry = watch("industry")

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    setError("")

    try {
      // Log the exact data being sent
      console.log("Form data before submission:", {
        name: data.name,
        description: data.description,
        industry: data.industry,
        size: data.size,
        location: data.location,
        website: data.website,
        foundedYear: data.foundedYear,
        logo: logoFile,
      })

      const result = await createCompanyProfile(data)
      console.log("Create company result:", result)

      if (result.success) {
        onSuccess(result.company)
      } else {
        // Log the error details
        console.error("Company creation failed:", result)
        setError(result.message || "Failed to create company profile")
      }
    } catch (err) {
      console.error("Form submission error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
    "5000+ employees",
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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

        {/* Company Logo Upload */}
        <div className="space-y-2">
          <Label htmlFor="logo" className="flex items-center gap-2">
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files ? e.target.files[0] : null)}
            />
          </Label>
          {/* {errors.logo && <p className="text-sm text-destructive">{String(errors.logo.message)}</p>} */}
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
        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Profile"
          )}
        </Button>
      </div>
    </form>
  )
}
