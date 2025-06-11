import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    await dbConnect()

    const { provider, accessToken, userData } = await req.json()

    if (!provider || !accessToken || !userData) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Find or create user based on email
    let user = await User.findOne({ email: userData.email })

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name: userData.name,
        email: userData.email,
        role: "jobseeker", // Default role for OAuth users
        oauthProvider: provider,
        oauthId: userData.id,
        isEmailVerified: true, // OAuth emails are pre-verified
      })
    } else if (!user.oauthProvider) {
      // Link OAuth account to existing email account
      user.oauthProvider = provider
      user.oauthId = userData.id
      await user.save()
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error("OAuth error:", error)
    return NextResponse.json(
      { message: error.message || "Authentication failed" },
      { status: 500 }
    )
  }
} 