import mongoose, { type Document, Schema } from "mongoose"

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId
  applicant: mongoose.Types.ObjectId
  // Personal Information
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phoneNumber: string
  // Professional Information
  experience: "fresher" | "experienced"
  yearsOfExperience?: number
  education: {
    degree: string
    field: string
    institution: string
    graduationYear: number
  }[]
  // Application Materials
  resumeFilename: string
  resumeOriginalName: string
  resumeMimeType: string
  resumeSize: number
  resumeUrl: string
  coverLetter: string
  // Status and Notes
  status: "pending" | "reviewing" | "shortlisted" | "rejected" | "hired"
  notes: string
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema: Schema = new Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Please provide a job"],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide an applicant"],
    },
    // Personal Information
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide your phone number"],
      trim: true,
    },
    // Professional Information
    experience: {
      type: String,
      enum: ["fresher", "experienced"],
      required: [true, "Please specify if you are a fresher or experienced"],
    },
    yearsOfExperience: {
      type: Number,
      min: [0, "Years of experience cannot be negative"],
      validate: {
        validator: function(this: IApplication, value: number) {
          if (this.experience === "experienced") {
            return value && value > 0
          }
          return true
        },
        message: "Years of experience is required for experienced candidates",
      },
    },
    education: [{
      degree: {
        type: String,
        required: [true, "Please provide your degree"],
        trim: true,
      },
      field: {
        type: String,
        required: [true, "Please provide your field of study"],
        trim: true,
      },
      institution: {
        type: String,
        required: [true, "Please provide your institution name"],
        trim: true,
      },
      graduationYear: {
        type: Number,
        required: [true, "Please provide your graduation year"],
        min: [1900, "Invalid graduation year"],
        max: [new Date().getFullYear() + 4, "Invalid graduation year"],
      },
    }],
    // Application Materials
    resumeFilename: {
      type: String,
      required: [true, "Resume filename is required"],
    },
    resumeOriginalName: {
      type: String,
      required: [true, "Original filename is required"],
    },
    resumeMimeType: {
      type: String,
      required: [true, "File type is required"],
      validate: {
        validator: function(value: string) {
          return value === 'application/pdf'
        },
        message: "Resume must be a PDF file",
      },
    },
    resumeSize: {
      type: Number,
      required: [true, "File size is required"],
      max: [5 * 1024 * 1024, "Resume file size must be less than 5MB"],
    },
    resumeUrl: {
      type: String,
      required: [true, "Resume URL is required"],
    },
    coverLetter: {
      type: String,
      default: "",
    },
    // Status and Notes
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

// Create indexes for better query performance
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true })
ApplicationSchema.index({ status: 1 })
ApplicationSchema.index({ createdAt: -1 })

// Delete the model if it exists to ensure we use the new schema
if (mongoose.models.Application) {
  delete mongoose.models.Application
}

export default mongoose.model<IApplication>("Application", ApplicationSchema)
