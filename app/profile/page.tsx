"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import JobCard from "@/components/job-card"
import { showToast } from "@/lib/toast"
import { Loader2, Upload, X, Edit, Trash2, Save, Plus, Briefcase, GraduationCap, MapPin, Phone, Link as LinkIcon } from "lucide-react"
import { useForm } from "react-hook-form"

interface Job {
  _id: string
  title: string
  company: {
    name: string
    logo: string
    website?: string
    industry?: string
    size?: string
  }
  location: string
  type: string
  salary: {
    min: number
    max: number
    currency: string
  }
  createdAt: string
  isActive: boolean
}

interface Profile {
  _id: string
  profilePicture: string | null
  headline: string
  bio: string
  location: string
  phone: string
  skills: string[]
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    description: string
  }>
  experience: Array<{
    company: string
    position: string
    startDate: string
    endDate: string
    description: string
    current: boolean
  }>
  savedJobs: Job[]
  appliedJobs: Array<{
    job: Job
    status: string
    appliedAt: string
  }>
  socialLinks: {
    linkedin: string
    github: string
    portfolio: string
  }
}

export default function ProfilePage() {
  const { isAuthenticated, isEmployer, user, isLoading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [showEducationForm, setShowEducationForm] = useState(false)
  const [showExperienceForm, setShowExperienceForm] = useState(false)
  const { register, handleSubmit, setValue, watch, reset } = useForm()
  const [isEditMode, setIsEditMode] = useState(false)
  const [savingJob, setSavingJob] = useState<string | null>(null)
  const [withdrawingApplication, setWithdrawingApplication] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || isEmployer)) {
      router.push("/login")
    }
  }, [isAuthenticated, isEmployer, isLoading, router])

  useEffect(() => {
    if (isAuthenticated && !isEmployer) {
      fetchProfile()
    }
  }, [isAuthenticated, isEmployer])

  // Debug saved jobs
  useEffect(() => {
    if (profile?.savedJobs) {
      console.log("Profile saved jobs updated:", {
        count: profile.savedJobs.length,
        jobs: profile.savedJobs.map((job: any) => ({
          id: job._id,
          title: job.title,
          company: job.company?.name
        }))
      })
    }
  }, [profile?.savedJobs])

  const fetchProfile = async () => {
    try {
      setProfileLoading(true)
      const response = await fetch("/api/profile")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile")
      }

      setProfile(data)
      reset(data)
    } catch (error: any) {
      console.error("Error fetching profile:", error)
      showToast.error(error.message || "Failed to fetch profile")
    } finally {
      setProfileLoading(false)
    }
  }

  const handleProfileUpdate = async (data: any) => {
    setSaving(true)
    try {
      const formData = new FormData()
      
      // Handle skills - convert to array if it's a string, or keep as array if it already is one
      if (data.skills) {
        if (typeof data.skills === 'string') {
          data.skills = data.skills.split(',').map((skill: string) => skill.trim()).filter(Boolean)
        } else if (Array.isArray(data.skills)) {
          // If it's already an array, just ensure all items are trimmed
          data.skills = data.skills.map((skill: string) => skill.trim()).filter(Boolean)
        }
      }

      // Add profile data to formData
      formData.append("data", JSON.stringify(data))

      // If there's a new profile picture, add it to formData
      const profilePictureInput = document.getElementById("profilePicture") as HTMLInputElement
      if (profilePictureInput?.files?.[0]) {
        formData.append("profilePicture", profilePictureInput.files[0])
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      })

      const result = await response.json()
      if (response.ok) {
        // Update the profile state with the new data
        setProfile(result)
        // Reset the form with new data
        reset(result)
        // Exit edit mode
        setIsEditMode(false)
        showToast.success("Profile updated successfully")
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      console.error("Profile update error:", error)
      showToast.error(error.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("File size exceeds 5MB limit")
      return
    }

    // Check file type
    const acceptedTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    if (!acceptedTypes.includes(file.type)) {
      showToast.error("File format not supported. Please upload JPG, PNG, or SVG")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      // Include current profile data
      formData.append("data", JSON.stringify(profile))
      formData.append("profilePicture", file)

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      })

      const result = await response.json()
      if (response.ok) {
        // Update the profile state with the new data including the profile picture
        setProfile(result)
        showToast.success("Profile picture updated successfully")
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to update profile picture")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteProfilePicture = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "DELETE",
      })

      const result = await response.json()
      if (response.ok) {
        setProfile((prev) => prev ? { ...prev, profilePicture: null } : null)
        showToast.success("Profile picture deleted successfully")
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to delete profile picture")
    }
  }

  const handleAddEducation = async (data: any) => {
    if (!profile) return

    const newEducation = {
      institution: data.institution,
      degree: data.degree,
      field: data.field,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profile,
          education: [...profile.education, newEducation],
        }),
      })

      const result = await response.json()
      if (response.ok) {
        setProfile(result)
        setShowEducationForm(false)
        showToast.success("Education added successfully")
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to add education")
    }
  }

  const handleAddExperience = async (data: any) => {
    if (!profile) return

    const newExperience = {
      company: data.company,
      position: data.position,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      current: data.current,
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profile,
          experience: [...profile.experience, newExperience],
        }),
      })

      const result = await response.json()
      if (response.ok) {
        setProfile(result)
        setShowExperienceForm(false)
        showToast.success("Experience added successfully")
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      showToast.error(error.message || "Failed to add experience")
    }
  }

  const handleSaveJob = async (jobId: string) => {
    try {
      setSavingJob(jobId)
      const response = await fetch(`/api/jobs/${jobId}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to save job")
      }

      // Update profile with new saved jobs
      const updatedProfile = await response.json()
      console.log("Profile updated after saving job:", {
        profileId: updatedProfile._id,
        savedJobsCount: updatedProfile.savedJobs?.length || 0,
        savedJobs: updatedProfile.savedJobs?.map((job: any) => ({
          id: job._id,
          title: job.title,
          company: job.company?.name
        })) || []
      })
      
      setProfile(updatedProfile)
      
      // Check if job was saved or unsaved
      const wasJobSaved = updatedProfile.savedJobs?.some((job: any) => job._id === jobId)
      if (wasJobSaved) {
        showToast.success("Job saved successfully")
      } else {
        showToast.success("Job removed from saved jobs")
      }
    } catch (error: any) {
      console.error("Error saving job:", error)
      showToast.error(error.message || "Failed to save job")
    } finally {
      setSavingJob(null)
    }
  }

  const handleWithdrawApplication = async (jobId: string) => {
    try {
      setWithdrawingApplication(jobId)
      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to withdraw application")
      }

      // Update profile with updated applied jobs
      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      showToast.success("Application withdrawn successfully")
    } catch (error: any) {
      console.error("Error withdrawing application:", error)
      showToast.error(error.message || "Failed to withdraw application")
    } finally {
      setWithdrawingApplication(null)
    }
  }

  const renderProfileDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Your professional profile details</CardDescription>
          </div>
          {!isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditMode(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditMode ? (
            <form onSubmit={handleSubmit(handleProfileUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  {...register("headline")}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Write a brief professional summary"
                  className="min-h-[100px] w-full"
                />
              </div>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    {...register("location")}
                    placeholder="e.g., New York, NY"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register("phone")}
                    placeholder="e.g., +1 (555) 123-4567"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  {...register("skills")}
                  placeholder="e.g., JavaScript, React, Node.js (comma separated)"
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Enter your skills separated by commas
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsEditMode(false); if (profile) reset(profile); }} className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              {profile?.headline && (
                <div className="space-y-2">
                  <Label>Professional Headline</Label>
                  <p className="text-sm">{profile.headline}</p>
                </div>
              )}
              {profile?.bio && (
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {profile?.location && (
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <p className="text-sm">{profile.location}</p>
                  </div>
                )}
                {profile?.phone && (
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <p className="text-sm">{profile.phone}</p>
                  </div>
                )}
              </div>
              {profile?.skills && profile.skills.length > 0 && (
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs bg-primary/5">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Education Section */}
      {profile?.education && profile.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Your educational background</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <GraduationCap className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{edu.degree} in {edu.field}</h4>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
                    </p>
                    {edu.description && (
                      <p className="mt-2 text-sm">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience Section */}
      {profile?.experience && profile.experience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
            <CardDescription>Your work experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.experience.map((exp, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <Briefcase className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">{exp.position}</h4>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(exp.startDate).getFullYear()} - {exp.current ? "Present" : new Date(exp.endDate).getFullYear()}
                    </p>
                    {exp.description && (
                      <p className="mt-2 text-sm">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links Section */}
      {(profile?.socialLinks?.linkedin || profile?.socialLinks?.github || profile?.socialLinks?.portfolio) && (
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Your professional social media profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.socialLinks.linkedin && (
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}
              {profile.socialLinks.github && (
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    GitHub Profile
                  </a>
                </div>
              )}
              {profile.socialLinks.portfolio && (
                <div className="flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={profile.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Portfolio Website
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  if (isLoading || profileLoading) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || isEmployer) {
    return null
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
            <TabsTrigger value="profile" className="flex-1 transition-colors hover:bg-primary/10 hover:text-primary">Profile</TabsTrigger>
            <TabsTrigger value="saved" className="flex-1 transition-colors hover:bg-primary/10 hover:text-primary">Saved Jobs</TabsTrigger>
            <TabsTrigger value="applied" className="flex-1 transition-colors hover:bg-primary/10 hover:text-primary">Applied Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left: Profile Picture and Upload */}
              <div className="flex flex-col items-center md:items-start w-full md:w-1/3 gap-4">
                <Avatar className="h-32 w-32 border-2 border-primary/20">
                  <AvatarImage src={profile?.profilePicture || undefined} alt={profile?.headline || 'Profile Picture'} />
                  <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('profilePicture')?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-1" /> Upload
                  </Button>
                  {profile?.profilePicture && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteProfilePicture}
                      disabled={uploading}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  )}
                </div>
              </div>
              {/* Right: Profile Details */}
              <div className="flex-1 w-full">
                {renderProfileDetails()}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saved Jobs</CardTitle>
                <CardDescription>Jobs you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading saved jobs...</span>
                  </div>
                ) : profile?.savedJobs?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't saved any jobs yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {profile?.savedJobs?.map((job) => (
                      <JobCard
                        key={job._id}
                        id={job._id}
                        title={job.title}
                        company={job.company?.name || 'Company not specified'}
                        location={job.location}
                        type={job.type}
                        salary={job.salary ? { min: job.salary.min, max: job.salary.max } : undefined}
                        posted={new Date(job.createdAt).toLocaleDateString()}
                        logo={job.company?.logo}
                        isActive={job.isActive}
                        isSaved={true}
                        isApplied={false}
                        onSave={handleSaveJob}
                        onApply={() => { window.location.href = `/job/${job._id}`; }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applied" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Applied Jobs</CardTitle>
                <CardDescription>Track your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading applications...</span>
                  </div>
                ) : profile?.appliedJobs?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't applied to any jobs yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {profile?.appliedJobs?.map((application) => (
                      <div key={application.job._id} className="relative">
                        <JobCard
                          id={application.job._id}
                          title={application.job.title}
                          company={application.job.company.name}
                          location={application.job.location}
                          type={application.job.type}
                          salary={application.job.salary ? { min: application.job.salary.min, max: application.job.salary.max } : undefined}
                          posted={new Date(application.job.createdAt).toLocaleDateString()}
                          logo={application.job.company.logo}
                          isActive={application.job.isActive}
                          isApplied={true}
                          isSaved={false}
                          onSave={() => {}}
                          onApply={() => { window.location.href = `/job/${application.job._id}`; }}
                        />
                        <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 sm:absolute sm:top-4 sm:right-4 sm:mt-0 z-10">
                          <Badge
                            variant={
                              application.status === "shortlisted"
                                ? "default"
                                : application.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                            className="w-full sm:w-auto text-center"
                          >
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                          {application.status === "applied" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => handleWithdrawApplication(application.job._id)}
                              disabled={withdrawingApplication === application.job._id}
                            >
                              {withdrawingApplication === application.job._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Withdraw"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 