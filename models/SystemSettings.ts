import mongoose, { Schema, Document } from "mongoose"

export interface ISystemSettings extends Document {
  key: string
  value: any
  description: string
  category: "general" | "email" | "job" | "security" | "notification"
  type: "string" | "number" | "boolean" | "json" | "array"
  isPublic: boolean
  updatedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const SystemSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["general", "email", "job", "security", "notification"],
      required: true,
    },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "json", "array"],
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// key already has unique: true (unique index). category lookups:
SystemSettingsSchema.index({ category: 1 })

const SystemSettings = mongoose.models.SystemSettings || mongoose.model<ISystemSettings>("SystemSettings", SystemSettingsSchema)

export { SystemSettings } 