import crypto from 'crypto';
import dbConnect from '@/lib/db';
import { OTP } from '@/models/OTP';

interface OTPData {
  otp: string;
  expiresAt: Date;
  type: 'signup' | 'forgot-password';
  email: string;
}

// In-memory store for OTPs (in production, use Redis or a database)
const otpStore = new Map<string, OTPData>();

export function generateOTP(): string {
  // Generate a 6-digit OTP
  return crypto.randomInt(100000, 999999).toString();
}

export async function storeOTP(email: string, type: 'signup' | 'forgot-password'): Promise<string> {
  await dbConnect();
  
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute expiry

  // Delete any existing OTP for this email and type
  await OTP.deleteMany({ email, type });

  // Store new OTP
  await OTP.create({
    email,
    otp,
    type,
    expiresAt
  });

  return otp;
}

export async function verifyOTP(email: string, otp: string, type: 'signup' | 'forgot-password'): Promise<boolean> {
  await dbConnect();

  const storedOTP = await OTP.findOne({
    email,
    type,
    otp,
    expiresAt: { $gt: new Date() }
  });

  if (!storedOTP) {
    return false;
  }

  // Delete the OTP after successful verification
  await OTP.deleteOne({ _id: storedOTP._id });
  return true;
}

export async function clearOTP(email: string): Promise<void> {
  await dbConnect();
  await OTP.deleteMany({ email });
}

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = new Date();
  Array.from(otpStore.entries()).forEach(([email, data]) => {
    if (data.expiresAt < now) {
      otpStore.delete(email);
    }
  });
}, 5 * 60 * 1000); // Clean up every 5 minutes 