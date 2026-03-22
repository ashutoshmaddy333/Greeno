import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import { SystemSettings } from "@/models/SystemSettings"

// GET /api/settings - Get public settings
export async function GET() {
  try {
    await dbConnect()
    
    // Get all public settings
    const settings = await SystemSettings.find({ isPublic: true })
    
    // Convert to key-value pairs for easier consumption
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({ 
      settings: settingsMap,
      success: true 
    })
  } catch (error) {
    console.error("Error in GET /api/settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings", success: false },
      { status: 500 }
    )
  }
} 