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
      .populate({ path: "job", select: "title company", populate: { path: "company", select: "name" } })
      .populate("applicant", "name email")
      .sort({ createdAt: -1 })

    // Format the response
    const formattedApplications = applications.map((app) => {
      const applicant = app.applicant as unknown as { _id: any; name: string; email: string }
      const job = app.job as unknown as { _id: any; title: string; company: { name: string } }
      return {
        id: app._id,
        status: app.status,
        appliedAt: (app as any).appliedAt || app.createdAt,
        resumeFilename: app.resumeFilename,
        resumeOriginalName: app.resumeOriginalName,
        resumeMimeType: app.resumeMimeType,
        resumeSize: app.resumeSize,
        resumeUrl: app.resumeUrl,
        coverLetter: app.coverLetter,
        applicant: {
          id: applicant._id,
          name: applicant.name,
          email: applicant.email,
        },
        job: {
          id: job._id,
          title: job.title,
          company: job.company?.name || "Unknown Company",
        },
      }
    })

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