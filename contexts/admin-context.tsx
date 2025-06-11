"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { showToast } from "@/lib/toast"

interface AdminContextType {
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // First check localStorage
        const storedAdmin = localStorage.getItem("isAdmin")
        if (storedAdmin === "true") {
          setIsAdmin(true)
          setIsLoading(false)
          return
        }

        // If not in localStorage, check with the server
        const response = await fetch("/api/admin/check")
        if (response.ok) {
          const data = await response.json()
          setIsAdmin(data.isAdmin)
          // Store the admin status
          localStorage.setItem("isAdmin", data.isAdmin.toString())
        } else {
          // If server check fails, clear any stored admin status
          localStorage.removeItem("isAdmin")
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Failed to check admin status:", error)
        localStorage.removeItem("isAdmin")
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [])

  const login = async (email: string, password: string) => {
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
        throw new Error(data.message || "Login failed")
      }

      if (data.user.role !== "admin") {
        throw new Error("Unauthorized access")
      }

      setIsAdmin(true)
      localStorage.setItem("isAdmin", "true")
      showToast.success("Welcome back, Admin!")
      router.push("/admin/dashboard")
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Login failed")
      throw error
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsAdmin(false)
      localStorage.removeItem("isAdmin")
      router.push("/admin/login")
      showToast.success("Logged out successfully")
    }
  }

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
} 