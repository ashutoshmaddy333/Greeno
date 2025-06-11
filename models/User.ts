import mongoose, { Schema, Document, Model } from "mongoose"
import { hashPassword } from "@/lib/auth"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  role: "jobseeker" | "employer" | "admin"
  oauthProvider?: "google" | "facebook"
  oauthId?: string
  isEmailVerified: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: function(this: IUser) {
        return !this.oauthProvider
      },
      minlength: [6, "Password must be at least 6 characters"],
      validate: {
        validator: function(this: IUser, value: string) {
          if (this.oauthProvider) return true
          return value && value.length >= 6
        },
        message: "Password must be at least 6 characters when not using OAuth"
      }
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "admin"],
      default: "jobseeker",
      required: true,
    },
    oauthProvider: {
      type: String,
      enum: ["google", "facebook"],
    },
    oauthId: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Add index for OAuth lookups
UserSchema.index({ oauthProvider: 1, oauthId: 1 }, { unique: true, sparse: true })

// Hash password before saving only if it's provided and modified
UserSchema.pre("save", async function (this: IUser, next) {
  if (!this.isModified("password") || !this.password) {
    next()
    return
  }
  this.password = await hashPassword(this.password)
  next()
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Prevent mongoose from creating a new model if it already exists
const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema)

export { User }
