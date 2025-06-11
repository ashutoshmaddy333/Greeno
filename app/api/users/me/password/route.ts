import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"
import { authenticateUser, type AuthRequest } from "@/lib/auth"

// Update user password
export async function PUT(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    // Get user with password
    const userWithPassword = await User.findById(user._id).select("+password")

    // Check current password
    const isMatch = await userWithPassword.matchPassword(currentPassword)

    if (!isMatch) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
    }

    // Update password
    userWithPassword.password = newPassword
    await userWithPassword.save()

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error: any) {
    console.error("Update password error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}
