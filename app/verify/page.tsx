'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { showToast } from '@/lib/toast';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds
  const [email, setEmail] = useState('');
  const [type, setType] = useState<'signup' | 'forgot-password'>('signup');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const typeParam = searchParams.get('type');
    
    if (!emailParam || !typeParam || !['signup', 'forgot-password'].includes(typeParam)) {
      showToast.error('Invalid verification link');
      router.push('/');
      return;
    }

    setEmail(emailParam);
    setType(typeParam as 'signup' | 'forgot-password');

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      showToast.error('Please enter a valid 6-digit code');
      return;
    }

    if (timeLeft === 0) {
      showToast.error('Verification code has expired. Please request a new one.');
      return;
    }

    setIsLoading(true);
    const loadingToast = showToast.loading('Verifying your code...');

    const requestData = { email, otp, type };
    console.log('Sending verification request:', requestData);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('Verification response:', { status: response.status, data });

      if (!response.ok) {
        showToast.dismiss(loadingToast);
        if (data.error === 'Invalid or expired OTP') {
          showToast.error('Invalid or expired verification code. Please try again or request a new one.');
        } else if (data.error === 'User not found') {
          showToast.error('Account not found. Please sign up first.');
          router.push('/signup');
        } else {
          showToast.error(data.error || 'Verification failed. Please try again.');
        }
        return;
      }

      showToast.dismiss(loadingToast);

      if (type === 'signup') {
        // Store the token in localStorage
        localStorage.setItem('token', data.token);
        
        // Show success message
        showToast.success('Email verified successfully! Redirecting to your profile...');

        // Redirect to profile page
        router.push('/profile');
      } else {
        showToast.success('Code verified. Set your new password.');
        const t = data.token as string | undefined;
        if (!t) {
          showToast.error('Missing reset session. Please try again.');
          return;
        }
        router.push(`/reset-password?token=${encodeURIComponent(t)}`);
      }
    } catch (error) {
      showToast.dismiss(loadingToast);
      showToast.error('An unexpected error occurred. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timeLeft > 0) {
      showToast.error(`Please wait ${formatTime(timeLeft)} before requesting a new code.`);
      return;
    }

    setIsLoading(true);
    const loadingToast = showToast.loading('Sending new verification code...');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast.dismiss(loadingToast);
        if (data.error === 'Email already verified') {
          showToast.error('This email is already verified. Please log in.');
          router.push('/login');
        } else if (data.error === 'User not found') {
          showToast.error('Account not found. Please sign up first.');
          router.push('/signup');
        } else {
          showToast.error(data.error || 'Failed to resend verification code. Please try again.');
        }
        return;
      }

      showToast.dismiss(loadingToast);
      showToast.success('A new verification code has been sent to your email');
      setTimeLeft(60); // Reset timer to 1 minute
      setOtp(''); // Clear OTP input
    } catch (error) {
      showToast.dismiss(loadingToast);
      showToast.error('Failed to resend verification code. Please try again.');
      console.error('Resend OTP error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container flex items-center justify-center min-h-screen px-2 sm:px-4 py-8 sm:py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {type === 'signup' ? 'Verify Your Email' : 'Reset Your Password'}
          </CardTitle>
          <CardDescription>
            {type === 'signup'
              ? 'Please enter the verification code sent to your email'
              : 'Please enter the code sent to your email to reset your password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                pattern="\d{6}"
                required
                className="text-center text-2xl tracking-widest"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground text-center">
                Time remaining: {formatTime(timeLeft)}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6 || timeLeft === 0}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="link"
                onClick={handleResendOTP}
                disabled={isLoading || timeLeft > 0}
              >
                Resend Code {timeLeft > 0 && `(${formatTime(timeLeft)})`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 