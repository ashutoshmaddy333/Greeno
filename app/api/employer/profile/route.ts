import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Company from "@/models/Company"
import Job from "@/models/Job"
import { authenticateUser, type AuthRequest } from "@/lib/auth"
import path from "path"
import fs from "fs/promises"
import { writeFile } from "fs/promises"

export async function GET(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    if (user.role !== "employer") {
      return NextResponse.json({ message: "Only employers can access this endpoint" }, { status: 403 })
    }

    // Find company owned by this user
    const company = await Company.findOne({ owner: user._id }).populate("jobs")

    if (!company) {
      return NextResponse.json({ message: "No company profile found" }, { status: 404 })
    }

    // Get stats
    const totalJobs = await Job.countDocuments({ company: company._id })
    const activeJobs = await Job.countDocuments({ company: company._id, isActive: true })
    const totalApplications = await Job.aggregate([
      { $match: { company: company._id } },
      { $project: { applicationCount: { $size: "$applications" } } },
      { $group: { _id: null, total: { $sum: "$applicationCount" } } },
    ])

    const stats = {
      activeJobs,
      totalJobs,
      totalApplications: totalApplications[0]?.total || 0,
      viewsToday: 0, // TODO: Implement view tracking
    }

    return NextResponse.json({
      company,
      stats,
    })
  } catch (error: any) {
    console.error("Get employer profile error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

export async function POST(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 })
    }

    if (user.role !== "employer") {
      return NextResponse.json({ success: false, message: "Only employers can create company profiles" }, { status: 403 })
    }

    // Check if user already has a company
    const existingCompany = await Company.findOne({ owner: user._id })

    if (existingCompany) {
      return NextResponse.json({ success: false, message: "You already have a company profile" }, { status: 400 })
    }

    // Parse the form data
    const formData = await req.formData()
    
    // Extract company data
    const data = formData.get('data') as string
    const companyData = JSON.parse(data)
    
    // Handle logo file
    const logoFile = formData.get('logo') as File | null
    let logoPath = ""
    
    if (logoFile && logoFile.size > 0) {
      console.log("Processing logo file:", {
        name: logoFile.name,
        type: logoFile.type,
        size: logoFile.size
      })

      // Validate file size (5MB limit)
      if (logoFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ 
          success: false, 
          message: "Logo file size must be less than 5MB" 
        }, { status: 400 })
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(logoFile.type)) {
        return NextResponse.json({ 
          success: false, 
          message: "Logo must be a valid image file (JPEG, PNG, GIF, or WebP)" 
        }, { status: 400 })
      }

      try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), "public/uploads")
        await fs.mkdir(uploadsDir, { recursive: true })

        // Generate unique filename
        const timestamp = Date.now()
        const fileExtension = logoFile.name.split('.').pop()?.toLowerCase() || 'jpg'
        const filename = `logo_${timestamp}.${fileExtension}`
        const filepath = path.join(uploadsDir, filename)

        console.log("Saving logo file to:", filepath)

        // Convert file to buffer and save
        const bytes = await logoFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filepath, buffer)
        
        // Verify file was saved
        const fileExists = await fs.access(filepath).then(() => true).catch(() => false)
        if (!fileExists) {
          throw new Error("Failed to save logo file")
        }
        
        logoPath = `/uploads/${filename}`
        console.log("Logo saved successfully:", logoPath)
      } catch (error) {
        console.error("Error saving logo file:", error)
        return NextResponse.json({ 
          success: false, 
          message: "Failed to save logo file. Please try again." 
        }, { status: 500 })
      }
    }

    // Validate required fields
    const requiredFields = ['name', 'description', 'industry', 'location']
    const missingFields = requiredFields.filter(field => !companyData[field] || companyData[field].trim() === '')

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }

    // Validate company size if provided
    if (companyData.size && ![
      "1-10 employees",
      "11-50 employees",
      "51-200 employees",
      "201-500 employees",
      "501-1000 employees",
      "1001-5000 employees",
      "5000+ employees"
    ].includes(companyData.size)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid company size" 
      }, { status: 400 })
    }

    // Create company
    const companyDataToSave = {
      ...companyData,
      owner: user._id,
      jobs: [],
    }

    // Add logo path if available
    if (logoPath) {
      companyDataToSave.logo = logoPath
    }

    console.log("Creating company with data:", companyDataToSave)

    const company = await Company.create(companyDataToSave)

    console.log("Company created successfully:", {
      _id: company._id,
      name: company.name,
      logo: company.logo
    })

    return NextResponse.json({
      success: true,
      company,
    }, { status: 201 })
  } catch (error: any) {
    console.error("Create company profile error:", error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ 
        success: false, 
        message: `Validation error: ${validationErrors.join(', ')}` 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false, 
      message: error.message || "An error occurred while creating company profile" 
    }, { status: 500 })
  }
}
