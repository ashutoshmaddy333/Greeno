import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import connectDB from "@/lib/db"
import Job, { IJob } from "@/models/Job"
import { Document } from "mongoose"
import mongoose from "mongoose"

interface PopulatedJob extends Omit<IJob, 'company' | 'postedBy'> {
  _id: mongoose.Types.ObjectId
  company: {
    _id: string
    name: string
    logo?: string
    website?: string
    industry?: string
    size?: string
    description?: string
    location?: string
    foundedYear?: number
  } | null
  postedBy: {
    _id: string
    name: string
    email: string
  } | null
  totalApplications?: number
  status?: string
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await context.params

    const job = await Job.findById(id)
      .populate("company", "name logo website industry size description location foundedYear")
      .populate("postedBy", "name email")
      .lean() as PopulatedJob | null

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          message: "Job not found",
        },
        { status: 404 },
      )
    }

    // Increment view count
    await Job.findByIdAndUpdate(id, { $inc: { views: 1 } })

    const formattedJob = {
      id: job._id.toString(),
      title: job.title,
      company: {
        name: job.company?.name || "Unknown Company",
        logo: job.company?.logo || "/placeholder.svg"
      },
      location: job.remote ? "Remote" : job.location,
      type: job.employmentType,
      salary: {
        min: job.salary.min,
        max: job.salary.max
      },
      posted: new Date(job.createdAt).toLocaleDateString(),
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits,
      skills: job.skills,
      remote: job.remote,
      experienceLevel: job.experienceLevel,
      applicationDeadline: job.applicationDeadline,
      views: job.views,
      totalApplications: job.applications?.length || 0,
      companyInfo: {
        name: job.company?.name || "Unknown Company",
        website: job.company?.website || "#",
        industry: job.company?.industry || "Technology",
        size: job.company?.size || "1-50 employees",
        description: job.company?.description || "No description available",
        founded: job.company?.foundedYear?.toString() || "2020",
        logo: job.company?.logo || "/placeholder.svg",
        location: job.company?.location || job.location,
      },
      postedBy: {
        name: job.postedBy?.name || "Unknown",
        email: job.postedBy?.email || "",
      },
      status: job.isActive ? "active" : "inactive",
      isActive: job.isActive,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    }

    return NextResponse.json({
      success: true,
      job: formattedJob,
    })
  } catch (error: any) {
    console.error("Error fetching job:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch job details",
      },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateUser(request as any)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      location,
      type,
      salary,
      category,
      description,
      responsibilities,
      requirements,
      benefits,
      skills,
    } = body

    // Validate required fields
    if (!title || !location || !type || !salary || !category || !description) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Find the job and verify ownership
    const job = await Job.findById(params.id)
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      )
    }

    // Verify that the user owns this job
    if (job.employerId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      params.id,
      {
        title,
        location,
        type,
        salary,
        category,
        description,
        responsibilities,
        requirements,
        benefits,
        skills,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate("companyId", "name logo location website")

    if (!updatedJob) {
      return NextResponse.json(
        { success: false, message: "Failed to update job" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob,
    })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await context.params

    // Authenticate the user
    const user = await authenticateUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the request body
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive status is required" },
        { status: 400 }
      )
    }

    // Get the job and verify ownership
    const job = await Job.findById(id)
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      )
    }

    if (job.postedBy.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Not authorized to update this job" },
        { status: 403 }
      )
    }

    // Update the job status
    job.isActive = isActive
    await job.save()

    return NextResponse.json({
      success: true,
      message: `Job ${isActive ? "activated" : "deactivated"} successfully`,
      job: {
        id: job._id,
        isActive: job.isActive,
        status: job.isActive ? "active" : "inactive",
      },
    })
  } catch (error: any) {
    console.error("Error updating job status:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update job status",
      },
      { status: 500 }
    )
  }
}
