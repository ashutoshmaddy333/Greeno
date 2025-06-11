import mongoose, { type Document, Schema } from "mongoose"

export interface IJob extends Document {
  title: string
  company: mongoose.Types.ObjectId
  location: string
  description: string
  requirements: string[]
  responsibilities: string[]
  remote: boolean
  salary: {
    min: number
    max: number
    currency: string
  }
  employmentType: "full-time" | "part-time" | "contract" | "internship" | "remote"
  experienceLevel: "entry" | "mid" | "senior" | "executive"
  jobCategory: 
    // For B.Tech
    | "software-engineer"
    | "mechanical-engineer"
    | "electrical-engineer"
    | "civil-engineer"
    | "electronics-engineer"
    | "chemical-engineer"
    | "aerospace-engineer"
    | "robotics-engineer"
    | "ai-ml-engineer"
    | "data-engineer"
    | "network-engineer"
    | "embedded-systems-engineer"
    | "biomedical-engineer"
    | "environmental-engineer"
    | "industrial-engineer"
    // For 10th Pass
    | "peon-office-boy"
    | "general-helper"
    | "packaging-assistant"
    | "loading-unloading-staff"
    | "cleaning-housekeeping-staff"
    // For 12th Pass
    | "machine-operator"
    | "quality-checker"
    | "store-assistant"
    | "production-assistant"
    | "warehouse-assistant"
    // For ITI Pass
    | "electrician"
    | "fitter"
    | "welder"
    | "machinist"
    | "maintenance-technician"
    | "cnc-machine-operator"
    | "tool-room-assistant"
    | "mechanical-technician"
    // Other Entry-Level / Support Roles
    | "store-keeper"
    | "material-handler"
    | "packing-supervisor"
    | "inventory-assistant"
    | "assembly-line-worker"
  skills: string[]
  benefits: string[]
  applicationDeadline: Date
  isActive: boolean
  views: number
  applications: mongoose.Types.ObjectId[]
  postedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a job title"],
      trim: true,
      maxlength: [100, "Job title cannot be more than 100 characters"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Please provide a company"],
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
    },
    description: {
      type: String,
      required: [true, "Please provide a job description"],
    },
    requirements: {
      type: [String],
      default: [],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    remote: {
      type: Boolean,
      default: false,
    },
    salary: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      default: "full-time",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "mid", "senior", "executive"],
      default: "mid",
    },
    jobCategory: {
      type: String,
      enum: [
        // For B.Tech
        "software-engineer",
        "mechanical-engineer",
        "electrical-engineer",
        "civil-engineer",
        "electronics-engineer",
        "chemical-engineer",
        "aerospace-engineer",
        "robotics-engineer",
        "ai-ml-engineer",
        "data-engineer",
        "network-engineer",
        "embedded-systems-engineer",
        "biomedical-engineer",
        "environmental-engineer",
        "industrial-engineer",
        // For 10th Pass
        "peon-office-boy",
        "general-helper",
        "packaging-assistant",
        "loading-unloading-staff",
        "cleaning-housekeeping-staff",
        // For 12th Pass
        "machine-operator",
        "quality-checker",
        "store-assistant",
        "production-assistant",
        "warehouse-assistant",
        // For ITI Pass
        "electrician",
        "fitter",
        "welder",
        "machinist",
        "maintenance-technician",
        "cnc-machine-operator",
        "tool-room-assistant",
        "mechanical-technician",
        // Other Entry-Level / Support Roles
        "store-keeper",
        "material-handler",
        "packing-supervisor",
        "inventory-assistant",
        "assembly-line-worker"
      ],
      required: [true, "Please provide a job category"],
    },
    skills: {
      type: [String],
      default: [],
    },
    applicationDeadline: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for search
JobSchema.index({ title: "text", description: "text", skills: "text" })

export default mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema)
