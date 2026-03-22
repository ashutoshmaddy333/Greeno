"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { showToast } from "@/lib/toast"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      showToast.error("Invalid reset link")
      router.push("/forgot-password")
      return
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`)
        const data = await response.json()

        if (response.ok) {
          setIsValidToken(true)
          setEmail(data.email)
        } else {
          showToast.error("Invalid or expired reset token")
          router.push("/forgot-password")
        }
      } catch (error) {
        console.error("Token verification error:", error)
        showToast.error("Failed to verify reset token")
        router.push("/forgot-password")
      }
    }

    verifyToken()
  }, [token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      showToast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      showToast.error("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    const loadingToast = showToast.loading("Updating password...")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        showToast.dismiss(loadingToast)
        showToast.error(data.error || "Failed to reset password")
        return
      }

      showToast.dismiss(loadingToast)
      showToast.success("Password updated successfully!")
      setIsSubmitted(true)
    } catch (error) {
      showToast.dismiss(loadingToast)
      showToast.error("Failed to reset password. Please try again.")
      console.error("Reset password error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-2 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Verifying Reset Token</CardTitle>
              <CardDescription>Please wait while we verify your reset token...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-2 sm:px-4 py-8 sm:py-12">
      <div className="grid w-full gap-6 sm:gap-8 md:grid-cols-2 lg:gap-12">
        <div className="flex flex-col justify-center space-y-4 fade-in">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter">Reset Your Password</h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Enter your new password below to complete the reset process.
            </p>
          </div>
          <div className="flex h-40 sm:h-60 md:h-[300px] items-center justify-center rounded-lg bg-muted">
            <img
              src="/1.jpg?height=300&width=400"
              alt="Login illustration"
              className="h-full w-full rounded-lg object-cover"
            />
          </div>
        </div>
        <div className="flex items-center justify-center slide-up">
          <Card className="w-full max-w-md hover-glow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
              <CardDescription>
                {isSubmitted
                  ? "Your password has been updated successfully"
                  : "Enter your new password and confirm it"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Password Updated!</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your password has been successfully updated. You can now log in with your new password.
                    </p>
                    <Link href="/login">
                      <Button className="mt-4 w-full">Go to Login</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-9 pr-9"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full button-hover" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-muted"></div>
              </div>
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push("/login")
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
