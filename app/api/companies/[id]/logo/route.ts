import { NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"
import { AuthRequest } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Company from "@/models/Company"
import { getRelativePath, deleteOldLogo } from "@/lib/multer"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// Helper function to save logo file
async function saveLogoFile(file: File): Promise<string> {
  try {
    // Validate file type
    const acceptedTypes = ["image/jpeg", "image/png", "image/svg+xml"]
    if (!acceptedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, and SVG files are allowed for logos")
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("Logo file size must be less than 2MB")
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const uniqueSuffix = uuidv4()
    const filename = `logo-${uniqueSuffix}${path.extname(file.name)}`
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos")
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, filename)
    
    // Save the file
    fs.writeFileSync(filePath, buffer)
    
    return `/uploads/logos/${filename}`
  } catch (error) {
    console.error("Error saving logo file:", error)
    throw error
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await context.params
    const user = await authenticateUser(request as AuthRequest)

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    if (user.role !== "employer") {
      return NextResponse.json(
        { message: "Only employers can update company logos" },
        { status: 403 }
      )
    }

    try {
      // Get the form data from the request
      const formData = await request.formData()
      const file = formData.get("logo") as File | null

      if (!file) {
        return NextResponse.json(
          { message: "No valid logo file provided" },
          { status: 400 }
        )
      }

      // Find company (only if user owns it)
      const company = await Company.findOne({ _id: id, owner: user._id })

      if (!company) {
        return NextResponse.json(
          { message: "Company not found or unauthorized" },
          { status: 404 }
        )
      }

      // Delete old logo if exists
      if (company.logo) {
        deleteOldLogo(company.logo)
      }

      // Save the new logo file
      const logoPath = await saveLogoFile(file)
      company.logo = logoPath
      await company.save()

      console.log("Logo updated successfully:", {
        companyId: company._id,
        logoPath,
        fileSize: file.size,
        fileType: file.type
      })

      return NextResponse.json({ 
        success: true,
        company,
        message: "Company logo updated successfully" 
      })
    } catch (error: any) {
      console.error("Error handling logo upload:", error)
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error("Update company logo error:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
} 