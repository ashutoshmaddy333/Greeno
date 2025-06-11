import { NextResponse, type NextRequest } from "next/server"
import { authenticateUser } from "@/lib/auth"
import dbConnect from "@/lib/db"
import { Employer, type IEmployer } from "@/models/Employer"
import { User, type IUser } from "@/models/User"
import Company, { type ICompany } from "@/models/Company"
import Job from "@/models/Job"
import type { Types } from "mongoose"

interface PopulatedEmployer extends Omit<IEmployer, 'user' | 'company'> {
  _id: Types.ObjectId
  user: Pick<IUser, '_id' | 'name' | 'email' | 'isVerified' | 'isEmailVerified'>
  company: Pick<ICompany, '_id' | 'name' | 'industry' | 'location' | 'website' | 'size' | 'foundedYear'>
  stats?: {
    totalJobs: number
    activeJobs: number
    totalApplications: number
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Ensure database connection
    try {
      await dbConnect()
      console.log("Database connected successfully")
    } catch (error) {
      console.error("Database connection error:", error)
      return NextResponse.json(
        { message: "Database connection failed" },
        { status: 500 }
      )
    }

    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Build search query
    const searchQuery = search
      ? {
          $or: [
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "company.name": { $regex: search, $options: "i" } },
            { position: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    // Get total count for pagination
    const total = await Employer.countDocuments(searchQuery)
    console.log(`Total employers found: ${total}`)

    // Get employers with pagination and search
    const employers = await Employer.find(searchQuery)
      .populate<{ user: PopulatedEmployer["user"] }>({
        path: "user",
        select: "name email isVerified isEmailVerified",
        model: "User"
      })
      .populate<{ company: PopulatedEmployer["company"] }>({
        path: "company",
        select: "name industry location website size foundedYear",
        model: "Company"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as unknown as PopulatedEmployer[]

    console.log(`Retrieved ${employers.length} employers`)

    // Get stats for each employer
    const employersWithStats = await Promise.all(
      employers.map(async (employer) => {
        // Get total jobs posted by this employer
        const totalJobs = await Job.countDocuments({ postedBy: employer.user._id })
        
        // Get active jobs
        const activeJobs = await Job.countDocuments({ 
          postedBy: employer.user._id,
          isActive: true 
        })

        // Get total applications across all jobs
        const jobs = await Job.find({ postedBy: employer.user._id }).select("_id")
        const jobIds = jobs.map(job => job._id)
        const totalApplications = await Job.aggregate([
          { $match: { _id: { $in: jobIds } } },
          { $project: { applicationCount: { $size: "$applications" } } },
          { $group: { _id: null, total: { $sum: "$applicationCount" } } }
        ])

        return {
          ...employer,
          stats: {
            totalJobs,
            activeJobs,
            totalApplications: totalApplications[0]?.total || 0
          }
        }
      })
    )

    // Transform the data to match the expected format
    const transformedEmployers = employersWithStats.map((employer: PopulatedEmployer) => ({
      _id: employer._id.toString(),
      user: {
        email: employer.user.email,
        isVerified: employer.user.isVerified,
        isEmailVerified: employer.user.isEmailVerified,
      },
      fullName: employer.user.name,
      position: employer.position || "",
      company: {
        name: employer.company?.name || "No company",
        industry: employer.company?.industry || "Not specified",
        location: employer.company?.location || "Not specified",
        website: employer.company?.website,
        size: employer.company?.size,
        founded: employer.company?.foundedYear,
      },
      stats: employer.stats,
      createdAt: employer.createdAt.toISOString(),
      status: employer.status || "active",
    }))

    console.log(`Transformed ${transformedEmployers.length} employers`)

    return NextResponse.json({
      employers: transformedEmployers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Failed to fetch employers:", error)
    return NextResponse.json(
      { message: "Failed to fetch employers", error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}

// Update employer status
export async function PATCH(req: NextRequest) {
  try {
    const user = await authenticateUser(req)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { id, status } = await req.json()

    if (!id || !status) {
      return NextResponse.json(
        { message: "Employer ID and status are required" },
        { status: 400 }
      )
    }

    // Update the employer's status
    const updatedEmployer = await Employer.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate<{ user: PopulatedEmployer["user"] }>({
        path: "user",
        select: "name email isVerified isEmailVerified",
        model: "User"
      })
      .populate<{ company: PopulatedEmployer["company"] }>({
        path: "company",
        select: "name industry location website size foundedYear",
        model: "Company"
      })

    if (!updatedEmployer) {
      return NextResponse.json(
        { message: "Employer not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedEmployer)
  } catch (error: any) {
    console.error("Failed to update employer:", error)
    return NextResponse.json(
      { message: "Failed to update employer", error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
} 