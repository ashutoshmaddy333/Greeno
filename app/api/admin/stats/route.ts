import { NextResponse, type NextRequest } from "next/server"
import { authenticateUser } from "@/lib/auth"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"
import JobSeeker from "@/models/JobSeeker"
import { Employer } from "@/models/Employer"
import Company from "@/models/Company"
import Job from "@/models/Job"
import Application from "@/models/Application"
import { startOfDay, endOfDay, subDays, format, parseISO } from "date-fns"

interface WeeklyStat {
  date: string
  applications: number
  jobs: number
  signups: number
}

interface DailyStat {
  hour: number
  applications: number
  jobs: number
  signups: number
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const today = new Date()
    const lastWeek = subDays(today, 7)
    const lastMonth = subDays(today, 30)

    // Get all counts and stats in parallel for better performance
    const [
      totalUsers,
      totalJobSeekers,
      totalEmployers,
      totalJobs,
      totalCompanies,
      activeJobs,
      pendingApplications,
      todaySignups,
      todayApplications,
      todayJobs,
      weeklyStats,
      dailyStats,
      recentJobSeekers,
      recentEmployers,
      recentJobs,
      recentApplications,
      topCompanies,
      topJobCategories,
      monthlyStats,
      applicationStatusStats,
      jobStatusStats,
      userRoleStats,
      companyVerificationStats,
    ] = await Promise.all([
      // Total counts
      User.countDocuments(),
      JobSeeker.countDocuments(),
      Employer.countDocuments(),
      Job.countDocuments(),
      Company.countDocuments(),
      Job.countDocuments({ status: "active" }),
      Application.countDocuments({ status: "pending" }),

      // Today's activity
      User.countDocuments({
        createdAt: { $gte: startOfDay(today), $lte: endOfDay(today) }
      }),
      Application.countDocuments({
        createdAt: { $gte: startOfDay(today), $lte: endOfDay(today) }
      }),
      Job.countDocuments({
        createdAt: { $gte: startOfDay(today), $lte: endOfDay(today) }
      }),

      // Weekly stats for charts
      Application.aggregate([
        {
          $match: {
            createdAt: { $gte: lastWeek, $lte: today }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            applications: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Daily stats (hourly breakdown)
      Application.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfDay(today), $lte: endOfDay(today) }
          }
        },
        {
          $group: {
            _id: { $hour: "$createdAt" },
            applications: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Recent activity with populated data
      JobSeeker.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .lean(),
      Employer.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .populate("company", "name")
        .lean(),
      Job.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("company", "name")
        .lean(),
      Application.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: "job",
          select: "title",
          populate: { path: "company", select: "name" }
        })
        .populate("applicant", "name email")
        .lean(),

      // Analytics
      Company.aggregate([
        { $sort: { jobCount: -1 } },
        { $limit: 5 },
        {
          $project: {
            name: 1,
            jobCount: 1,
            applicationCount: 1,
            verified: 1
          }
        }
      ]),
      Job.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            applications: { $sum: { $size: "$applications" } }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      // Monthly stats
      Application.aggregate([
        {
          $match: {
            createdAt: { $gte: lastMonth, $lte: today }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            applications: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Application status distribution
      Application.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),

      // Job status distribution
      Job.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),

      // User role distribution
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        }
      ]),

      // Company verification status
      Company.aggregate([
        {
          $group: {
            _id: "$isVerified",
            count: { $sum: 1 }
          }
        }
      ])
    ])

    // Process weekly stats to include all metrics
    const processedWeeklyStats = await Promise.all(
      weeklyStats.map(async (stat) => {
        const date = stat._id
        const [jobs, signups] = await Promise.all([
          Job.countDocuments({
            createdAt: {
              $gte: startOfDay(parseISO(date)),
              $lte: endOfDay(parseISO(date))
            }
          }),
          User.countDocuments({
            createdAt: {
              $gte: startOfDay(parseISO(date)),
              $lte: endOfDay(parseISO(date))
            }
          })
        ])

        return {
          date,
          applications: stat.applications,
          jobs,
          signups
        }
      })
    )

    // Process daily stats to include all metrics
    const processedDailyStats = await Promise.all(
      dailyStats.map(async (stat) => {
        const hour = stat._id
        const [jobs, signups] = await Promise.all([
          Job.countDocuments({
            createdAt: {
              $gte: new Date(today.setHours(hour, 0, 0, 0)),
              $lte: new Date(today.setHours(hour, 59, 59, 999))
            }
          }),
          User.countDocuments({
            createdAt: {
              $gte: new Date(today.setHours(hour, 0, 0, 0)),
              $lte: new Date(today.setHours(hour, 59, 59, 999))
            }
          })
        ])

        return {
          hour,
          applications: stat.applications,
          jobs,
          signups
        }
      })
    )

    return NextResponse.json({
      overview: {
        totalUsers,
        totalJobSeekers,
        totalEmployers,
        totalJobs,
        totalCompanies,
        activeJobs,
        pendingApplications
      },
      today: {
        signups: todaySignups,
        applications: todayApplications,
        jobs: todayJobs,
        hourlyStats: processedDailyStats
      },
      weeklyStats: processedWeeklyStats,
      monthlyStats: monthlyStats.map((stat: any) => ({
        date: stat._id,
        applications: stat.applications
      })),
      recentActivity: {
        jobSeekers: recentJobSeekers,
        employers: recentEmployers,
        jobs: recentJobs,
        applications: recentApplications.map(app => ({
          ...app,
          jobSeeker: {
            fullName: `${app.firstName} ${app.lastName}`,
            email: app.email
          }
        }))
      },
      analytics: {
        topCompanies,
        topJobCategories,
        applicationStatusDistribution: applicationStatusStats.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count
          return acc
        }, {}),
        jobStatusDistribution: jobStatusStats.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count
          return acc
        }, {}),
        userRoleDistribution: userRoleStats.reduce((acc: any, curr: any) => {
          acc[curr._id] = curr.count
          return acc
        }, {}),
        companyVerificationStatus: companyVerificationStats.reduce((acc: any, curr: any) => {
          acc[curr._id ? "verified" : "unverified"] = curr.count
          return acc
        }, {})
      }
    })
  } catch (error) {
    console.error("Failed to fetch admin stats:", error)
    return NextResponse.json(
      { message: "Failed to fetch admin statistics" },
      { status: 500 }
    )
  }
} 