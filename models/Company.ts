import mongoose, { type Document, Schema } from "mongoose"

export interface ICompany extends Document {
  name: string
  slug: string
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
  logo?: string
}

const CompanySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a company name"],
      trim: true,
      maxlength: [100, "Company name cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
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
    logo: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for search
CompanySchema.index({ name: "text", description: "text", industry: "text" })

// Generate slug before saving
CompanySchema.pre("save", function(this: ICompany, next) {
  if (!this.isModified("name")) return next()
  
  // Generate slug from name
  const originalName = this.name
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
  
  console.log('Generated slug on save:', { originalName, slug: this.slug })
  next()
})

// Generate slug before updating
CompanySchema.pre("findOneAndUpdate", function(this: mongoose.Query<any, any>, next: () => void) {
  const update = this.getUpdate() as { $set?: { name?: string } }
  if (update.$set?.name) {
    const slug = update.$set.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    
    console.log('Generated slug on update:', { 
      originalName: update.$set.name, 
      slug 
    })
    
    this.set({ slug })
  }
  next()
})

// Generate slug before updating by ID
CompanySchema.pre(/^find/, function(this: mongoose.Query<any, any>, next: () => void) {
  const update = this.getUpdate() as { $set?: { name?: string; slug?: string } } | undefined
  if (update && typeof update === 'object' && update.$set?.name) {
    const slug = update.$set.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    update.$set.slug = slug
  }
  next()
})

export default mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema)
