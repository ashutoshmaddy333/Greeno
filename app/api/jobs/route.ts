import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Job from "@/models/Job"
import Company from "@/models/Company"
import { authenticateUser, type AuthRequest } from "@/lib/auth"
import { PipelineStage } from "mongoose"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { upload, getRelativePath, deleteOldLogo, handleMulterError } from "@/lib/multer"
import { NextApiRequest, NextApiResponse } from "next"

// Get all jobs with filtering
export async function GET(req: Request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const remote = searchParams.get("remote") === "true"
    const sortParam = searchParams.get("sort") || "-createdAt"
    const type = searchParams.get("type") || ""
    const category = searchParams.get("category") || ""
    const educationLevel = searchParams.get("educationLevel") || ""

    // Parse sort parameter
    let sortField = sortParam
    let sortDirection = -1 // Default to descending

    // Handle sort parameter format
    if (sortParam.startsWith("-")) {
      sortField = sortParam.slice(1)
      sortDirection = -1
    } else if (sortParam.endsWith(":1")) {
      sortField = sortParam.slice(0, -2)
      sortDirection = 1
    } else if (sortParam.endsWith(":-1")) {
      sortField = sortParam.slice(0, -3)
      sortDirection = -1
    }

    // Build base match stage
    const baseMatch: any = { isActive: true }

    // Add filters if specified
    if (remote) {
      baseMatch.remote = true
    }
    if (type) {
      baseMatch.employmentType = type.toLowerCase().replace(/\s+/g, "-")
    }
    if (category) {
      baseMatch.jobCategory = category.toLowerCase().replace(/\s+/g, "-")
    }
    if (educationLevel) {
      // Filter jobs based on education level
      const educationCategories = {
        "btech": [
          "software-engineer", "mechanical-engineer", "electrical-engineer",
          "civil-engineer", "electronics-engineer", "chemical-engineer",
          "aerospace-engineer", "robotics-engineer", "ai-ml-engineer",
          "data-engineer", "network-engineer", "embedded-systems-engineer",
          "biomedical-engineer", "environmental-engineer", "industrial-engineer"
        ],
        "12th": [
          "machine-operator", "quality-checker", "store-assistant",
          "production-assistant", "warehouse-assistant"
        ],
        "10th": [
          "peon-office-boy", "general-helper", "packaging-assistant",
          "loading-unloading-staff", "cleaning-housekeeping-staff"
        ],
        "iti": [
          "electrician", "fitter", "welder", "machinist",
          "maintenance-technician", "cnc-machine-operator",
          "tool-room-assistant", "mechanical-technician"
        ],
        "entry-level": [
          "store-keeper", "material-handler", "packing-supervisor",
          "inventory-assistant", "assembly-line-worker"
        ]
      }
      baseMatch.jobCategory = { $in: educationCategories[educationLevel as keyof typeof educationCategories] || [] }
    }

    // Create search conditions
    const searchConditions = search ? [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "companyInfo.name": { $regex: search, $options: "i" } }
    ] : []

    // Create aggregation pipeline
    const pipeline: PipelineStage[] = [
      // First stage: Lookup company information
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo"
        }
      } as PipelineStage,
      // Unwind the company array
      {
        $unwind: {
          path: "$companyInfo",
          preserveNullAndEmptyArrays: true
        }
      } as PipelineStage,
      // Match stage with search conditions
      {
        $match: searchConditions.length > 0
          ? { $or: searchConditions, ...baseMatch }
          : baseMatch
      } as PipelineStage,
      // Sort the results
      {
        $sort: {
          [sortField]: sortDirection
        }
      } as PipelineStage,
      // Add pagination
      {
        $skip: (page - 1) * limit
      } as PipelineStage,
      {
        $limit: limit
      } as PipelineStage,
      // Project only the fields we need
      {
        $project: {
          id: { $toString: "$_id" },
          title: 1,
          description: 1,
          location: 1,
          remote: 1,
          type: {
            $concat: [
              { $toUpper: { $substr: ["$employmentType", 0, 1] } },
              { $substr: ["$employmentType", 1, -1] }
            ]
          },
          category: 1,
          salary: {
            min: "$salary.min",
            max: "$salary.max"
          },
          createdAt: 1,
          experienceLevel: 1,
          skills: 1,
          benefits: 1,
          views: 1,
          totalApplications: { $size: "$applications" },
          company: {
            id: { $toString: "$companyInfo._id" },
            name: "$companyInfo.name",
            logo: "$companyInfo.logo",
            website: "$companyInfo.website",
            industry: "$companyInfo.industry",
            size: "$companyInfo.size"
          }
        }
      } as PipelineStage
    ]

    // Create count pipeline
    const countPipeline: PipelineStage[] = [
      // First stage: Lookup company information
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyInfo"
        }
      } as PipelineStage,
      // Unwind the company array
      {
        $unwind: {
          path: "$companyInfo",
          preserveNullAndEmptyArrays: true
        }
      } as PipelineStage,
      // Match stage with search conditions
      {
        $match: searchConditions.length > 0
          ? { $or: searchConditions, ...baseMatch }
          : baseMatch
      } as PipelineStage,
      // Count the documents
      {
        $count: "total"
      } as PipelineStage
    ]

    // Execute both pipelines
    const [jobs, countResult] = await Promise.all([
      Job.aggregate(pipeline),
      Job.aggregate(countPipeline)
    ])

    const total = countResult[0]?.total || 0

    // Format jobs for response
    const formattedJobs = jobs.map(job => ({
      id: job._id.toString(),
      title: job.title,
      location: job.remote ? "Remote" : job.location,
      type: job.employmentType,
      salary: formatSalary(job.salary?.min, job.salary?.max),
      posted: formatTimeAgo(new Date(job.createdAt)),
      applicants: job.applications?.length || 0,
      status: job.isActive ? "active" : "expired",
      category: getJobCategoryLabel(job.jobCategory) || "Uncategorized",
      views: job.views || 0,
      company: {
        name: job.company?.name || "Your Company",
        logo: job.company?.logo || "/placeholder.svg"
      },
      logo: job.company?.logo || "/placeholder.svg"
    }))

    return NextResponse.json({
      success: true,
      jobs: formattedJobs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    })
  } catch (error: any) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { message: error.message || "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

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

// Convert Next.js API route to Express middleware
const multerMiddleware = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise((resolve, reject) => {
    upload.single('logo')(req as any, res as any, (err: any) => {
      if (err) {
        reject(err)
      } else {
        resolve((req as any).file)
      }
    })
  })
}

