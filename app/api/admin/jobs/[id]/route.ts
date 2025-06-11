import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Job from "@/models/Job"
import { Types } from "mongoose"
import { IJob } from "@/models/Job"

interface JobDocument {
  _id: Types.ObjectId
  title: string
  company: {
    _id: Types.ObjectId
    name: string
  }
  location: string
  type: string
  description: string
  requirements: string[]
  responsibilities: string[]
  salary: {
    min: number
    max: number
    currency: string
  }
  isActive: boolean
  views: number
  applications: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
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
      .lean() as unknown as JobDocument

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