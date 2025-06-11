import { NextResponse, type NextRequest } from "next/server"
import { authenticateUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateUser(req)
    const isAdmin = user?.role === "admin"

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error("Admin check error:", error)
    return NextResponse.json({ isAdmin: false })
  }
} 