// Create a new job
export async function POST(req: AuthRequest) {
  try {
    await dbConnect()

    // Authenticate user
    const user = await authenticateUser(req)

    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 })
    }

    if (user.role !== "employer") {
      return NextResponse.json({ message: "Only employers can post jobs" }, { status: 403 })
    }

    // Convert Request to NextApiRequest for multer
    const request = req as unknown as NextApiRequest
    const res = {} as NextApiResponse

    try {
      // Handle file upload with multer
      const file = await multerMiddleware(request, res) as Express.Multer.File | undefined
      
      // Get job data from form data
      const formData = await req.formData()
      const jobData = JSON.parse(formData.get("data") as string)

      // Find or create company
      let company = await Company.findOne({ owner: user._id })

      if (!company) {
        // Create a basic company profile if none exists
        company = await Company.create({
          name: jobData.company || "Default Company",
          owner: user._id,
          description: jobData.companyDescription || "Company description",
          website: jobData.companyWebsite || "",
          industry: jobData.companyIndustry || "Technology",
          size: jobData.companySize || "1-10 employees",
          location: jobData.location || "Remote",
          jobs: [],
        })
      }

      // Handle logo upload if provided
      if (file) {
        try {
          // Delete old logo if exists
          if (company.logo) {
            deleteOldLogo(company.logo)
          }
          
          // Update company with new logo path
          const logoPath = getRelativePath(file)
          company.logo = logoPath
          await company.save()

          console.log("Logo saved successfully:", {
            companyId: company._id,
            logoPath,
            fileSize: file.size,
            fileType: file.mimetype
          })
        } catch (error: any) {
          console.error("Error handling logo upload:", error)
          return NextResponse.json({ message: error.message }, { status: 400 })
        }
      }

      // Validate required fields
      const requiredFields = [
        "title",
        "company",
        "location",
        "type",
        "category",
        "salary",
        "description",
        "responsibilities",
        "requirements",
        "experienceLevel",
      ]
      const missingFields = requiredFields.filter((field) => !jobData[field] || jobData[field].trim() === "")

      if (missingFields.length > 0) {
        return NextResponse.json(
          {
            message: `Missing required fields: ${missingFields.join(", ")}`,
          },
          { status: 400 },
        )
      }

      // Parse salary range (now in lakhs)
      const salaryMatch = jobData.salary.match(/^₹?(\d+)L?\s*-\s*₹?(\d+)L?$/i)
      let salaryMin = 0,
        salaryMax = 0

      if (!salaryMatch) {
        return NextResponse.json(
          {
            message: "Invalid salary format. Please use format: ₹5L - ₹10L",
          },
          { status: 400 },
        )
      }

      salaryMin = Number.parseInt(salaryMatch[1]) * 100000 // Convert L to actual number
      salaryMax = Number.parseInt(salaryMatch[2]) * 100000 // Convert L to actual number

      if (salaryMin > salaryMax) {
        return NextResponse.json(
          {
            message: "Minimum salary cannot be greater than maximum salary",
          },
          { status: 400 },
        )
      }

      if (salaryMin < 0 || salaryMax < 0) {
        return NextResponse.json(
          {
            message: "Salary values cannot be negative",
          },
          { status: 400 },
        )
      }

      // Create job with updated salary
      const job = await Job.create({
        title: jobData.title,
        company: company._id,
        location: jobData.location,
        description: jobData.description,
        requirements: jobData.requirements.split("\n").filter((req: string) => req.trim()),
        responsibilities: jobData.responsibilities.split("\n").filter((resp: string) => resp.trim()),
        salary: {
          min: salaryMin,
          max: salaryMax,
          currency: "INR",
        },
        employmentType: jobData.type.toLowerCase().replace(/\s+/g, "-"),
        experienceLevel: jobData.experienceLevel.toLowerCase().replace(" level", ""),
        skills: jobData.skills
          ? jobData.skills
              .split(",")
              .map((skill: string) => skill.trim())
              .filter((skill: string) => skill)
          : [],
        benefits: jobData.benefits ? jobData.benefits.split("\n").filter((benefit: string) => benefit.trim()) : [],
        applicationDeadline: jobData.applicationDeadline
          ? new Date(jobData.applicationDeadline)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        views: 0,
        applications: [],
        postedBy: user._id,
        remote: jobData.isRemote,
        jobCategory: jobData.category.toLowerCase().replace(/\s+/g, "-"),
      })

      // Add job to company
      company.jobs.push(job._id)
      await company.save()

      // Populate company info for response
      await job.populate("company", "name logo website location industry")

      return NextResponse.json({
        success: true,
        job,
      })
    } catch (error: any) {
      // Handle multer errors
      if (error instanceof Error) {
        return NextResponse.json(
          { message: error.message },
          { status: 400 }
        )
      }
      throw error
    }
  } catch (error: any) {
    console.error("Post job error:", error)
    return NextResponse.json({ message: error.message || "Server error" }, { status: 500 })
  }
}

function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

function formatSalary(min: number, max: number) {
  // Handle invalid or missing salary values
  if (!min || !max || isNaN(min) || isNaN(max)) {
    return "Salary not specified"
  }
  
  // Convert to lakhs and round to nearest whole number
  const minLakhs = Math.round(min / 100000)
  const maxLakhs = Math.round(max / 100000)
  
  // Format the salary string
  return `₹${minLakhs}L - ₹${maxLakhs}L`
}
