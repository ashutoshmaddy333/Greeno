import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Application from "@/models/Application"
import Job from "@/models/Job"
import { verifyJwtToken } from "@/lib/auth"

interface JwtPayload {
  userId: string
  role: string
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyJwtToken(token)
    if (!decoded || decoded.role !== "employer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Verify job belongs to employer and get company name
    const job = await Job.findById(params.id).populate("company", "name")
    if (!job || job.postedBy.toString() !== decoded.id) {
      return NextResponse.json({ error: "Job not found or unauthorized" }, { status: 404 })
    }

    const applications = await Application.find({ job: params.id })
      .populate("applicant", "name email")
      .sort({ createdAt: -1 })
      .lean()

    // Add company name to each application
    const applicationsWithCompany = applications.map(app => ({
      ...app,
      company: job.company.name
    }))

    return NextResponse.json({ applications: applicationsWithCompany })
  } catch (error) {
    console.error("Error fetching job applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
