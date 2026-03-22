import mongoose, { type Document } from "mongoose"

export interface IJobSeeker extends Document {
  user: mongoose.Types.ObjectId
  profilePicture: string | null
  headline: string
  bio: string
  location: string
  phone: string
  skills: string[]
  education: Array<{
    institution: string
    degree: string
    field: string
    startDate: Date
    endDate: Date
    graduationYear: number
    description: string
  }>
  experience: Array<{
    company: string
    position: string
    startDate: Date
    endDate: Date
    description: string
    current: boolean
  }>
  savedJobs: mongoose.Types.ObjectId[]
  appliedJobs: Array<{
    job: mongoose.Types.ObjectId
    status: "applied" | "reviewing" | "shortlisted" | "rejected"
    appliedAt: Date
  }>
  resume: string | null
  socialLinks: {
    linkedin?: string
    github?: string
    portfolio?: string
  }
  status: "active" | "suspended"
  createdAt: Date
  updatedAt: Date
}

const jobSeekerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    headline: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    education: [{
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      graduationYear: Number,
      description: String,
    }],
    experience: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      description: String,
      current: Boolean,
    }],
    savedJobs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    }],
    appliedJobs: [{
      job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
      status: {
        type: String,
        enum: ["applied", "reviewing", "shortlisted", "rejected"],
        default: "applied",
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    resume: {
      type: String,
      default: null,
    },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
)

// Remove the duplicate index and keep only the other indexes
jobSeekerSchema.index({ "savedJobs": 1 })
jobSeekerSchema.index({ "appliedJobs.job": 1 })

export default mongoose.models.JobSeeker || mongoose.model<IJobSeeker>("JobSeeker", jobSeekerSchema) 