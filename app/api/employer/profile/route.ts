import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Company from "@/models/Company"
import Job from "@/models/Job"
import { authenticateUser, type AuthRequest } from "@/lib/auth"

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

    const companyData = await req.json()

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
    const company = await Company.create({
      ...companyData,
      owner: user._id,
      jobs: [],
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
