import { NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"
import { storeOTP } from "@/lib/otp"
import { sendOTPEmail } from "@/lib/email"

// Removed: dbConnect()

export async function POST(request: Request) {
  try {
    await dbConnect(); // Ensure DB connection before any DB operation
    const reqBody = await request.json()
    console.log("Registration request body:", { ...reqBody, password: "[REDACTED]" })
    const { name, email, password, role } = reqBody

    // Validate required fields
    if (!name || !email || !password || !role) {
      const missingFields = []
      if (!name) missingFields.push("name")
      if (!email) missingFields.push("email")
      if (!password) missingFields.push("password")
      if (!role) missingFields.push("role")

      return NextResponse.json(
        { 
          error: "Missing required fields",
          details: `Please provide: ${missingFields.join(", ")}`
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Validate role
    if (!["jobseeker", "employer", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be either 'jobseeker', 'employer', or 'admin'" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { 
          error: "Email already registered",
          details: "An account with this email address already exists. Please use a different email or try logging in."
        },
        { status: 400 }
      )
    }

    // Create new user with unverified status
    const newUser = await User.create({
      name,
      email,
      role,
      password, // Password will be hashed by the User model's pre-save middleware
      isVerified: false,
      isEmailVerified: false
    })

    try {
      // Generate and store OTP
      const otp = await storeOTP(email, 'signup')
      
      // Send OTP email
      await sendOTPEmail(email, otp, 'signup')

      return NextResponse.json(
        {
          message: "Registration successful. Please verify your email.",
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          }
        },
        { status: 201 }
      )
    } catch (error) {
      // If OTP sending fails, delete the user and return error
      await User.deleteOne({ _id: newUser._id })
      throw error
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { 
        error: "Registration failed",
        details: error.message || "An unexpected error occurred. Please try again."
      },
      { status: 500 }
    )
  }
}
