import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"
import { Types } from "mongoose"

interface UserDocument {
  _id: Types.ObjectId
  name: string
  email: string
  role: string
  isEmailVerified: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

interface UserResponse {
  _id: string
  name: string
  email: string
  role: string
  isEmailVerified: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

// GET /api/admin/users - Get all users with pagination and filtering
export async function GET(request: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    // Build query
    const query: any = {}
    if (role) query.role = role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    // Get total count for pagination
    const total = await User.countDocuments(query)

    // Get users with pagination
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password")
      .lean()
      .then(users => users.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })))

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
} 