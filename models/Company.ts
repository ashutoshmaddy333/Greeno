import mongoose, { type Document, Schema } from "mongoose"

export interface ICompany extends Document {
  name: string
  website: string
  description: string
  industry: string
  size:
    | "1-10 employees"
    | "11-50 employees"
    | "51-200 employees"
    | "201-500 employees"
    | "501-1000 employees"
    | "1001-5000 employees"
    | "5000+ employees"
  location: string
  foundedYear: number
  owner: mongoose.Types.ObjectId
  jobs: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const CompanySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a company name"],
      trim: true,
      maxlength: [100, "Company name cannot be more than 100 characters"],
    },
    website: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Please provide a company description"],
    },
    industry: {
      type: String,
      required: [true, "Please provide an industry"],
    },
    size: {
      type: String,
      enum: [
        "1-10 employees",
        "11-50 employees",
        "51-200 employees",
        "201-500 employees",
        "501-1000 employees",
        "1001-5000 employees",
        "5000+ employees",
      ],
      default: "1-10 employees",
    },
    location: {
      type: String,
      required: [true, "Please provide a location"],
    },
    foundedYear: {
      type: Number,
      default: new Date().getFullYear(),
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide an owner"],
    },
    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Create indexes for search
CompanySchema.index({ name: "text", description: "text", industry: "text" })

export default mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema)
