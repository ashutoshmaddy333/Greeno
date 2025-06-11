import { type NextRequest, NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      message: "Logout successful",
    })

    // Clear auth cookie
    clearAuthCookie(response)

    return response
  } catch (error: any) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: error.message || "Logout failed" }, { status: 500 })
  }
}
