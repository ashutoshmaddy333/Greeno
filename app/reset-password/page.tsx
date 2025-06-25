'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { verify } from 'jsonwebtoken';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect');

    if (!emailParam || !token) {
      router.push('/');
      return;
    }

    try {
      // Verify the token
      verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!);
      setEmail(emailParam);
      setIsValidToken(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid or expired reset token. Please request a new password reset.',
        variant: 'destructive',
      });
      router.push('/forgot-password');
    }
  }, [searchParams, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      toast({
        title: 'Success',
        description: 'Password reset successfully. Please login with your new password.',
      });

      // Get redirect URL from query params or default to login
      const redirect = searchParams.get('redirect') || '/login';
      
      // Add a small delay to show the success message before redirecting
      setTimeout(() => {
        router.push(redirect);
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return null;
  }

  return (
    <div className="container flex items-center justify-center min-h-screen px-2 sm:px-4 py-8 sm:py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Please enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 