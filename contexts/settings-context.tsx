"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface SystemSettings {
  allowJobPosting: boolean
  allowJobApplications: boolean
  requireEmailVerification: boolean
  maxJobsPerEmployer: number
  maxApplicationsPerJob: number
  jobPostingFee: number
  maintenanceMode: boolean
  maintenanceMessage: string
  siteName: string
  contactEmail: string
  [key: string]: any
}

interface SettingsContextType {
  settings: SystemSettings | null
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.success && data.settings) {
        setSettings(data.settings)
      } else {
        throw new Error(data.error || 'Failed to fetch settings')
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
      
      // Set default settings as fallback
      setSettings({
        allowJobPosting: true,
        allowJobApplications: true,
        requireEmailVerification: true,
        maxJobsPerEmployer: 10,
        maxApplicationsPerJob: 100,
        jobPostingFee: 0,
        maintenanceMode: false,
        maintenanceMessage: "The site is currently under maintenance. Please check back later.",
        siteName: "GreenTech Jobs",
        contactEmail: "hrm@greenotechjobs.com",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshSettings = async () => {
    await fetchSettings()
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 