import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the full URL for a logo image
 * @param logoPath The logo path from the database
 * @returns The full URL for the logo image
 */
export function getLogoUrl(logoPath: string | undefined): string {
  if (!logoPath) {
    console.log("No logo path provided, using placeholder")
    return "/placeholder.svg"
  }
  
  // If it's already a full URL, return as is
  if (logoPath.startsWith('http')) {
    console.log("Logo is already a full URL:", logoPath)
    return logoPath
  }
  
  // If it's a relative path starting with /uploads, make it absolute
  if (logoPath.startsWith('/uploads')) {
    // Use NEXT_PUBLIC_BASE_URL in production, window.location.origin in development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
      (typeof window !== 'undefined' ? window.location.origin : '')
    const fullUrl = `${baseUrl}${logoPath}`
    console.log("Generated logo URL:", fullUrl)
    return fullUrl
  }
  
  // For any other case, return the path as is
  console.log("Using logo path as is:", logoPath)
  return logoPath
}

/**
 * Get the dimensions for a logo based on its context
 * @param context The context where the logo is being displayed
 * @returns An object with width and height
 */
export const getLogoDimensions = (context: 'navbar' | 'card' | 'profile' | 'detail' = 'card') => {
  switch (context) {
    case 'navbar':
      return { width: 32, height: 32 }
    case 'card':
      return { width: 48, height: 48 }
    case 'profile':
      return { width: 120, height: 120 }
    case 'detail':
      return { width: 160, height: 160 }
    default:
      return { width: 48, height: 48 }
  }
}
