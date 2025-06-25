import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Job from "@/models/Job"

export async function GET() {
  try {
    await dbConnect()

    // Get featured jobs (latest 6 jobs)
    const jobs = await Job.find({ isActive: true })
      .populate("company", "name logo website industry size description")
      .sort({ createdAt: -1 })
      .limit(6)

    const formattedJobs = jobs.map((job) => ({
      id: job._id.toString(),
      title: job.title,
      company: job.company?.name || "Unknown Company",
      location: job.location,
      type: job.employmentType.charAt(0).toUpperCase() + job.employmentType.slice(1).replace("-", " "),
      salary: {
        min: job.salary.min,
        max: job.salary.max
      },
      posted: formatTimeAgo(job.createdAt),
      logo: job.company?.logo || "/placeholder.svg?height=40&width=40",
      isActive: job.isActive
    }))

    return NextResponse.json({
      success: true,
      jobs: formattedJobs,
    })
  } catch (error) {
    console.error("Get featured jobs error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}
