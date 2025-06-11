import { NextResponse, type NextRequest } from "next/server"
import { authenticateUser } from "@/lib/auth"
import dbConnect from "@/lib/db"
import JobSeeker, { IJobSeeker } from "@/models/JobSeeker"
import { User } from "@/models/User"
import Application from "@/models/Application"
import { Document, Types } from "mongoose"

interface JobSeekerDocument extends Omit<IJobSeeker, "user"> {
  _id: Types.ObjectId
  user: {
    _id: Types.ObjectId
    name: string
    email: string
    isVerified: boolean
    isEmailVerified: boolean
  }
  stats?: {
    totalApplications: number
    activeApplications: number
    savedJobs: number
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
            { location: { $regex: search, $options: "i" } },
            { skills: { $regex: search, $options: "i" } },
            { headline: { $regex: search, $options: "i" } },
            { bio: { $regex: search, $options: "i" } },
          ],
        }
      : {}

    // Get total count for pagination
    const total = await JobSeeker.countDocuments(searchQuery)
    console.log(`Total job seekers found: ${total}`)

    // Get job seekers with pagination and search
    const jobSeekers = await JobSeeker.find(searchQuery)
      .populate({
        path: "user",
        select: "name email isVerified isEmailVerified",
        model: "User"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    console.log(`Retrieved ${jobSeekers.length} job seekers`)

    if (jobSeekers.length === 0) {
      console.log("No job seekers found in the database")
      return NextResponse.json({
        jobSeekers: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      })
    }

    // Get application counts for each job seeker
    const jobSeekersWithStats = await Promise.all(
      jobSeekers.map(async (seeker: any) => {
        if (!seeker.user || !seeker.user._id) {
          console.error("Job seeker missing user data:", seeker._id)
          return null
        }

        const [totalApplications, activeApplications] = await Promise.all([
          Application.countDocuments({ applicant: seeker.user._id }),
          Application.countDocuments({
            applicant: seeker.user._id,
            status: { $in: ["pending", "reviewing", "shortlisted"] },
          }),
        ])

        const transformedSeeker: JobSeekerDocument = {
          ...seeker,
          stats: {
            totalApplications,
            activeApplications,
            savedJobs: seeker.savedJobs?.length || 0,
          },
        }

        return transformedSeeker
      })
    )

    // Filter out any null entries (job seekers with missing user data)
    const validJobSeekers = jobSeekersWithStats.filter((seeker): seeker is JobSeekerDocument => seeker !== null)

    // Transform the data to match the expected format
    const transformedJobSeekers = validJobSeekers.map((seeker) => ({
      _id: seeker._id,
      user: {
        email: seeker.user.email,
        isVerified: seeker.user.isVerified,
        isEmailVerified: seeker.user.isEmailVerified,
      },
      fullName: seeker.user.name,
      headline: seeker.headline || "",
      bio: seeker.bio || "",
      phone: seeker.phone || "",
      location: seeker.location || "",
      skills: seeker.skills || [],
      experience: seeker.experience?.length > 0 ? "experienced" : "fresher",
      education: seeker.education?.length > 0 ? {
        degree: seeker.education[0].degree,
        field: seeker.education[0].field,
        institution: seeker.education[0].institution,
        graduationYear: seeker.education[0].graduationYear || new Date(seeker.education[0].endDate).getFullYear(),
      } : null,
      socialLinks: seeker.socialLinks || {},
      resume: seeker.resume ? {
        url: seeker.resume,
        filename: seeker.resume.split("/").pop(),
      } : null,
      stats: seeker.stats,
      createdAt: seeker.createdAt,
      status: seeker.status || "active",
    }))

    console.log(`Transformed ${transformedJobSeekers.length} job seekers`)

    return NextResponse.json({
      jobSeekers: transformedJobSeekers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Failed to fetch job seekers:", error)
    return NextResponse.json(
      { message: "Failed to fetch job seekers", error: error?.message || "Unknown error" },
      { status: 500 }
    )
  }
}

// Update job seeker status
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
        { message: "Job seeker ID and status are required" },
        { status: 400 }
      )
    }

    // Update the job seeker's status
    const updatedJobSeeker = await JobSeeker.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user", "name email isVerified isEmailVerified")

    if (!updatedJobSeeker) {
      return NextResponse.json(
        { message: "Job seeker not found" },
        { status: 404 }
      )
    }

    // Get application stats for the updated job seeker
    const [totalApplications, activeApplications] = await Promise.all([
      Application.countDocuments({ applicant: updatedJobSeeker.user._id }),
      Application.countDocuments({
        applicant: updatedJobSeeker.user._id,
        status: { $in: ["pending", "reviewing", "shortlisted"] },
      }),
    ])

    const transformedJobSeeker = {
      _id: updatedJobSeeker._id,
      user: {
        email: updatedJobSeeker.user.email,
        isVerified: updatedJobSeeker.user.isVerified,
        isEmailVerified: updatedJobSeeker.user.isEmailVerified,
      },
      fullName: updatedJobSeeker.user.name,
      headline: updatedJobSeeker.headline || "",
      bio: updatedJobSeeker.bio || "",
      phone: updatedJobSeeker.phone || "",
      location: updatedJobSeeker.location || "",
      skills: updatedJobSeeker.skills || [],
      experience: updatedJobSeeker.experience?.length > 0 ? "experienced" : "fresher",
      education: updatedJobSeeker.education?.length > 0 ? {
        degree: updatedJobSeeker.education[0].degree,
        field: updatedJobSeeker.education[0].field,
        institution: updatedJobSeeker.education[0].institution,
        graduationYear: updatedJobSeeker.education[0].graduationYear,
      } : null,
      socialLinks: updatedJobSeeker.socialLinks || {},
      resume: updatedJobSeeker.resume ? {
        url: updatedJobSeeker.resume,
        filename: updatedJobSeeker.resume.split("/").pop(),
      } : null,
      stats: {
        totalApplications,
        activeApplications,
        savedJobs: updatedJobSeeker.savedJobs?.length || 0,
      },
      createdAt: updatedJobSeeker.createdAt,
      status: updatedJobSeeker.status,
    }

    return NextResponse.json(transformedJobSeeker)
  } catch (error) {
    console.error("Failed to update job seeker:", error)
    return NextResponse.json(
      { message: "Failed to update job seeker" },
      { status: 500 }
    )
  }
} 