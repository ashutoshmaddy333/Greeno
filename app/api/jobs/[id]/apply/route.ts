import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Job, { IJob } from "@/models/Job"
import Application, { IApplication } from "@/models/Application"
import { authenticateUser, type AuthRequest } from "@/lib/auth"
import { Types } from "mongoose"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { existsSync } from "fs"
import type { Document } from "mongoose"
import JobSeeker from "@/models/JobSeeker"
import { IUser } from "@/models/User"
import emailService from "@/lib/email"

type AuthenticatedUser = Document & IUser & { _id: Types.ObjectId }
type JobWithDetails = Document & IJob & {
  company?: { name: string }
  postedBy?: { email: string; name: string }
}

interface AppliedJob {
  job: Types.ObjectId
  status: string
  appliedAt: Date
}

// Helper function to ensure upload directory exists
async function ensureUploadDir() {
  const uploadDir = join(process.cwd(), "public", "uploads", "resumes")
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  return uploadDir
}

// Helper function to save file
async function saveFile(file: File): Promise<{ filename: string; url: string; size: number; mimeType: string }> {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error("Only PDF files are allowed for resumes")
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Resume file size must be less than 5MB")
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename with .pdf extension
    const filename = `${uuidv4()}.pdf`
    const uploadDir = await ensureUploadDir()
    const filePath = join(uploadDir, filename)
    
    // Save the file
    await writeFile(filePath, buffer)
    
    // Return the filename, public URL, size and mime type
    return {
      filename,
      url: `/uploads/resumes/${filename}`,
      size: buffer.length,
      mimeType: 'application/pdf' // Force PDF mime type
    }
  } catch (error) {
    console.error("Error saving file:", error)
    throw error // Propagate the specific error
  }
}

