"use client"

import { useEffect, useState } from "react"
import { useAdmin } from "@/contexts/admin-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Users, Briefcase, Building2, FileText, UserCheck, UserX } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardStats {
  totalUsers: number
  totalJobs: number
  totalApplications: number
  totalEmployers: number
  recentUsers: Array<{
    _id: string
    name: string
    email: string
    role: string
    createdAt: string
  }>
  recentJobs: Array<{
    _id: string
    title: string
    company: {
      name: string
    }
    createdAt: string
    applications: number
  }>
  recentApplications: Array<{
    _id: string
    job: {
      title: string
      company: {
        name: string
      }
    }
    applicant: {
      name: string
    }
    status: string
    createdAt: string
  }>
  userStats: {
    jobSeekers: number
    employers: number
    admins: number
    verifiedUsers: number
    unverifiedUsers: number
  }
  jobStats: {
    active: number
    inactive: number
    totalViews: number
    totalApplications: number
  }
}

export default function AdminDashboard() {
  const { isAdmin, isLoading } = useAdmin()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin/login")
      return
    }

    const fetchDashboardStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard/stats")
        if (!response.ok) throw new Error("Failed to fetch dashboard stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    if (isAdmin) {
      fetchDashboardStats()
    }
  }, [isAdmin, isLoading, router])

  if (isLoading || isLoadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 py-4">
      <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.userStats.verifiedUsers} verified, {stats.userStats.unverifiedUsers} unverified
            </p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.jobStats.active} active, {stats.jobStats.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {stats.jobStats.totalViews} total job views
            </p>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.userStats.employers} employer accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Stats */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Job Seekers</p>
                <p className="text-2xl font-bold">{stats.userStats.jobSeekers}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Employers</p>
                <p className="text-2xl font-bold">{stats.userStats.employers}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Verified Users</p>
                <p className="text-2xl font-bold">{stats.userStats.verifiedUsers}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <UserX className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Unverified Users</p>
                <p className="text-2xl font-bold">{stats.userStats.unverifiedUsers}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Tabs */}
      <Tabs defaultValue="users" className="space-y-4 w-full">
        <TabsList className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4">
          <TabsTrigger value="users" className="flex-1">Recent Users</TabsTrigger>
          <TabsTrigger value="jobs" className="flex-1">Recent Jobs</TabsTrigger>
          <TabsTrigger value="applications" className="flex-1">Recent Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentUsers.map((user) => (
                  <div key={user._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-md bg-muted/30">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-sm text-muted-foreground text-right sm:text-left">
                      <p className="capitalize">{user.role}</p>
                      <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentJobs.map((job) => (
                  <div key={job._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-md bg-muted/30">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-muted-foreground">{job.company.name}</p>
                    </div>
                    <div className="text-sm text-muted-foreground text-right sm:text-left">
                      <p>{job.applications} applications</p>
                      <p>{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentApplications.map((application) => (
                  <div key={application._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-md bg-muted/30">
                    <div>
                      <p className="font-medium">{application.job.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {application.applicant.name} • {application.job.company.name}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground text-right sm:text-left">
                      <p className="capitalize">{application.status}</p>
                      <p>{new Date(application.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 