import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import JobSeeker from "@/models/JobSeeker"
import { authenticateUser, type AuthRequest } from "@/lib/auth"
import fs from "fs"
import path from "path"

// Ensure upload directories exist
function ensureUploadDirectories() {
  const directories = [
    path.join(process.cwd(), "public", "uploads", "profile"),
    path.join(process.cwd(), "public", "uploads", "logos")
  ]

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

// Call this when the module is loaded
ensureUploadDirectories()

// Get job seeker profile
export async function GET(req: AuthRequest) {
  try {
    await dbConnect()
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    if (user.role !== "jobseeker") {
      return NextResponse.json({ message: "Only job seekers can access this endpoint" }, { status: 403 })
    }

    const profile = await JobSeeker.findOne({ user: user._id })
      .populate({
        path: "user",
        select: "name email"
      })
      .populate({
        path: "savedJobs",
        populate: {
          path: "company",
          select: "name logo website industry size",
        },
      })
      .populate({
        path: "appliedJobs.job",
        populate: {
          path: "company",
          select: "name logo website industry size",
        },
      })

    if (!profile) {
      // Create a new profile if it doesn't exist
      const newProfile = await JobSeeker.create({
        user: user._id,
        savedJobs: [],
        appliedJobs: [],
      })
      // Populate user data for the new profile
      await newProfile.populate({
        path: "user",
        select: "name email"
      })
      return NextResponse.json(newProfile)
    }

    return NextResponse.json(profile)
  } catch (error: any) {
    console.error("Get profile error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

// Create or update job seeker profile
export async function PUT(req: AuthRequest) {
  try {
    await dbConnect()
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    if (user.role !== "jobseeker") {
      return NextResponse.json({ message: "Only job seekers can update their profile" }, { status: 403 })
    }

    const formData = await req.formData()
    const profileData = JSON.parse(formData.get("data") as string)
    const profilePicture = formData.get("profilePicture") as File | null

    let profilePicturePath = null

    if (profilePicture) {
      // Convert File to Buffer
      const bytes = await profilePicture.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const uniqueSuffix = timestamp + "-" + Math.round(Math.random() * 1e9)
      const filename = `profile-${uniqueSuffix}${path.extname(profilePicture.name)}`
      const filepath = path.join(process.cwd(), "public", "uploads", "profile", filename)

      // Ensure the upload directory exists
      const uploadDir = path.join(process.cwd(), "public", "uploads", "profile")
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      // Delete old profile picture if exists
      const existingProfile = await JobSeeker.findOne({ user: user._id })
      if (existingProfile?.profilePicture) {
        const oldFilePath = path.join(process.cwd(), "public", existingProfile.profilePicture)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      // Save new file
      fs.writeFileSync(filepath, buffer)
      profilePicturePath = `/uploads/profile/${filename}`
    }

    // Update or create profile
    const updateData = {
      ...profileData,
      ...(profilePicturePath && { profilePicture: profilePicturePath }),
    }

    const profile = await JobSeeker.findOneAndUpdate(
      { user: user._id },
      updateData,
      { 
        upsert: true, 
        new: true,
        runValidators: true 
      }
    ).populate({
      path: "savedJobs",
      populate: {
        path: "company",
        select: "name logo website industry size",
      },
    }).populate({
      path: "appliedJobs.job",
      populate: {
        path: "company",
        select: "name logo website industry size",
      },
    })

    return NextResponse.json(profile)
  } catch (error: any) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

// Delete profile picture
export async function DELETE(req: AuthRequest) {
  try {
    await dbConnect()
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    if (user.role !== "jobseeker") {
      return NextResponse.json({ message: "Only job seekers can update their profile" }, { status: 403 })
    }

    const profile = await JobSeeker.findOne({ user: user._id })
    if (!profile) {
      return NextResponse.json({ message: "Profile not found" }, { status: 404 })
    }

    if (profile.profilePicture) {
      const filepath = path.join(process.cwd(), "public", profile.profilePicture)
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
      profile.profilePicture = null
      await profile.save()
    }

    return NextResponse.json({ message: "Profile picture deleted successfully" })
  } catch (error: any) {
    console.error("Delete profile picture error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
} 