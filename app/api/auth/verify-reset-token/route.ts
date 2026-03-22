import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

type ResetJwtPayload = {
  type?: string;
  userId?: string;
  email?: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing reset token' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Legacy: hex token stored on user (email link flow)
    const userByHex = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (userByHex) {
      return NextResponse.json(
        { message: 'Valid reset token', email: userByHex.email },
        { status: 200 }
      );
    }

    // OTP flow: short-lived JWT from /api/auth/verify-otp
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    try {
      const decoded = jwt.verify(token, secret) as ResetJwtPayload;
      if (decoded.type !== 'password-reset' || !decoded.userId) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }
      const user = await User.findById(decoded.userId);
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: 'Valid reset token', email: user.email },
        { status: 200 }
      );
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Verify reset token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
