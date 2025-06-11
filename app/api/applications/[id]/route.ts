import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Application from "@/models/Application"
import Job from "@/models/Job"
import { authenticateUser, type AuthRequest } from "@/lib/auth"

// Get a single application
export async function GET(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    // Find application
    const application = await Application.findById(params.id)
      .populate("job", "title company")
      .populate("applicant", "name email")

    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }

    // Check if user is authorized to view this application
    if (user.role === "jobseeker" && application.applicant._id.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Not authorized to view this application" }, { status: 403 })
    }

    if (user.role === "employer") {
      // Check if the job belongs to the employer
      const job = await Job.findById(application.job)

      if (!job || job.postedBy.toString() !== user._id.toString()) {
        return NextResponse.json({ message: "Not authorized to view this application" }, { status: 403 })
      }
    }

    return NextResponse.json(application)
  } catch (error: any) {
    console.error("Get application error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

// Update application status (employer only)
export async function PUT(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    // Check if user is an employer
    if (user.role !== "employer") {
      return NextResponse.json({ message: "Only employers can update application status" }, { status: 403 })
    }

    // Find application
    const application = await Application.findById(params.id)

    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }

    // Check if the job belongs to the employer
    const job = await Job.findById(application.job)

    if (!job || job.postedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Not authorized to update this application" }, { status: 403 })
    }

    const { status, notes } = await req.json()

    // Update application
    const updatedApplication = await Application.findByIdAndUpdate(
      params.id,
      { status, notes },
      { new: true, runValidators: true },
    )

    return NextResponse.json(updatedApplication)
  } catch (error: any) {
    console.error("Update application error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

// Delete an application (job seeker only)
export async function DELETE(req: AuthRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    // Find application
    const application = await Application.findById(params.id)

    if (!application) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }

    // Check if user is the applicant
    if (application.applicant.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Not authorized to delete this application" }, { status: 403 })
    }

    // Remove application from job
    await Job.findByIdAndUpdate(application.job, { $pull: { applications: application._id } })

    // Delete application
    await application.deleteOne()

    return NextResponse.json({ message: "Application removed" })
  } catch (error: any) {
    console.error("Delete application error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}
