import { NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import dbConnect, { ADMIN_CREDENTIALS } from "@/lib/db"
import { User } from "@/models/User"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

export async function POST(req: Request) {
  try {
    // Connect to database first
    console.log("Connecting to database...")
    try {
      await dbConnect()
      console.log("Database connected successfully")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      throw new Error("Database connection failed")
    }

    let body
    try {
      body = await req.json()
      console.log("Request body:", { ...body, password: "[REDACTED]" })
    } catch (parseError) {
      console.error("Request body parse error:", parseError)
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
    }

    const { email, password } = body
    console.log("Login attempt for email:", email)

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ message: "Please provide email and password" }, { status: 400 })
    }

    // Check for admin login first
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      console.log("Admin credentials matched, checking for admin user...")
      try {
        // Find admin user
        const adminUser = await User.findOne({ email: ADMIN_CREDENTIALS.email })
        
        if (!adminUser) {
          console.log("Admin user not found")
          return NextResponse.json({ message: "Admin user not found" }, { status: 404 })
        }

        // Verify admin role
        if (adminUser.role !== "admin") {
          console.log("User is not an admin")
          return NextResponse.json({ message: "Unauthorized" }, { status: 403 })
        }

        // Generate JWT token for admin
        const token = jwt.sign(
          { 
            id: adminUser._id, 
            email: adminUser.email, 
            role: "admin" 
          },
          process.env.JWT_SECRET || "fallback-secret",
          { expiresIn: "7d" }
        )

        // Create response
        const response = NextResponse.json({
          message: "Admin login successful",
          user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: "admin",
          },
          token,
        })

        // Set cookie
        response.cookies.set("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60,
        })

        console.log("Admin login successful")
        return response
      } catch (adminError: any) {
        console.error("Admin login error:", adminError)
        return NextResponse.json(
          { message: "Admin login failed", error: adminError.message },
          { status: 500 }
        )
      }
    }

    // For regular users
    console.log("Checking for regular user...")
    try {
      const user = await User.findOne({ email }).select("+password")
      
      if (!user) {
        console.log("User not found")
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
      }

      if (!user.password) {
        console.log("User has no password set")
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
      }

      // Use the User model's comparePassword method
      const isPasswordMatch = await user.comparePassword(password)
      if (!isPasswordMatch) {
        console.log("Password does not match")
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
      }

      // Check if user is verified
      if (!user.isVerified || !user.isEmailVerified) {
        console.log("User not verified:", { isVerified: user.isVerified, isEmailVerified: user.isEmailVerified });
        return NextResponse.json({ 
          message: "Please verify your email before logging in",
          error: "UNVERIFIED_EMAIL",
          email: user.email
        }, { status: 403 });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      )

      // Create response
      const response = NextResponse.json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      })

      // Set cookie
      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
      })

      console.log("Regular user login successful")
      return response
    } catch (userError) {
      console.error("Regular user login error details:", {
        name: userError instanceof Error ? userError.name : "Unknown",
        message: userError instanceof Error ? userError.message : "Unknown error",
        stack: userError instanceof Error ? userError.stack : undefined
      })
      throw userError
    }
  } catch (error) {
    console.error("Login error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        message: "Login failed", 
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
