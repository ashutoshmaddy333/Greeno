import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Job from "@/models/Job"
import { authenticateUser, type AuthRequest } from "@/lib/auth"
import type { IJob } from "@/models/Job"
import type { Types } from "mongoose"

interface PopulatedCompany {
  _id: Types.ObjectId
  name: string
  logo?: string
}

interface JobDocument extends Omit<IJob, 'company' | 'postedBy'> {
  _id: Types.ObjectId
  company: PopulatedCompany
  postedBy: Types.ObjectId
  educationLevel?: string
  category?: string
}

export async function GET(request: Request) {
  try {
    await dbConnect()
    const user = await authenticateUser(request as AuthRequest)
    
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    if (user.role !== "employer") {
      return NextResponse.json(
        { message: "Only employers can access their jobs" },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "5")

    // Build query
    const query: any = { postedBy: user._id }
    
    // Add search conditions
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ]
    }

    // Add status filter
    if (status !== "all") {
      query.isActive = status === "active"
    }

    // Get total count for pagination
    const total = await Job.countDocuments(query)

    // Fetch jobs with pagination
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("company", "name logo")
      .lean() as unknown as JobDocument[]

    // Format jobs for response
    const formattedJobs = jobs.map(job => ({
      id: job._id.toString(),
      title: job.title,
      location: job.remote ? "Remote" : job.location,
      type: job.employmentType,
      salary: `₹${Math.round(job.salary.min / 100000)}L - ₹${Math.round(job.salary.max / 100000)}L`,
      posted: new Date(job.createdAt).toLocaleDateString(),
      applicants: job.applications?.length || 0,
      status: job.isActive ? "active" : "expired",
      category: getJobCategoryLabel(job.jobCategory) || "Uncategorized",
      views: job.views || 0,
      company: {
        name: job.company?.name || "Your Company",
        logo: job.company?.logo || "/placeholder.svg"
      }
    }))

    return NextResponse.json({
      success: true,
      jobs: formattedJobs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    })
  } catch (error: any) {
    console.error("Error fetching employer jobs:", error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`
  }

  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`
}

// Helper function to get job category label with emoji
function getJobCategoryLabel(category: string): string {
  const categoryMap: { [key: string]: string } = {
    // B.Tech Categories
    "software-engineer": "💻 Software Engineer",
    "mechanical-engineer": "⚙️ Mechanical Engineer",
    "electrical-engineer": "⚡ Electrical Engineer",
    "civil-engineer": "🏗️ Civil Engineer",
    "electronics-engineer": "🔌 Electronics Engineer",
    "chemical-engineer": "🧪 Chemical Engineer",
    "aerospace-engineer": "✈️ Aerospace Engineer",
    "robotics-engineer": "🤖 Robotics Engineer",
    "ai-ml-engineer": "🧠 AI/ML Engineer",
    "data-engineer": "📊 Data Engineer",
    "network-engineer": "🌐 Network Engineer",
    "embedded-systems-engineer": "🔧 Embedded Systems Engineer",
    "biomedical-engineer": "🏥 Biomedical Engineer",
    "environmental-engineer": "🌱 Environmental Engineer",
    "industrial-engineer": "🏭 Industrial Engineer",
    // 10th Pass Categories
    "peon-office-boy": "🧹 Peon / Office Boy",
    "general-helper": "🛠 General Helper",
    "packaging-assistant": "📦 Packaging Assistant",
    "loading-unloading-staff": "🚚 Loading & Unloading Staff",
    "cleaning-housekeeping-staff": "🧯 Cleaning / Housekeeping Staff",
    // 12th Pass Categories
    "machine-operator": "🏭 Machine Operator",
    "quality-checker": "🔍 Quality Checker",
    "store-assistant": "🧾 Store Assistant",
    "production-assistant": "📋 Production Assistant",
    "warehouse-assistant": "📦 Warehouse Assistant",
    // ITI Pass Categories
    "electrician": "🔌 Electrician",
    "fitter": "🔧 Fitter",
    "welder": "🔩 Welder",
    "machinist": "⚙️ Machinist",
    "maintenance-technician": "🛠️ Maintenance Technician",
    "cnc-machine-operator": "🖥 CNC Machine Operator",
    "tool-room-assistant": "🔧 Tool Room Assistant",
    "mechanical-technician": "🏗️ Mechanical Technician",
    // Other Entry-Level Categories
    "store-keeper": "📋 Store Keeper",
    "material-handler": "🪜 Material Handler",
    "packing-supervisor": "📦 Packing Supervisor",
    "inventory-assistant": "🛒 Inventory Assistant",
    "assembly-line-worker": "🧰 Assembly Line Worker"
  }
  return categoryMap[category] || category
}
