import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { sign } from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received verification request:', body);
    const { email, otp, type } = body;

    // Validate required fields
    if (!email || !otp || !type) {
      console.log('Missing fields:', { email: !!email, otp: !!otp, type: !!type });
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'Please provide email, OTP, and verification type',
          received: { email, otp, type }
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return NextResponse.json(
        { 
          error: 'Invalid email format',
          received: email
        },
        { status: 400 }
      );
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      console.log('Invalid OTP format:', otp);
      return NextResponse.json(
        { 
          error: 'Invalid OTP format',
          received: otp
        },
        { status: 400 }
      );
    }

    // Validate type
    if (!['signup', 'forgot-password'].includes(type)) {
      console.log('Invalid verification type:', type);
      return NextResponse.json(
        { 
          error: 'Invalid verification type',
          received: type
        },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find user
    const user = await User.findOne({ email }).select('+role');
    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Found user:', { email: user.email, role: user.role });

    // For signup, check if already verified
    if (type === 'signup' && user.isVerified) {
      console.log('Email already verified:', email);
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Verify OTP
    console.log('Attempting to verify OTP:', { email, type });
    const isValid = await verifyOTP(email, otp, type);
    console.log('OTP verification result:', isValid);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    if (type === 'signup') {
      // Update user's verified status
      user.isVerified = true;
      user.isEmailVerified = true;
      await user.save();
      console.log('User verified successfully:', email);

      // Generate JWT token with all necessary user data
      const token = sign(
        { 
          userId: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          isVerified: true,
          isEmailVerified: true
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        message: 'Email verified successfully',
        role: user.role,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true,
          isEmailVerified: true
        }
      });
    } else {
      // For forgot password, generate a temporary token
      const token = sign(
        { 
          email: user.email,
          type: 'password-reset',
          userId: user._id,
          name: user.name,
          role: user.role
        },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );

      console.log('Sending forgot password response with role:', user.role);

      return NextResponse.json({
        message: 'OTP verified successfully',
        token,
        email: user.email,
        role: user.role,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { 
        error: 'Verification failed',
        details: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
} 