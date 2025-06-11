import mongoose, { Schema, Document } from "mongoose"

export interface IOTP extends Document {
  email: string
  otp: string
  type: 'signup' | 'forgot-password'
  expiresAt: Date
  createdAt: Date
}

const OTPSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['signup', 'forgot-password'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Create TTL index to automatically delete expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const OTP = mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema) 