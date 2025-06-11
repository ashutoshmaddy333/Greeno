import { NextResponse } from 'next/server';
import { storeOTP } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/email';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // For signup, verify that the user exists
    if (type === 'signup') {
      const user = await User.findOne({ email });
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      if (user.isVerified) {
        return NextResponse.json(
          { error: 'Email already verified' },
          { status: 400 }
        );
      }
    } else {
      // For forgot password, verify that the user exists
      const user = await User.findOne({ email });
      
      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email' },
          { status: 404 }
        );
      }
    }

    try {
      // Generate and store new OTP
      const otp = await storeOTP(email, type);
      
      // Send OTP email
      await sendOTPEmail(email, otp, type);

      return NextResponse.json({
        message: 'OTP sent successfully'
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 