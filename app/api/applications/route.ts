import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Application from "@/models/Application"
import Job from "@/models/Job"
import { authenticateUser, type AuthRequest } from "@/lib/auth"

// Get all applications for a user (job seeker or employer)
export async function GET(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const jobId = url.searchParams.get("jobId")

    let query = {}

    // If user is a job seeker, get their applications
    if (user.role === "jobseeker") {
      query = { applicant: user._id }

      if (jobId) {
        query = { ...query, job: jobId }
      }

      const applications = await Application.find(query)
        .populate("job", "title company")
        .populate({
          path: "job",
          populate: {
            path: "company",
            select: "name logo",
          },
        })
        .sort({ createdAt: -1 })

      return NextResponse.json(applications)
    }

    // If user is an employer, get applications for their jobs
    if (user.role === "employer") {
      // Get all jobs posted by the employer
      const jobs = await Job.find({ postedBy: user._id }).select("_id")
      const jobIds = jobs.map((job) => job._id)

      query = { job: { $in: jobIds } }

      if (jobId) {
        // Verify the job belongs to the employer
        const job = await Job.findOne({ _id: jobId, postedBy: user._id })

        if (!job) {
          return NextResponse.json({ message: "Job not found or not authorized" }, { status: 404 })
        }

        query = { job: jobId }
      }

      const applications = await Application.find(query)
        .populate("job", "title")
        .populate("applicant", "name email")
        .sort({ createdAt: -1 })

      return NextResponse.json(applications)
    }

    return NextResponse.json({ message: "Invalid user role" }, { status: 400 })
  } catch (error: any) {
    console.error("Get applications error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

// Create a new application
export async function POST(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    // Check if user is a job seeker
    if (user.role !== "jobseeker") {
      return NextResponse.json({ message: "Only job seekers can apply for jobs" }, { status: 403 })
    }

    const { jobId, resume, coverLetter } = await req.json()

    // Check if job exists
    const job = await Job.findById(jobId)

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 })
    }

    // Check if job is still active
    if (!job.isActive) {
      return NextResponse.json({ message: "This job is no longer accepting applications" }, { status: 400 })
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: user._id,
    })

    if (existingApplication) {
      return NextResponse.json({ message: "You have already applied for this job" }, { status: 400 })
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: user._id,
      resume,
      coverLetter,
    })

    // Add application to job
    job.applications.push(application._id)
    await job.save()

    return NextResponse.json(application, { status: 201 })
  } catch (error: any) {
    console.error("Create application error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}
