import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Job from "@/models/Job"
import { Types } from "mongoose"

interface JobResponse {
  _id: string
  title: string
  company: {
    _id: string
    name: string
  }
  location: string
  type: string
  salary: {
    min: number
    max: number
    currency: string
  }
  isActive: boolean
  views: number
  applications: number
  createdAt: string
  updatedAt: string
}

// GET /api/admin/jobs - Get all jobs with pagination and filtering
export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type")
    const isActive = searchParams.get("isActive")
    const search = searchParams.get("search")

    // Build query
    const query: any = {}
    if (type) query.type = type
    if (isActive !== null) query.isActive = isActive === "true"
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "company.name": { $regex: search, $options: "i" } },
      ]
    }

    // Get total count for pagination
    const total = await Job.countDocuments(query)

    // Get jobs with pagination
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("company", "name")
      .lean()
      .then(async (jobs) => {
        const jobsWithApplications = await Promise.all(
          jobs.map(async (job) => {
            const applications = await Job.aggregate([
              { $match: { _id: job._id } },
              { $project: { count: { $size: "$applications" } } },
            ]).then((result) => result[0]?.count || 0)

            return {
              _id: job._id.toString(),
              title: job.title,
              company: {
                _id: job.company._id.toString(),
                name: job.company.name,
              },
              location: job.location,
              type: job.type,
              salary: job.salary,
              isActive: job.isActive,
              views: job.views || 0,
              applications,
              createdAt: job.createdAt.toISOString(),
              updatedAt: job.updatedAt.toISOString(),
            } as JobResponse
          })
        )
        return jobsWithApplications
      })

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/jobs/:id - Update job
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { id } = params
    const body = await request.json()

    // Validate job ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      )
    }

    // Find and update job
    const job = await Job.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate("company", "name")
      .lean()

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    // Get application count
    const applications = await Job.aggregate([
      { $match: { _id: job._id } },
      { $project: { count: { $size: "$applications" } } },
    ]).then((result) => result[0]?.count || 0)

    return NextResponse.json({
      _id: job._id.toString(),
      title: job.title,
      company: {
        _id: job.company._id.toString(),
        name: job.company.name,
      },
      location: job.location,
      type: job.type,
      salary: job.salary,
      isActive: job.isActive,
      views: job.views || 0,
      applications,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/jobs/:id - Delete job
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { id } = params

    // Validate job ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      )
    }

    // Find and delete job
    const job = await Job.findByIdAndDelete(id)

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Job deleted successfully" })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    )
  }
} 