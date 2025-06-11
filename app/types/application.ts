export type ApplicationStatus = 'pending' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired'

export interface Application {
  id: string
  jobId: string
  jobTitle: string
  candidateName: string
  status: ApplicationStatus
  appliedAt: string
  resumeUrl: string
  resumeOriginalName: string
  firstName: string
  middleName?: string
  lastName: string
  email: string
  phoneNumber: string
  experience: "fresher" | "experienced"
  yearsOfExperience?: number
  education: Array<{
    degree: string
    field: string
    institution: string
    graduationYear: number
  }>
  coverLetter?: string
} 