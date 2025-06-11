import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { User } from "@/models/User"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AuthRequest extends NextRequest {
  user?: any
}

interface JwtPayload {
  id: string
  _id?: string // Make _id optional for MongoDB compatibility
  email: string
  role: "jobseeker" | "employer" | "admin"
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcryptjs.compare(password, hashedPassword)
}

export function generateToken(payload: JwtPayload): string {
  // Ensure consistent payload structure
  const tokenPayload = {
    id: payload.id,
    userId: payload.id, // Add both for compatibility
    email: payload.email,
    role: payload.role,
  }
  return jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    // Ensure we return the expected structure
    return {
      id: decoded.id || decoded.userId,
      _id: decoded.id || decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    console.error("JWT verification error:", error)
    return null
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // Try to get token from cookies
  const token = req.cookies.get("token")?.value
  if (token) return token

  // Try to get token from Authorization header
  const authHeader = req.headers.get("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  return null
}

export async function getUserFromToken(req: NextRequest) {
  const token = getTokenFromRequest(req)
  if (!token) return null

  const payload = verifyJwtToken(token)
  return payload
}

export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  })
}

export function withAuth(handler: Function) {
  return async (req: NextRequest) => {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    return handler(req, user)
  }
}

export function withEmployerAuth(handler: Function) {
  return async (req: NextRequest) => {
    const user = await getUserFromToken(req)
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    if (user.role !== "employer") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    return handler(req, user)
  }
}

export async function authenticateUser(req: NextRequest) {
  try {
    await dbConnect()

    // Get token from Authorization header or cookies
    let token = req.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      // Try to get from cookies
      token = req.cookies.get("token")?.value
    }

    if (!token) {
      return null
    }

    // Use fallback secret if JWT_SECRET is not set
    const secret = process.env.JWT_SECRET || "fallback-secret-key-for-development"
    
    // Verify token
    const decoded = jwt.verify(token, secret) as any

    // Get user from database
    const user = await User.findById(decoded.id || decoded.userId).select("-password")

    if (!user) {
      console.error("User not found in database after token verification")
      return null
    }

    return user
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}
