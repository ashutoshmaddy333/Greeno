"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"

interface User {
  id: string
  name: string
  email: string
  role: "jobseeker" | "employer" | "admin"
  isEmailVerified: boolean
  isVerified: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isEmployer: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<{ user: User; token: string }>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  register: (
    name: string,
    email: string,
    password: string,
    role: "jobseeker" | "employer" | "admin",
  ) => Promise<{ user: User }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface FacebookLoginResponse {
  status: string
  authResponse: {
    accessToken: string
  }
}

interface FacebookUser {
  id: string
  name: string
  email: string
}

/** OAuth token response from `google.accounts.oauth2` Token Client */
type GoogleTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
  error_uri?: string
}

// Add type declarations for external SDKs
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: GoogleTokenResponse) => void
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void
          }
        }
      }
    }
    FB?: {
      init: (config: {
        appId: string
        cookie: boolean
        xfbml: boolean
        version: string
      }) => void
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: { scope: string }
      ) => void
      api: (
        path: string,
        params: { fields: string },
        callback: (response: FacebookUser) => void
      ) => void
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log("Loaded user from storage:", parsedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.log("Login response:", data)
        const detail =
          typeof data.error === "string" && data.error
            ? [data.message, data.error].filter(Boolean).join(" — ")
            : data.message || "Login failed"
        throw new Error(detail)
      }

      // Ensure the user object has the correct structure
      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        isEmailVerified: data.user.isEmailVerified,
        isVerified: data.user.isVerified,
      }

      setToken(data.token)
      setUser(userData)

      // Store in localStorage for client-side persistence
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(userData))

      console.log("User set in context:", userData)

      return { user: userData, token: data.token }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, role: "jobseeker" | "employer" | "admin") => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Ensure the user object has the correct structure
      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        isEmailVerified: false,
        isVerified: false,
      }

      // Don't set token or user in context since they need to verify email first
      return { user: userData }
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    showToast.success("Successfully logged out")
    router.push("/login")
  }

  const isAuthenticated = !!user
  const isEmployer = user?.role === "employer"
  const isAdmin = user?.role === "admin"

  const handleOAuthLogin = async (provider: "google" | "facebook") => {
    setIsLoading(true)
    let userData: { id: string; name: string; email: string } | null = null
    let accessToken: string | null = null

    try {
      if (provider === "google") {
        // Wait for Google client to be loaded
        await new Promise<void>((resolve) => {
          if (window.google) {
            resolve()
          } else {
            window.addEventListener("load", () => {
              if (window.google) resolve()
            })
          }
        })

        if (!window.google) {
          throw new Error("Google client failed to load")
        }

        if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
          throw new Error("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID")
        }

        // Token client: origins/redirect URIs are configured in Google Cloud Console (not via redirect_uri here).
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope:
            "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
          callback: async (response: GoogleTokenResponse) => {
            if (response.error) {
              const detail =
                response.error_description ||
                (response.error === "redirect_uri_mismatch"
                  ? "Add Authorized JavaScript origins + Authorized redirect URIs in Google Cloud Console (include this origin and postmessage)."
                  : response.error)
              console.error("Google Token Client error:", response)
              throw new Error(detail)
            }
            if (!response.access_token) {
              throw new Error("No access token from Google")
            }
            accessToken = response.access_token

            const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${accessToken}` },
            })
            const userInfo = await userInfoResponse.json()

            userData = {
              id: userInfo.sub,
              name: userInfo.name,
              email: userInfo.email,
            }
          },
        })

        // Trigger Google sign-in
        client.requestAccessToken()

        // Wait for user data to be set
        while (!userData || !accessToken) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      } else {
        // Facebook login
        await new Promise<void>((resolve) => {
          if (window.FB) {
            resolve()
          } else {
            window.addEventListener("load", () => {
              if (window.FB) resolve()
            })
          }
        })

        if (!window.FB) {
          throw new Error("Facebook client failed to load")
        }

        // Initialize Facebook
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
          cookie: true,
          xfbml: true,
          version: "v18.0",
        })

        // Facebook login
        const response = await new Promise<FacebookLoginResponse>((resolve) => {
          window.FB!.login((response: FacebookLoginResponse) => resolve(response), {
            scope: "email,public_profile",
          })
        })

        if (response.status !== "connected") {
          throw new Error("Facebook login failed")
        }

        accessToken = response.authResponse.accessToken
        const fbUser = await new Promise<FacebookUser>((resolve) => {
          window.FB!.api("/me", { fields: "id,name,email" }, resolve)
        })

        userData = {
          id: fbUser.id,
          name: fbUser.name,
          email: fbUser.email,
        }
      }

      if (!userData || !accessToken) {
        throw new Error("Failed to get user data")
      }

      // Send to our backend
      const response = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          accessToken,
          userData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `${provider} login failed`)
      }

      // Update auth context
      setToken(data.token)
      setUser(data.user)

      // Store in localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      showToast.success(`Welcome back, ${data.user.name}!`)
      router.push(data.user.role === "employer" ? "/employer" : "/jobs")
    } catch (error: any) {
      console.error(`${provider} login error:`, error)
      showToast.error(error.message || `${provider} login failed`)
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = () => handleOAuthLogin("google")
  const loginWithFacebook = () => handleOAuthLogin("facebook")

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isEmployer,
        isAdmin,
        login,
        loginWithGoogle,
        loginWithFacebook,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
