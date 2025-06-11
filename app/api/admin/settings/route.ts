import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Types, Collection } from "mongoose"

// Define the settings schema
interface Settings {
  _id: Types.ObjectId
  key: string
  value: string | boolean | number
  description: string
  updatedAt: Date
}

// Default settings
const DEFAULT_SETTINGS = [
  {
    key: "allowJobPosting",
    value: true,
    description: "Allow employers to post new jobs",
  },
  {
    key: "allowJobApplications",
    value: true,
    description: "Allow job seekers to apply for jobs",
  },
  {
    key: "requireEmailVerification",
    value: true,
    description: "Require email verification for new accounts",
  },
  {
    key: "maxJobsPerEmployer",
    value: 10,
    description: "Maximum number of active jobs per employer",
  },
  {
    key: "maxApplicationsPerJob",
    value: 100,
    description: "Maximum number of applications per job",
  },
  {
    key: "jobPostingFee",
    value: 0,
    description: "Fee for posting a job (in USD)",
  },
  {
    key: "maintenanceMode",
    value: false,
    description: "Enable maintenance mode",
  },
  {
    key: "maintenanceMessage",
    value: "The site is currently under maintenance. Please check back later.",
    description: "Message to display during maintenance mode",
  },
]

// GET /api/admin/settings - Get all settings
export async function GET() {
  try {
    await connectToDatabase()
    const db = (global as any).mongoose.connection.db
    const settingsCollection = db.collection("settings") as Collection<Settings>

    // Check if settings exist
    const existingSettings = await settingsCollection.find().toArray()

    // If no settings exist, initialize with defaults
    if (existingSettings.length === 0) {
      const settingsToInsert = DEFAULT_SETTINGS.map(setting => ({
        ...setting,
        _id: new Types.ObjectId(),
        updatedAt: new Date(),
      }))

      await settingsCollection.insertMany(settingsToInsert)
      return NextResponse.json({ settings: settingsToInsert })
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
    await connectToDatabase()
    const db = (global as any).mongoose.connection.db
    const settingsCollection = db.collection("settings") as Collection<Settings>
    const updates = await request.json()

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid request format. Expected an array of updates." },
        { status: 400 }
      )
    }

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { key: update.key },
        update: {
          $set: {
            value: update.value,
            updatedAt: new Date(),
          },
        },
      },
    }))

    const result = await settingsCollection.bulkWrite(bulkOps)

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "No settings were updated" },
        { status: 400 }
      )
    }

    const updatedSettings = await settingsCollection.find().toArray()
    return NextResponse.json({ settings: updatedSettings })
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
    await connectToDatabase()
    const db = (global as any).mongoose.connection.db
    const settingsCollection = db.collection("settings") as Collection<Settings>

    // Delete all existing settings
    await settingsCollection.deleteMany({})

    // Insert default settings
    const settingsToInsert = DEFAULT_SETTINGS.map(setting => ({
      ...setting,
      _id: new Types.ObjectId(),
      updatedAt: new Date(),
    }))

    await settingsCollection.insertMany(settingsToInsert)
    return NextResponse.json({ settings: settingsToInsert })
  } catch (error) {
    console.error("Error in POST /api/admin/settings:", error)
    return NextResponse.json(
      { error: "Failed to reset settings" },
      { status: 500 }
    )
  }
} 