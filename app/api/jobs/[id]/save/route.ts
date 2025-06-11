import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import JobSeeker from "@/models/JobSeeker"
import { authenticateUser, type AuthRequest } from "@/lib/auth"
import mongoose from "mongoose"

// Save a job
export async function POST(
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
      return NextResponse.json({ message: "Only job seekers can save jobs" }, { status: 403 })
    }

    const { id: jobId } = await params

    // Find the job seeker profile
    const profile = await JobSeeker.findOne({ user: user._id })
    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 })
    }

    // Check if job is already saved
    if (profile.savedJobs.includes(jobId)) {
      // If already saved, unsave it
      profile.savedJobs = profile.savedJobs.filter((id: mongoose.Types.ObjectId) => id.toString() !== jobId)
    } else {
      // If not saved, add it
      profile.savedJobs.push(jobId)
    }

    await profile.save()

    // Return updated profile with populated job data
    const updatedProfile = await JobSeeker.findById(profile._id)
      .populate({
        path: "savedJobs",
        populate: {
          path: "company",
          select: "name logo website industry size",
        },
      })

    return NextResponse.json(updatedProfile)
  } catch (error: any) {
    console.error("Save job error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

// Unsave a job
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
      return NextResponse.json({ message: "Only job seekers can unsave jobs" }, { status: 403 })
    }

    const { id: jobId } = await params

    // Find and update the job seeker profile
    const profile = await JobSeeker.findOneAndUpdate(
      { user: user._id },
      { $pull: { savedJobs: jobId } },
      { new: true }
    ).populate({
      path: "savedJobs",
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
    console.error("Unsave job error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
} 