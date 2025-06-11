export type { ApplicationStatus } from "@/types/application"

export async function updateJobApplicationStatus(applicationId: string, status: string) {
  try {
    const response = await fetch(`/api/jobs/apply/${applicationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error updating application status:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update application status"
    }
  }
} 