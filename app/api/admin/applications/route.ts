import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import Application from "@/models/Application"
import { Types } from "mongoose"

interface PopulatedJob {
  _id: Types.ObjectId
  title: string
  company: {
    _id: Types.ObjectId
    name: string
  }
}

interface PopulatedApplicant {
  _id: Types.ObjectId
  name: string
  email: string
}

interface ApplicationDocument {
  _id: Types.ObjectId
  job: PopulatedJob
  applicant: PopulatedApplicant
  status: string
  experience: string
  yearsOfExperience?: number
  education: Array<{
    degree: string
    field: string
    institution: string
    graduationYear: number
  }>
  resumeUrl: string
  coverLetter: string
  createdAt: Date
  updatedAt: Date
}

interface ApplicationResponse {
  _id: string
  job: {
    _id: string
    title: string
    company: {
      _id: string
      name: string
    }
  }
  applicant: {
    _id: string
    name: string
    email: string
  }
  status: string
  experience: string
  yearsOfExperience?: number
  education: Array<{
    degree: string
    field: string
    institution: string
    graduationYear: number
  }>
  resumeUrl: string
  coverLetter: string
  createdAt: string
  updatedAt: string
}

// GET /api/admin/applications - Get all applications with pagination and filtering
export async function GET(request: Request) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    // Build query
    const query: any = {}
    if (status) query.status = status
    if (search) {
      query.$or = [
        { "job.title": { $regex: search, $options: "i" } },
        { "job.company.name": { $regex: search, $options: "i" } },
        { "applicant.name": { $regex: search, $options: "i" } },
        { "applicant.email": { $regex: search, $options: "i" } },
      ]
    }

    // Get total count for pagination
    const total = await Application.countDocuments(query)

    // Get applications with pagination
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate<{ job: PopulatedJob }>({
        path: "job",
        select: "title",
        populate: {
          path: "company",
          select: "name",
        },
      })
      .populate<{ applicant: PopulatedApplicant }>("applicant", "name email")
      .select("-resumeFilename -resumeOriginalName -resumeMimeType -resumeSize")
      .lean()
      .then(applications => applications.map(app => ({
        _id: app._id.toString(),
        job: {
          _id: app.job._id.toString(),
          title: app.job.title,
          company: {
            _id: app.job.company._id.toString(),
            name: app.job.company.name,
          },
        },
        applicant: {
          _id: app.applicant._id.toString(),
          name: app.applicant.name,
          email: app.applicant.email,
        },
        status: app.status,
        experience: app.experience,
        yearsOfExperience: app.yearsOfExperience,
        education: app.education,
        resumeUrl: app.resumeUrl,
        coverLetter: app.coverLetter,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      })))

    return NextResponse.json({
      applications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/applications/:id - Update application status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { id } = params
    const body = await request.json()

    // Validate application ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      )
    }

    // Find and update application
    const application = await Application.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate<{ job: PopulatedJob }>({
        path: "job",
        select: "title",
        populate: {
          path: "company",
          select: "name",
        },
      })
      .populate<{ applicant: PopulatedApplicant }>("applicant", "name email")
      .select("-resumeFilename -resumeOriginalName -resumeMimeType -resumeSize")
      .lean()

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      _id: application._id.toString(),
      job: {
        _id: application.job._id.toString(),
        title: application.job.title,
        company: {
          _id: application.job.company._id.toString(),
          name: application.job.company.name,
        },
      },
      applicant: {
        _id: application.applicant._id.toString(),
        name: application.applicant.name,
        email: application.applicant.email,
      },
      status: application.status,
      experience: application.experience,
      yearsOfExperience: application.yearsOfExperience,
      education: application.education,
      resumeUrl: application.resumeUrl,
      coverLetter: application.coverLetter,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/applications/:id - Delete application
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase()

    const { id } = params

    // Validate application ID
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID" },
        { status: 400 }
      )
    }

    // Find and delete application
    const application = await Application.findByIdAndDelete(id)

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Application deleted successfully" })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    )
  }
} 