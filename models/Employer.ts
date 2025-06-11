import mongoose, { Schema, Document, Model } from "mongoose"
import { IUser } from "./User"

export interface IEmployer extends Document {
  user: IUser["_id"]
  company: mongoose.Types.ObjectId
  position: string
  phone: string
  status: "active" | "suspended"
  createdAt: Date
  updatedAt: Date
}

const EmployerSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    position: {
      type: String,
      required: [true, "Please provide your position"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide your phone number"],
      trim: true,
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

// Prevent mongoose from creating a new model if it already exists
const Employer = (mongoose.models.Employer as Model<IEmployer>) || mongoose.model<IEmployer>("Employer", EmployerSchema)

export { Employer } 