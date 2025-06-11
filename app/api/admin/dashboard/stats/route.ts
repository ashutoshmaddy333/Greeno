import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/User"
import Job from "@/models/Job"
import Application from "@/models/Application"
import { Employer } from "@/models/Employer"
import JobSeeker from "@/models/JobSeeker"
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

export async function GET() {
  try {
    await connectToDatabase()

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

    // Get user statistics
    const userStats = await Promise.all([
      User.countDocuments({ role: "job_seeker" }),
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
          jobs.map(async (job) => {
            const applications = await Application.countDocuments({ job: job._id })
            return {
              _id: job._id.toString(),
              title: job.title,
              company: {
                name: job.company.name,
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
      .then(applications => applications.map(app => ({
        _id: app._id.toString(),
        job: {
          title: app.job.title,
          company: {
            name: app.job.company.name,
          },
        },
        applicant: {
          name: app.applicant.name,
        },
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      })))

    return NextResponse.json({
      totalUsers,
      totalJobs,
      totalApplications,
      totalEmployers,
      userStats,
      jobStats,
      recentUsers,
      recentJobs,
      recentApplications,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
} 