import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { SystemSettings } from "@/models/SystemSettings"
import { Types } from "mongoose"

// Default settings
const DEFAULT_SETTINGS = [
  {
    key: "allowJobPosting",
    value: true,
    description: "Allow employers to post new jobs",
    category: "job" as const,
    type: "boolean" as const,
    isPublic: true,
  },
  {
    key: "allowJobApplications",
    value: true,
    description: "Allow job seekers to apply for jobs",
    category: "job" as const,
    type: "boolean" as const,
    isPublic: true,
  },
  {
    key: "requireEmailVerification",
    value: true,
    description: "Require email verification for new accounts",
    category: "security" as const,
    type: "boolean" as const,
    isPublic: true,
  },
  {
    key: "maxJobsPerEmployer",
    value: 10,
    description: "Maximum number of active jobs per employer",
    category: "job" as const,
    type: "number" as const,
    isPublic: true,
  },
  {
    key: "maxApplicationsPerJob",
    value: 100,
    description: "Maximum number of applications per job",
    category: "job" as const,
    type: "number" as const,
    isPublic: true,
  },
  {
    key: "jobPostingFee",
    value: 0,
    description: "Fee for posting a job (in USD)",
    category: "job" as const,
    type: "number" as const,
    isPublic: true,
  },
  {
    key: "maintenanceMode",
    value: false,
    description: "Enable maintenance mode",
    category: "general" as const,
    type: "boolean" as const,
    isPublic: true,
  },
  {
    key: "maintenanceMessage",
    value: "The site is currently under maintenance. Please check back later.",
    description: "Message to display during maintenance mode",
    category: "general" as const,
    type: "string" as const,
    isPublic: true,
  },
  {
    key: "siteName",
    value: "GreenTech Jobs",
    description: "Name of the job board",
    category: "general" as const,
    type: "string" as const,
    isPublic: true,
  },
  {
    key: "contactEmail",
    value: "hrm@greenotechjobs.com",
    description: "Contact email for support",
    category: "general" as const,
    type: "string" as const,
    isPublic: true,
  },
]

// GET /api/admin/settings - Get all settings
export async function GET() {
  try {
    await dbConnect()
    
    // Check if settings exist in database
    const existingSettings = await SystemSettings.find({})
    
    if (existingSettings.length === 0) {
      // Initialize with default settings
      const defaultSettingsWithIds = DEFAULT_SETTINGS.map(setting => ({
        ...setting,
        _id: new Types.ObjectId(),
        updatedBy: new Types.ObjectId(), // You might want to get this from the admin session
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
      
      await SystemSettings.insertMany(defaultSettingsWithIds)
      return NextResponse.json({ settings: defaultSettingsWithIds })
    }

    return NextResponse.json({ settings: existingSettings })
  } catch (error) {
    console.error("Error in GET /api/admin/settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/settings - Update settings
export async function PATCH(request: Request) {
  try {
    await dbConnect()
    const updates = await request.json()

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid request format. Expected an array of updates." },
        { status: 400 }
      )
    }

    const updatedSettings = []
    
    for (const update of updates) {
      const { key, value } = update
      
      const result = await SystemSettings.findOneAndUpdate(
        { key },
        { 
          value,
          updatedAt: new Date(),
          updatedBy: new Types.ObjectId(), // You might want to get this from the admin session
        },
        { new: true }
      )
      
      if (result) {
        updatedSettings.push(result)
      }
    }

    return NextResponse.json({ 
      message: "Settings updated successfully",
      updatedSettings 
    })
  } catch (error) {
    console.error("Error in PATCH /api/admin/settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}

// POST /api/admin/settings/reset - Reset settings to defaults
export async function POST(request: Request) {
  try {
    await dbConnect()
    
    // Delete all existing settings
    await SystemSettings.deleteMany({})
    
    // Insert default settings
    const defaultSettingsWithIds = DEFAULT_SETTINGS.map(setting => ({
      ...setting,
      _id: new Types.ObjectId(),
      updatedBy: new Types.ObjectId(), // You might want to get this from the admin session
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    
    await SystemSettings.insertMany(defaultSettingsWithIds)

    return NextResponse.json({ 
      message: "Settings reset successfully",
      settings: defaultSettingsWithIds 
    })
  } catch (error) {
    console.error("Error in POST /api/admin/settings:", error)
    return NextResponse.json(
      { error: "Failed to reset settings" },
      { status: 500 }
    )
  }
} 