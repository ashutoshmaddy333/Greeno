import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Job from "@/models/Job"
import Application from "@/models/Application"
import { authenticateUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Authenticate the user
    const user = await authenticateUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all jobs posted by the employer
    const jobs = await Job.find({ postedBy: user._id }).select("_id")
    const jobIds = jobs.map((job) => job._id)

    // Get all applications for these jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("job", "title company")
      .populate("applicant", "name email")
      .sort({ appliedAt: -1 })

    // Format the response
    const formattedApplications = applications.map((app) => ({
      id: app._id,
      status: app.status,
      appliedAt: app.appliedAt,
      resume: app.resume,
      coverLetter: app.coverLetter,
      applicant: {
        id: app.applicant._id,
        name: app.applicant.name,
        email: app.applicant.email,
      },
      job: {
        id: app.job._id,
        title: app.job.title,
        company: app.job.company,
      },
    }))

    return NextResponse.json({
      success: true,
      applications: formattedApplications,
    })
  } catch (error: any) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch applications",
      },
      { status: 500 }
    )
  }
} 