export async function POST(
  req: AuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const user = await authenticateUser(req) as (Document & IUser) | null

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    if (user.role !== "jobseeker") {
      return NextResponse.json({ message: "Only job seekers can apply to jobs" }, { status: 403 })
    }

    // Check if job seeker profile exists
    const profile = await JobSeeker.findOne({ user: user._id })
    if (!profile) {
      return NextResponse.json({ 
        message: "Please complete your profile before applying for jobs",
        code: "PROFILE_REQUIRED"
      }, { status: 403 })
    }

    const { id: jobId } = await params
    console.log("Attempting to apply for job:", jobId)

    // Validate job ID format
    if (!jobId || !Types.ObjectId.isValid(jobId)) {
      console.error("Invalid job ID format:", jobId)
      return NextResponse.json({ message: "Invalid job ID format" }, { status: 400 })
    }

    // Get the job details for email notifications
    const job = await Job.findById(jobId)
      .populate("company", "name")
      .populate("postedBy", "email name")
      .exec() as JobWithDetails | null

    console.log("Job lookup result:", job ? "Found" : "Not found")

    if (!job) {
      console.error("Job not found with ID:", jobId)
      return NextResponse.json({ 
        message: "Job not found or has been removed",
        jobId 
      }, { status: 404 })
    }

    // Check if job is still active
    if (!job.isActive) {
      console.log("Job is inactive:", jobId)
      return NextResponse.json({ 
        message: "This job is no longer accepting applications",
        jobId
      }, { status: 400 })
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: user._id
    })

    if (existingApplication) {
      return NextResponse.json({ message: "Already applied to this job" }, { status: 400 })
    }

    // Get form data
    const formData = await req.formData()
    const resume = formData.get('resume') as File
    if (!resume) {
      return NextResponse.json({ message: "Resume is required" }, { status: 400 })
    }

    try {
      // Save resume file with validation
      const { filename, url, size, mimeType } = await saveFile(resume)

      // Create application record
      const application = await Application.create({
        job: jobId,
        applicant: user._id,
        status: "pending",
        resumeFilename: filename,
        resumeUrl: url,
        resumeOriginalName: resume.name,
        resumeSize: size,
        resumeMimeType: mimeType,
        firstName: formData.get('firstName'),
        middleName: formData.get('middleName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phoneNumber: formData.get('phoneNumber'),
        experience: formData.get('experience'),
        yearsOfExperience: formData.get('yearsOfExperience'),
        education: JSON.parse(formData.get('education') as string),
        coverLetter: formData.get('coverLetter'),
      })

      // Add job to applied jobs in profile
      profile.appliedJobs.push({
        job: jobId,
        status: "applied",
        appliedAt: new Date(),
      })
      await profile.save()

      // Send email notifications
      try {
        // Send email to employer
        if (job.postedBy?.email) {
          await emailService.sendJobApplicationEmail(application, {
            ...job.toObject(),
            company: job.company.name // Use company name instead of ID
          })
        }

        // Send email to applicant
        await emailService.sendJobApplicationEmail(application, {
          ...job.toObject(),
          company: job.company.name // Use company name instead of ID
        })
      } catch (emailError) {
        console.error("Error sending email notifications:", emailError)
        // Don't fail the request if email sending fails
      }

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Application submitted successfully",
        application: {
          id: application._id,
          status: application.status,
          appliedAt: application.createdAt
        }
      })
    } catch (fileError: any) {
      // Handle file validation errors
      return NextResponse.json({ 
        message: fileError.message || "Error processing resume file" 
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Apply job error:", error)
    return NextResponse.json({ 
      message: error.message || "Server error" 
    }, { status: 500 })
  }
}

export async function DELETE(
  req: AuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    if (user.role !== "jobseeker") {
      return NextResponse.json({ message: "Only job seekers can withdraw applications" }, { status: 403 })
    }

    const { id: jobId } = await params

    // Find and update the job seeker profile
    const profile = await JobSeeker.findOneAndUpdate(
      { user: user._id },
      { $pull: { appliedJobs: { job: jobId } } },
      { new: true }
    ).populate({
      path: "appliedJobs.job",
      populate: {
        path: "company",
        select: "name logo website industry size",
      },
    })

    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    console.error("Withdraw application error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

// Get all applications for a job (for employer)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await context.params

    // Authenticate the user
    const user = await authenticateUser(request) as AuthenticatedUser | null
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the job and verify ownership
    const job = await Job.findById(id).populate("company")
    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      )
    }

    // Check if user is the employer who posted the job
    if (job.postedBy.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, message: "Not authorized to view applications" },
        { status: 403 }
      )
    }

    // Get all applications for this job
    const applications = await Application.find({ job: id })
      .populate<{ applicant: { _id: string; name: string; email: string } }>("applicant", "name email")
      .sort({ createdAt: -1 })
      .lean()

    // Format the response
    const formattedApplications = applications.map((app) => ({
      id: app._id,
      status: app.status,
      appliedAt: app.createdAt?.toISOString(), // Use createdAt instead of appliedAt
      resumeFilename: app.resumeFilename,
      resumeOriginalName: app.resumeOriginalName,
      resumeUrl: app.resumeUrl,
      coverLetter: app.coverLetter,
      firstName: app.firstName,
      middleName: app.middleName,
      lastName: app.lastName,
      email: app.email,
      phoneNumber: app.phoneNumber,
      experience: app.experience,
      yearsOfExperience: app.yearsOfExperience,
      education: app.education,
      applicant: {
        id: app.applicant._id,
        name: app.applicant.name,
        email: app.applicant.email,
      },
      job: {
        id: job._id,
        title: job.title,
        company: job.company?.name || "Unknown Company",
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

// Update application status (for employer)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await context.params

    // Authenticate the user
    const user = await authenticateUser(request) as AuthenticatedUser | null
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the request body
    const body = await request.json()
    const { applicationId, status } = body

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, message: "Application ID and status are required" },
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
        { success: false, message: "Not authorized to update applications" },
        { status: 403 }
      )
    }

    // Update the application status
    const application = await Application.findOneAndUpdate(
      { _id: applicationId, job: id },
      { status },
      { new: true }
    )

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
      application: {
        id: application._id,
        status: application.status,
        appliedAt: application.createdAt?.toISOString(), // Use createdAt instead of appliedAt
      },
    })
  } catch (error: any) {
    console.error("Error updating application:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update application",
      },
      { status: 500 }
    )
  }
} 