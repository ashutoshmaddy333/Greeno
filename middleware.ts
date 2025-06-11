import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJwtToken } from "@/lib/auth"

// Minimal middleware that just passes through all requests
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

// Keep the matcher config but with empty array to effectively disable route matching
export const config = {
  matcher: [],
}
