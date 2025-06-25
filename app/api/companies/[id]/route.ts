import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Company, { ICompany } from "@/models/Company"
import Job from "@/models/Job"
import { authenticateUser, type AuthRequest } from "@/lib/auth"
import type { IJob } from "@/models/Job"
import type { Types } from "mongoose"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

interface CompanyDocument extends Omit<ICompany, 'owner'> {
  _id: Types.ObjectId
  logo?: string
  owner?: {
    _id: Types.ObjectId
    name: string
    email: string
  }
}

interface JobDocument extends Omit<IJob, 'company' | 'postedBy'> {
  _id: Types.ObjectId
  company: Types.ObjectId
  postedBy: Types.ObjectId
  educationLevel?: string
}

interface CompanyListItem {
  _id: Types.ObjectId
  name: string
  slug?: string
}

// Ensure upload directories exist
function ensureUploadDirectories() {
  const directories = [
    path.join(process.cwd(), "public", "uploads", "profile"),
    path.join(process.cwd(), "public", "uploads", "logos")
  ]

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

// Call this when the module is loaded
ensureUploadDirectories()

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await context.params
    console.log('Company API - Looking up company with id/slug:', id)

    // Try to find company by slug first
    let company = await Company.findOne({ slug: id })
      .populate("owner", "name email")
      .lean() as unknown as CompanyDocument

    console.log('Company API - Company lookup by slug result:', {
      found: !!company,
      id: company?._id?.toString(),
      name: company?.name,
      slug: company?.slug,
      rawLogo: company?.logo,
      isHttp: company?.logo?.startsWith('http'),
      isUploads: company?.logo?.startsWith('/uploads'),
      isPlaceholder: !company?.logo
    })

    // If not found by slug, try to find by ID only if it looks like a valid ObjectId
    if (!company && /^[0-9a-fA-F]{24}$/.test(id)) {
      console.log('Company API - Trying to find by ID:', id)
      company = await Company.findById(id)
        .populate("owner", "name email")
        .lean() as unknown as CompanyDocument
      
      console.log('Company API - Company lookup by ID result:', {
        found: !!company,
        id: company?._id?.toString(),
        name: company?.name,
        slug: company?.slug,
        rawLogo: company?.logo,
        isHttp: company?.logo?.startsWith('http'),
        isUploads: company?.logo?.startsWith('/uploads'),
        isPlaceholder: !company?.logo
      })
    }

    if (!company) {
      // Log all companies to help debug
      const allCompanies = await Company.find({}, { _id: 1, name: 1, slug: 1, logo: 1 }).lean()
      console.log('Company API - All companies in DB:', allCompanies.map((c: any) => ({
        _id: c._id.toString(),
        name: c.name,
        slug: c.slug,
        logo: c.logo,
        isHttp: c.logo?.startsWith('http'),
        isUploads: c.logo?.startsWith('/uploads'),
        isPlaceholder: !c.logo
      })))
      
      console.log('Company API - Company not found for id/slug:', id)
      return NextResponse.json(
        {
          success: false,
          message: "Company not found",
        },
        { status: 404 }
      )
    }

    // If company was found by ID but has no slug, generate one
    if (!company.slug) {
      console.log('Company API - Generating slug for company:', {
        _id: company._id.toString(),
        name: company.name,
        logo: company.logo
      })
      const updatedCompany = await Company.findByIdAndUpdate(
        company._id,
        {
          $set: {
            slug: company.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
          }
        },
        { new: true }
      ).populate("owner", "name email").lean() as unknown as CompanyDocument

      if (updatedCompany) {
        console.log('Company API - Updated company with slug:', {
          _id: updatedCompany._id.toString(),
          name: updatedCompany.name,
          slug: updatedCompany.slug,
          logo: updatedCompany.logo
        })
        company = updatedCompany
      }
    }

    // Fetch active jobs for this company
    const jobs = await Job.find({ company: company._id, isActive: true })
      .sort({ createdAt: -1 })
      .lean() as unknown as JobDocument[]

    const formattedCompany = {
      id: company._id.toString(),
      name: company.name,
      slug: company.slug,
      logo: company.logo || "/placeholder.svg",
      website: company.website,
      industry: company.industry,
      size: company.size,
      location: company.location,
      description: company.description,
      foundedYear: company.foundedYear,
      activeJobs: jobs.length,
      postedBy: {
        id: company.owner?._id.toString(),
        name: company.owner?.name,
        email: company.owner?.email,
      },
    }

    console.log('Company API - Formatted company data:', {
      companyId: company._id.toString(),
      companyName: company.name,
      rawLogo: company.logo,
      formattedLogo: formattedCompany.logo,
      isHttp: company.logo?.startsWith('http'),
      isUploads: company.logo?.startsWith('/uploads'),
      isPlaceholder: !company.logo,
      finalUrl: company.logo?.startsWith('http') ? company.logo : 
                company.logo?.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}${company.logo}` : 
                company.logo || "/placeholder.svg",
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL
    })

    return NextResponse.json({
      success: true,
      company: formattedCompany,
      jobs: jobs.map((job) => ({
        id: job._id.toString(),
        title: job.title,
        type: job.employmentType,
        location: job.remote ? "Remote" : job.location,
        salary: `₹${Math.round(job.salary.min / 100000)}L - ₹${Math.round(job.salary.max / 100000)}L`,
        posted: new Date(job.createdAt).toLocaleDateString(),
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        skills: job.skills,
        remote: job.remote,
        experienceLevel: job.experienceLevel,
        educationLevel: job.educationLevel,
        applicationDeadline: new Date(job.applicationDeadline).toLocaleDateString(),
        views: job.views,
        totalApplications: job.applications?.length || 0,
      }))
    })
  } catch (error: any) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch company details",
      },
      { status: 500 }
    )
  }
}

// Update company
export async function PUT(
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
        { message: "Only employers can update company profiles" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, website, size, industry, description, location, foundedYear } = body

    // Validate company size if provided
    const validSizes = [
      "1-10 employees",
      "11-50 employees",
      "51-200 employees",
      "201-500 employees",
      "501-1000 employees",
      "1001-5000 employees",
      "5000+ employees"
    ] as const

    if (size && !validSizes.includes(size as typeof validSizes[number])) {
      return NextResponse.json(
        { 
          message: "Invalid company size. Must be one of: " + validSizes.join(", "),
          validSizes 
        },
        { status: 400 }
      )
    }

    const updateData: Partial<ICompany> = {}
    if (name) updateData.name = name
    if (website) updateData.website = website
    if (size) updateData.size = size as typeof validSizes[number]
    if (industry) updateData.industry = industry
    if (description) updateData.description = description
    if (location) updateData.location = location
    if (foundedYear) updateData.foundedYear = foundedYear

    // Find and update company (only if user owns it)
    const company = await Company.findOneAndUpdate(
      { _id: id, owner: user._id },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!company) {
      return NextResponse.json(
        { message: "Company not found or you don't have permission to update it" },
        { status: 404 }
      )
    }

    return NextResponse.json({ company })
  } catch (error: any) {
    console.error("Update company error:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}

// Delete company
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect()
    const { id } = await context.params
    const user = await authenticateUser(request as AuthRequest)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    // Find and delete company (only if user owns it)
    const company = await Company.findOneAndDelete({ _id: id, owner: user._id })

    if (!company) {
      return NextResponse.json(
        { message: "Company not found or not authorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Company deleted successfully" })
  } catch (error: any) {
    console.error("Delete company error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

export async function POST(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    const newCompany = await Company.create(await req.json())

    return NextResponse.json({ company: newCompany })
  } catch (error: any) {
    console.error("Create company error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

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

// Update company details
export async function PATCH(
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
        { message: "Only employers can update company details" },
        { status: 403 }
      )
    }

    // Get the content type from the request
    const contentType = request.headers.get("content-type") || ""
    
    // Handle JSON data for company details update
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { message: "Content type must be application/json" },
        { status: 400 }
      )
    }

    // Parse the JSON body
    const companyData = await request.json()

    // Find company (only if user owns it)
    const company = await Company.findOne({ _id: id, owner: user._id })

    if (!company) {
      return NextResponse.json(
        { message: "Company not found or unauthorized" },
        { status: 404 }
      )
    }

    // Update company fields
    const allowedFields = [
      "name",
      "description",
      "industry",
      "website",
      "location",
      "size",
      "founded",
      "logo"
    ]

    // Only update allowed fields
    for (const field of allowedFields) {
      if (field in companyData) {
        company[field] = companyData[field]
      }
    }

    // Save the updated company
    await company.save()

    console.log("Company details updated successfully:", {
      companyId: company._id,
      updatedFields: Object.keys(companyData)
    })

    return NextResponse.json({ 
      success: true,
      company,
      message: "Company details updated successfully" 
    })
  } catch (error: any) {
    console.error("Update company details error:", error)
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    )
  }
}
