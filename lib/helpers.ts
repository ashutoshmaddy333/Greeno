import { cookies } from "next/headers"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Helper function to get auth token
async function getAuthToken() {
  const cookieStore = await cookies()
  return cookieStore.get("token")?.value
}

// Helper function to make authenticated requests
export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
  const token = await getAuthToken()

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })
}
