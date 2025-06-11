import { NextResponse } from "next/server"
import { User } from "@/models/User"
import dbConnect from "@/lib/db"
import { authenticateUser, type AuthRequest } from "@/lib/auth"

// Get current user profile
export async function GET(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    // If user is an employer, populate company
    if (user.role === "employer") {
      const userWithCompany = await User.findById(user._id).populate("company")
      return NextResponse.json(userWithCompany)
    }

    return NextResponse.json(user)
  } catch (error: any) {
    console.error("Get profile error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

// Update user profile
export async function PUT(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    const userData = await req.json()

    // Remove fields that shouldn't be updated directly
    delete userData.password
    delete userData.role
    delete userData.company

    // Update user
    const updatedUser = await User.findByIdAndUpdate(user._id, userData, { new: true, runValidators: true })

    return NextResponse.json(updatedUser)
  } catch (error: any) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}
