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
import Image from "next/image"
import { Building2 } from "lucide-react"
import { getLogoUrl, getLogoDimensions } from "@/lib/utils"

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
  const [loading, setLoading] = useState(false)

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

  const { width, height } = getLogoDimensions('profile')

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return

    try {
      setLoading(true)
      const formData = new FormData(e.target as HTMLFormElement)
      
      // Prepare company data for JSON request
      const companyData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        industry: formData.get("industry") as string,
        website: formData.get("website") as string,
        location: formData.get("location") as string,
        size: formData.get("size") as string,
        founded: formData.get("founded") as string,
        logo: company.logo // Keep existing logo path
      }

      let updatedCompany = company

      // First update company details with JSON
      const response = await fetch(`/api/companies/${company._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update company details")
      }

      const data = await response.json()
      updatedCompany = data.company

      // If there's a new logo file, upload it separately
      if (logoFile) {
        const logoFormData = new FormData()
        logoFormData.append("logo", logoFile)

        const logoResponse = await fetch(`/api/companies/${company._id}/logo`, {
          method: "POST",
          body: logoFormData,
        })

        if (!logoResponse.ok) {
          const error = await logoResponse.json()
          throw new Error(error.message || "Failed to update logo")
        }

        const logoData = await logoResponse.json()
        if (logoData.success) {
          // Update company data with new logo path
          updatedCompany = { ...updatedCompany, logo: logoData.company.logo }
        }
      }

      // Update local state with the new company data
      setCompany(updatedCompany)
      setLogoFile(null)
      setLogoPreview(null)

      // Force a refresh of the profile data
      const profileResult = await getEmployerProfile()
      if (profileResult.success && profileResult.company) {
        setCompany(profileResult.company)
      }

      toast({
        title: "Success",
        description: "Company profile updated successfully",
      })

      // Reset form but keep the updated values
      const form = e.target as HTMLFormElement
      Object.entries(updatedCompany).forEach(([key, value]) => {
        const input = form.elements.namedItem(key) as HTMLInputElement
        if (input) {
          input.value = value as string
        }
      })

    } catch (error: any) {
      console.error("Error updating company profile:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update company profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Logo file size must be less than 2MB",
        variant: "destructive"
      })
      return
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Logo must be a JPEG, PNG, or SVG file",
        variant: "destructive"
      })
      return
    }

    try {
      setUploadingLogo(true)
      setLogoFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload logo immediately if we have a company ID
      if (company?._id) {
        const formData = new FormData()
        formData.append("logo", file)

        const logoResponse = await fetch(`/api/companies/${company._id}/logo`, {
          method: "POST",
          body: formData,
        })

        if (!logoResponse.ok) {
          const error = await logoResponse.json()
          throw new Error(error.message || "Failed to upload logo")
        }

        const data = await logoResponse.json()
        if (data.success) {
          // Update the company state with the new logo
          setCompany(prev => prev ? { ...prev, logo: data.company.logo } : null)
          
          // Force a refresh of the profile data
          const profileResult = await getEmployerProfile()
          if (profileResult.success && profileResult.company) {
            setCompany(profileResult.company)
          }

          toast({
            title: "Success",
            description: "Logo updated successfully"
          })
        } else {
          throw new Error(data.message || "Failed to update logo")
        }
      }
    } catch (error: any) {
      console.error("Error uploading logo:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo",
        variant: "destructive"
      })
      // Reset the file input
      e.target.value = ""
      setLogoFile(null)
      setLogoPreview(null)
    } finally {
      setUploadingLogo(false)
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Company Profile</h1>
        
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Company Logo Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Company Logo</h2>
            <div className="flex items-center space-x-6">
              <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-primary/20 bg-white">
                <img
                  src={getLogoUrl(company?.logo)}
                  alt={`${company?.name} logo`}
                  width={width}
                  height={height}
                  className="h-full w-full object-contain p-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Logo
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  JPG, PNG or SVG. Max 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Company Details Form */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Company Details</h2>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={company?.name}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry *
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  required
                  defaultValue={company?.industry}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  defaultValue={company?.website}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  defaultValue={company?.location}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                  Company Size *
                </label>
                <select
                  id="size"
                  name="size"
                  required
                  defaultValue={company?.size}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select company size</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="founded" className="block text-sm font-medium text-gray-700">
                  Founded Year
                </label>
                <input
                  type="number"
                  id="founded"
                  name="founded"
                  min="1900"
                  max={new Date().getFullYear()}
                  defaultValue={company?.foundedYear}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Company Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                defaultValue={company?.description}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setLogoFile(null)
                setLogoPreview(null)
                const form = document.querySelector("form") as HTMLFormElement
                form?.reset()
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
