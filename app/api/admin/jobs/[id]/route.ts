import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Job from "@/models/Job"
import { Types } from "mongoose"

// GET /api/admin/jobs/:id - Get job by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const { id } = params

    // Validate job ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      )
    }

    // Find job
    const job = await Job.findById(id)
      .populate("company", "name")
      .lean()

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      _id: job._id.toString(),
      title: job.title,
      company: {
        _id: job.company?._id?.toString() || "unknown",
        name: job.company?.name || "Unknown Company",
      },
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      isActive: job.isActive,
      applications: job.applications?.length || 0,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json(
      { error: "Failed to fetch job" },
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
    await dbConnect()

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

    return NextResponse.json({
      _id: job._id.toString(),
      title: job.title,
      company: {
        _id: job.company?._id?.toString() || "unknown",
        name: job.company?.name || "Unknown Company",
      },
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      isActive: job.isActive,
      applications: job.applications?.length || 0,
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
    await dbConnect()

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