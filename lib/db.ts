import mongoose from "mongoose"
import bcryptjs from "bcryptjs"
import { User } from "@/models/User"
import JobSeeker from "@/models/JobSeeker"
import { Employer } from "@/models/Employer"
import Company from "@/models/Company"
import Job from "@/models/Job"
import Application from "@/models/Application"
import type { IJob } from "@/models/Job"
import type { ICompany } from "@/models/Company"
import type { IUser } from "@/models/User"
import type { IJobSeeker } from "@/models/JobSeeker"
import type { IEmployer } from "@/models/Employer"
import type { IApplication } from "@/models/Application"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache
}

// Initialize cache if it doesn't exist
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null }
}

const cached: MongooseCache = global.mongoose

// Admin credentials - hardcoded for development
export const ADMIN_CREDENTIALS = {
  email: "admin@jobconnect.com",
  password: "Admin@123", // This will be hashed before saving
  role: "admin",
  name: "Admin User"
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
  }

  try {
    const conn = await cached.promise
    if (!conn) throw new Error("Failed to establish database connection")
    cached.conn = conn

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ email: ADMIN_CREDENTIALS.email })
    if (!adminExists) {
      const hashedPassword = await bcryptjs.hash(ADMIN_CREDENTIALS.password, 10)
      await User.create({
        name: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        password: hashedPassword,
        role: ADMIN_CREDENTIALS.role,
        isVerified: true,
        isEmailVerified: true
      })
      console.log("Admin user created successfully")
    }

    return conn
  } catch (e) {
    cached.promise = null
    throw e
  }
}

// Admin dashboard statistics types
export interface AdminStats {
  totalUsers: number
  totalJobSeekers: number
  totalEmployers: number
  totalJobs: number
  totalCompanies: number
  activeJobs: number
  pendingApplications: number
  recentSignups: {
    jobSeekers: any[]
    employers: any[]
  }
  recentJobs: any[]
  recentApplications: any[]
}

interface PopulatedJobSeeker extends Omit<IJobSeeker, 'user'> {
  user: Pick<IUser, 'name' | 'email'>
}

interface PopulatedEmployer extends Omit<IEmployer, 'user' | 'company'> {
  user: Pick<IUser, 'name' | 'email'>
  company: Pick<ICompany, 'name'>
}

interface PopulatedJob extends Omit<IJob, 'company' | 'postedBy'> {
  company: Pick<ICompany, 'name'>
  postedBy: Pick<IUser, 'name'>
}

interface PopulatedApplication extends Omit<IApplication, 'job' | 'applicant'> {
  job: Pick<IJob, 'title'> & { company: Pick<ICompany, 'name'> }
  applicant: Pick<IUser, 'name' | 'email'>
}

interface LeanDocument {
  _id: mongoose.Types.ObjectId
  createdAt: Date
  [key: string]: any
}

// Admin dashboard data fetching functions
export async function getAdminStats(): Promise<AdminStats> {
  await dbConnect()

  const [
    totalUsers,
    totalJobSeekers,
    totalEmployers,
    totalJobs,
    totalCompanies,
    activeJobs,
    pendingApplications,
    recentJobSeekers,
    recentEmployers,
    recentJobs,
    recentApplications,
  ] = await Promise.all([
    User.countDocuments(),
    JobSeeker.countDocuments(),
    Employer.countDocuments(),
    Job.countDocuments(),
    Company.countDocuments(),
    Job.countDocuments({ isActive: true }),
    Application.countDocuments({ status: "pending" }),
    JobSeeker.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean<LeanDocument[]>(),
    Employer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("company", "name")
      .lean<LeanDocument[]>(),
    Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("company", "name")
      .populate("postedBy", "name")
      .lean<LeanDocument[]>(),
    Application.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "job",
        select: "title",
        populate: {
          path: "company",
          select: "name"
        }
      })
      .populate("applicant", "name email")
      .lean<LeanDocument[]>(),
  ])

  return {
    totalUsers,
    totalJobSeekers,
    totalEmployers,
    totalJobs,
    totalCompanies,
    activeJobs,
    pendingApplications,
    recentSignups: {
      jobSeekers: recentJobSeekers.map(seeker => ({
        id: seeker._id.toString(),
        name: seeker.user?.name || "Unknown",
        email: seeker.user?.email || "No email",
        location: seeker.location || "No location",
        createdAt: seeker.createdAt,
      })),
      employers: recentEmployers.map(employer => ({
        id: employer._id.toString(),
        name: employer.user?.name || "Unknown",
        email: employer.user?.email || "No email",
        company: employer.company?.name || "No company",
        position: employer.position || "No position",
        createdAt: employer.createdAt,
      })),
    },
    recentJobs: recentJobs.map(job => ({
      id: job._id.toString(),
      title: job.title,
      company: job.company?.name || "Unknown company",
      location: job.remote ? "Remote" : job.location,
      type: job.employmentType,
      status: job.isActive ? "active" : "inactive",
      postedBy: job.postedBy?.name || "Unknown",
      createdAt: job.createdAt,
    })),
    recentApplications: recentApplications.map(app => ({
      id: app._id.toString(),
      jobTitle: app.job?.title || "Unknown job",
      company: app.job?.company?.name || "Unknown company",
      applicant: app.applicant?.name || "Unknown applicant",
      status: app.status,
      createdAt: app.createdAt,
    })),
  }
}

// Export models
export { User, JobSeeker, Employer }
export type { IJob as Job, ICompany as Company }

export default dbConnect
