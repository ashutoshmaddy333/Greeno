import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Job from "@/models/Job"

// Helper function to get job category label with emoji
function getJobCategoryLabel(category: string): string {
  const categoryMap: { [key: string]: string } = {
    // B.Tech Categories
    "software-engineer": "💻 Software Engineer",
    "mechanical-engineer": "⚙️ Mechanical Engineer",
    "electrical-engineer": "⚡ Electrical Engineer",
    "civil-engineer": "🏗️ Civil Engineer",
    "electronics-engineer": "🔌 Electronics Engineer",
    "chemical-engineer": "🧪 Chemical Engineer",
    "aerospace-engineer": "✈️ Aerospace Engineer",
    "robotics-engineer": "🤖 Robotics Engineer",
    "ai-ml-engineer": "🧠 AI/ML Engineer",
    "data-engineer": "📊 Data Engineer",
    "network-engineer": "🌐 Network Engineer",
    "embedded-systems-engineer": "🔧 Embedded Systems Engineer",
    "biomedical-engineer": "🏥 Biomedical Engineer",
    "environmental-engineer": "🌱 Environmental Engineer",
    "industrial-engineer": "🏭 Industrial Engineer",
    // 10th Pass Categories
    "peon-office-boy": "🧹 Peon / Office Boy",
    "general-helper": "🛠 General Helper",
    "packaging-assistant": "📦 Packaging Assistant",
    "loading-unloading-staff": "🚚 Loading & Unloading Staff",
    "cleaning-housekeeping-staff": "🧯 Cleaning / Housekeeping Staff",
    // 12th Pass Categories
    "machine-operator": "🏭 Machine Operator",
    "quality-checker": "🔍 Quality Checker",
    "store-assistant": "🧾 Store Assistant",
    "production-assistant": "📋 Production Assistant",
    "warehouse-assistant": "📦 Warehouse Assistant",
    // ITI Pass Categories
    "electrician": "🔌 Electrician",
    "fitter": "🔧 Fitter",
    "welder": "🔩 Welder",
    "machinist": "⚙️ Machinist",
    "maintenance-technician": "🛠️ Maintenance Technician",
    "cnc-machine-operator": "🖥 CNC Machine Operator",
    "tool-room-assistant": "🔧 Tool Room Assistant",
    "mechanical-technician": "🏗️ Mechanical Technician",
    // Other Entry-Level Categories
    "store-keeper": "📋 Store Keeper",
    "material-handler": "🪜 Material Handler",
    "packing-supervisor": "📦 Packing Supervisor",
    "inventory-assistant": "🛒 Inventory Assistant",
    "assembly-line-worker": "🧰 Assembly Line Worker"
  }
  return categoryMap[category] || category
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Find jobs that are either marked as remote or have employmentType as "remote"
    const remoteJobs = await Job.find({
      $or: [
        { remote: true },
        { employmentType: { $regex: /^remote$/i } } // Case-insensitive match for "remote"
      ],
      isActive: true
    })
    .populate("company", "name logo website")
    .sort({ createdAt: -1 })
    .limit(6) // Show only 6 remote jobs on the home page
    .lean()

    const formattedJobs = remoteJobs.map((job: any) => ({
      id: job._id.toString(),
      title: job.title,
      company: job.company?.name || "Unknown Company",
      location: "Remote",
      type: job.employmentType.charAt(0).toUpperCase() + job.employmentType.slice(1).replace("-", " "),
      salary: {
        min: job.salary.min,
        max: job.salary.max
      },
      posted: new Date(job.createdAt).toLocaleDateString(),
      logo: job.company?.logo || "/placeholder.svg",
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      skills: job.skills,
      remote: true,
      experienceLevel: job.experienceLevel,
      educationLevel: job.educationLevel,
      applicationDeadline: new Date(job.applicationDeadline).toLocaleDateString(),
      views: job.views,
      category: getJobCategoryLabel(job.jobCategory) || "Uncategorized",
      companyInfo: {
        name: job.company?.name || "Unknown Company",
        website: job.company?.website || "#",
        logo: job.company?.logo || "/placeholder.svg",
      },
      isActive: true
    }))

    return NextResponse.json({
      success: true,
      jobs: formattedJobs,
    })
  } catch (error: any) {
    console.error("Error fetching remote jobs:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch remote jobs",
      },
      { status: 500 }
    )
  }
}
