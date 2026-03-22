import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"
import Job from "@/models/Job"
import Application from "@/models/Application"
import { Employer } from "@/models/Employer"
import JobSeeker from "@/models/JobSeeker"
import { authenticateUser, type AuthRequest } from "@/lib/auth"
import { Types } from "mongoose"

interface DashboardJob {
  _id: string
  title: string
  company: {
    name: string
  }
  createdAt: string
  applications: number
}

interface DashboardApplication {
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
}

interface DashboardUser {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export async function GET(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    if (user.role !== "admin") {
      return NextResponse.json({ message: "Only admins can access this endpoint" }, { status: 403 })
    }

    console.log("Admin dashboard stats requested by:", user.email)

    // Get total counts
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalEmployers,
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      Employer.countDocuments(),
    ])

    console.log("Dashboard counts:", {
      totalUsers,
      totalJobs,
      totalApplications,
      totalEmployers
    })

    // Get user statistics
    const userStats = await Promise.all([
      User.countDocuments({ role: "jobseeker" }),
      User.countDocuments({ role: "employer" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isVerified: false }),
    ]).then(([jobSeekers, employers, admins, verified, unverified]) => ({
      jobSeekers,
      employers,
      admins,
      verifiedUsers: verified,
      unverifiedUsers: unverified,
    }))

    // Get job statistics
    const jobStats = await Promise.all([
      Job.countDocuments({ isActive: true }),
      Job.countDocuments({ isActive: false }),
      Job.aggregate([
        { $group: { _id: null, totalViews: { $sum: "$views" } } },
      ]).then((result) => result[0]?.totalViews || 0),
    ]).then(([active, inactive, totalViews]) => ({
      active,
      inactive,
      totalViews,
      totalApplications,
    }))

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email role createdAt")
      .lean()
      .then(users => users.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      })))

    // Get recent jobs with company and application count
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("company", "name")
      .select("title company createdAt")
      .lean()
      .then(async (jobs) => {
        const jobsWithApplications = await Promise.all(
          jobs.map(async (job: any) => {
            const applications = await Application.countDocuments({ job: job._id })
            return {
              _id: job._id.toString(),
              title: job.title,
              company: {
                name: job.company?.name || "Unknown Company",
              },
              createdAt: job.createdAt.toISOString(),
              applications,
            }
          })
        )
        return jobsWithApplications
      })

    // Get recent applications with job and applicant details
    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "job",
        select: "title",
        populate: {
          path: "company",
          select: "name",
        },
      })
      .populate("applicant", "name")
      .select("job applicant status createdAt")
      .lean()
      .then(applications => applications.map((app: any) => ({
        _id: app._id.toString(),
        job: {
          title: app.job?.title || "Unknown Job",
          company: {
            name: app.job?.company?.name || "Unknown Company",
          },
        },
        applicant: {
          name: app.applicant?.name || "Unknown Applicant",
        },
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      })))

    const response = {
      totalUsers,
      totalJobs,
      totalApplications,
      totalEmployers,
      userStats,
      jobStats,
      recentUsers,
      recentJobs,
      recentApplications,
    }

    console.log("Dashboard stats generated successfully")
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
} 