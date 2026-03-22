import { useSettings } from "@/contexts/settings-context"

export function useSettingsCheck() {
  const { settings, loading } = useSettings()

  const canPostJobs = () => {
    return !loading && settings?.allowJobPosting === true
  }

  const canApplyToJobs = () => {
    return !loading && settings?.allowJobApplications === true
  }

  const requiresEmailVerification = () => {
    return !loading && settings?.requireEmailVerification === true
  }

  const getMaxJobsPerEmployer = () => {
    return settings?.maxJobsPerEmployer || 10
  }

  const getMaxApplicationsPerJob = () => {
    return settings?.maxApplicationsPerJob || 100
  }

  const getJobPostingFee = () => {
    return settings?.jobPostingFee || 0
  }

  const isMaintenanceMode = () => {
    return !loading && settings?.maintenanceMode === true
  }

  const getMaintenanceMessage = () => {
    return settings?.maintenanceMessage || "The site is currently under maintenance. Please check back later."
  }

  const getSiteName = () => {
    return settings?.siteName || "GreenTech Jobs"
  }

  const getContactEmail = () => {
    return settings?.contactEmail || "hrm@greenotechjobs.com"
  }

  return {
    loading,
    settings,
    canPostJobs,
    canApplyToJobs,
    requiresEmailVerification,
    getMaxJobsPerEmployer,
    getMaxApplicationsPerJob,
    getJobPostingFee,
    isMaintenanceMode,
    getMaintenanceMessage,
    getSiteName,
    getContactEmail,
  }
} 