"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("jobseeker")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const loadingToast = showToast.loading("Creating your account...")

    try {
      // Validate form data
      if (!name || !email || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        })
        return
      }

      if (password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive"
        })
        return
      }

      // Send registration request
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        showToast.dismiss(loadingToast)
        
        // Handle specific error cases
        if (data.error === "Email already registered") {
          showToast.error(`${data.error}: ${data.details}`)
        } else if (data.error === "Invalid email format") {
          showToast.error("Please enter a valid email address")
        } else if (data.error === "Password must be at least 6 characters long") {
          showToast.error("Password must be at least 6 characters long")
        } else if (data.error === "Missing required fields") {
          showToast.error(data.details || "Please fill in all required fields")
        } else {
          showToast.error(data.details || data.error || "An unexpected error occurred. Please try again")
        }
        return
      }

      // Show success message
      showToast.dismiss(loadingToast)
      showToast.success("Registration successful! Please check your email for the verification code")

      // Redirect to verification page
      router.push(`/verify?email=${encodeURIComponent(email)}&type=signup`)
    } catch (error: any) {
      showToast.dismiss(loadingToast)
      showToast.error("An unexpected error occurred. Please try again")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <div className="grid w-full gap-8 md:grid-cols-2 lg:gap-12">
        <div className="flex flex-col justify-center space-y-4 fade-in">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join Our Community</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Create an account to start your job search journey or find the perfect candidates.
            </p>
          </div>
          <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted">
            <img
              src="/1.jpg?height=300&width=400"
              alt="Signup illustration"
              className="h-full w-full rounded-lg object-cover"
            />
          </div>
        </div>
        <div className="flex items-center justify-center slide-up">
          <Card className="w-full max-w-md hover-glow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>Enter your information to create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-9"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
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
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>I am a</Label>
                  <RadioGroup value={role} onValueChange={setRole} className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted">
                      <RadioGroupItem value="jobseeker" id="jobseeker" />
                      <Label htmlFor="jobseeker" className="flex cursor-pointer flex-col">
                        <span className="font-medium">Job Seeker</span>
                        <span className="text-sm text-muted-foreground">I want to find a job</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted">
                      <RadioGroupItem value="employer" id="employer" />
                      <Label htmlFor="employer" className="flex cursor-pointer flex-col">
                        <span className="font-medium">Employer</span>
                        <span className="text-sm text-muted-foreground">I want to hire candidates</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button type="submit" className="w-full button-hover" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-muted"></div>
                <span className="mx-4 flex-shrink text-muted-foreground">or</span>
                <div className="flex-grow border-t border-muted"></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full button-hover">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="w-full button-hover">
                  <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                  Facebook
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline transition-colors hover:text-primary/80"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
