import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { sendOTPEmail } from '@/lib/email';
import { storeOTP } from '@/lib/otp';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const otp = await storeOTP(email, 'forgot-password');
    await sendOTPEmail(user.email, otp, 'forgot-password');

    return NextResponse.json(
      { message: 'Verification code sent to your email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password API error:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    const isMailConfig =
      message.includes('EMAIL_USER') || message.includes('Invalid login');
    return NextResponse.json(
      {
        error: isMailConfig
          ? 'Email could not be sent. Check EMAIL_USER / EMAIL_PASSWORD (e.g. Gmail app password).'
          : 'Failed to send verification code. Please try again.',
      },
      { status: 500 }
    );
  }
}
