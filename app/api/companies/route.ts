import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Company from "@/models/Company"
import { User } from "@/models/User"
import { authenticateUser, type AuthRequest } from "@/lib/auth"
import Job from "@/models/Job"

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
    const sort = searchParams.get("sort") || "-createdAt"

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    if (industry) {
      query.industry = industry
    }

    if (size) {
      query.size = size
    }

    // Get total count for pagination
    const total = await Company.countDocuments(query)

    // Get companies with pagination and sorting
    const companies = await Company.find(query)
      .populate({
        path: "owner",
        select: "name email",
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)

    // Get active job counts for each company
    const companiesWithJobs = await Promise.all(
      companies.map(async (company) => {
        const activeJobs = await Job.countDocuments({
          company: company._id,
          isActive: true,
        })
        return {
          ...company.toObject(),
          activeJobs,
        }
      })
    )

    // Format the response
    const formattedCompanies = companiesWithJobs.map((company) => ({
      id: company._id,
      name: company.name,
      logo: company.logo || "/placeholder.svg",
      website: company.website,
      industry: company.industry,
      size: company.size,
      description: company.description,
      location: company.location,
      foundedYear: company.foundedYear,
      activeJobs: company.activeJobs,
      postedBy: {
        id: company.owner?._id,
        name: company.owner?.name,
        email: company.owner?.email,
      },
    }))

    return NextResponse.json({
      success: true,
      companies: formattedCompanies,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Error fetching companies:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch companies",
      },
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

    return NextResponse.json({ company }, { status: 201 })
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
