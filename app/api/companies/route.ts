import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Company from "@/models/Company"
import { User } from "@/models/User"
import { authenticateUser, type AuthRequest } from "@/lib/auth"
import Job from "@/models/Job"
import { ICompany } from "@/lib/actions"
import { Types } from "mongoose"

type CompanyWithId = Omit<ICompany, '_id'> & {
  _id: Types.ObjectId
  slug: string
}

// Get all companies
export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const industry = searchParams.get("industry") || ""
    const size = searchParams.get("size") || ""
    const location = searchParams.get("location") || ""
    const sort = searchParams.get("sort") || "-activeJobs"

    // Build query
    const query: any = {}

    // Add search condition
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { industry: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ]
    }

    // Add filter conditions
    if (industry) {
      query.industry = industry
    }
    if (size) {
      query.size = size
    }
    if (location) {
      query.location = { $regex: location, $options: "i" }
    }

    // Get total count for pagination
    const total = await Company.countDocuments(query)

    // Build sort object
    let sortObj: any = {}
    if (sort === "-activeJobs") {
      sortObj = { activeJobs: -1 }
    } else if (sort === "activeJobs") {
      sortObj = { activeJobs: 1 }
    } else if (sort === "name") {
      sortObj = { name: 1 }
    } else if (sort === "-name") {
      sortObj = { name: -1 }
    }

    // Fetch companies with pagination
    const companies = await Company.find(query, { owner: 0, jobs: 0 })
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean() as unknown as CompanyWithId[]

    console.log('Companies API - Raw companies from DB:', companies.map(c => ({
      _id: c._id.toString(),
      name: c.name,
      slug: c.slug
    })))

    // Get active jobs count for each company
    const companiesWithJobs = await Promise.all(
      companies.map(async (company) => {
        const activeJobs = await Job.countDocuments({
          company: company._id,
          isActive: true
        })

        // Ensure slug exists
        let slug = company.slug
        if (!slug) {
          slug = company.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "")
          
          // Update company with slug
          await Company.findByIdAndUpdate(company._id, { slug })
          console.log('Companies API - Updated company with slug:', { 
            id: company._id.toString(),
            name: company.name,
            slug 
          })
        }

        const formattedCompany = {
          ...company,
          _id: company._id.toString(),
          slug,
          activeJobs,
          logo: company.logo || "/placeholder.svg"
        }
        console.log('Companies API - Formatted company:', formattedCompany)
        return formattedCompany
      })
    )

    console.log('Companies API - Final companies response:', companiesWithJobs.map(c => ({
      _id: c._id,
      name: c.name,
      slug: c.slug
    })))

    return NextResponse.json({
      success: true,
      companies: companiesWithJobs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }, { status: 200 })
  } catch (error: any) {
    console.error("Error fetching companies:", error)
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred while fetching companies" },
      { status: 500 }
    )
  }
}

// Create a new company
export async function POST(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    // Check if user is an employer
    if (user.role !== "employer") {
      return NextResponse.json({ message: "Only employers can create companies" }, { status: 403 })
    }

    // Check if user already has a company
    const existingCompany = await Company.findOne({ owner: user._id })

    if (existingCompany) {
      return NextResponse.json({ message: "You already have a company profile" }, { status: 400 })
    }

    const companyData = await req.json()

    // Validate required fields
    if (
      !companyData.name ||
      !companyData.industry ||
      !companyData.size ||
      !companyData.location ||
      !companyData.description
    ) {
      return NextResponse.json({ message: "Please fill in all required fields" }, { status: 400 })
    }

    // Create company
    const company = await Company.create({
      ...companyData,
      owner: user._id,
      jobs: [],
    })

    // Update user with company reference
    await User.findByIdAndUpdate(user._id, { company: company._id })

    // Format company response
    const formattedCompany = {
      ...company.toObject(),
      _id: company._id.toString(),
      slug: company.slug,
      logo: company.logo || "/placeholder.svg"
    }

    console.log('Created company:', formattedCompany) // Debug log

    return NextResponse.json({ 
      success: true,
      company: formattedCompany 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Create company error:", error)

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json({ message: `Validation error: ${validationErrors.join(", ")}` }, { status: 400 })
    }

    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}
