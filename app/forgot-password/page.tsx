"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, MailIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const loadingToast = showToast.loading("Sending verification code...")

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "forgot-password" }),
      })

      const data = await response.json()

      if (!response.ok) {
        showToast.dismiss(loadingToast)
        if (data.error === "User not found") {
          showToast.error("No account found with this email address")
        } else {
          showToast.error(data.error || "Failed to send verification code")
        }
        return
      }

      showToast.dismiss(loadingToast)
      showToast.success("Verification code sent to your email!")
      setIsSubmitted(true)
    } catch (error) {
      showToast.dismiss(loadingToast)
      showToast.error("Failed to send verification code. Please try again.")
      console.error("Forgot password error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-2 sm:px-4 py-8 sm:py-12">
      <div className="grid w-full gap-6 sm:gap-8 md:grid-cols-2 lg:gap-12">
        <div className="flex flex-col justify-center space-y-4 fade-in">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter">Reset Your Password</h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>
          </div>
          <div className="flex h-40 sm:h-60 md:h-[300px] items-center justify-center rounded-lg bg-muted">
            <img
              src="/placeholder.svg?height=300&width=400"
              alt="Forgot password illustration"
              className="h-full w-full rounded-lg object-cover"
            />
          </div>
        </div>
        <div className="flex items-center justify-center slide-up">
          <Card className="w-full max-w-md hover-glow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
              <CardDescription>
                {isSubmitted
                  ? "Check your email for a verification code"
                  : "Enter your email address to receive a verification code"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-medium">Verification Code Sent!</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We've sent a verification code to <span className="font-medium">{email}</span>
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Didn't receive the code? Check your spam folder or{" "}
                      <button
                        onClick={() => {
                          setIsSubmitted(false)
                          setEmail("")
                        }}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        try again
                      </button>
                    </p>
                    <Button
                      onClick={() => router.push(`/verify?email=${encodeURIComponent(email)}&type=forgot-password`)}
                      className="mt-4 w-full"
                    >
                      Enter Verification Code
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full button-hover" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Reset Link"}
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
