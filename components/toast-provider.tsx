"use client"

import { Toaster } from "react-hot-toast"
import { useTheme } from "next-themes"

export function ToastProvider() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? "#1e293b" : "#ffffff",
          color: isDark ? "#ffffff" : "#0f172a",
          border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: "white",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: "white",
          },
        },
      }}
    />
  )
}
