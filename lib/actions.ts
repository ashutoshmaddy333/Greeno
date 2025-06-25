export async function getJobById(jobId: string) {
  try {
    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch job details")
    }

    return {
      success: true,
      job: data.job
    }
  } catch (error: any) {
    console.error("Error fetching job:", error)
    return {
      success: false,
      message: error.message || "An error occurred while fetching job details",
    }
  }
}

export async function applyForJob(jobId: string, formData: FormData) {
  try {
    const response = await fetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit application")
    }

    return data
  } catch (error: any) {
    console.error("Error applying for job:", error)
    return {
      success: false,
      message: error.message || "An error occurred while submitting your application",
    }
  }
}

export interface ICompany {
  _id: string;
  name: string;
  website?: string;
  description?: string;
  industry?: string;
  size?: string;
  location?: string;
  foundedYear?: number;
  owner: string;
  jobs: string[];
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllCompanies(): Promise<{ success: boolean; companies?: ICompany[]; message?: string }> {
  try {
    const response = await fetch('/api/companies', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch companies')
    }

    return {
      success: true,
      companies: data.companies
    }
  } catch (error: any) {
    console.error('Error fetching companies:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while fetching companies',
    }
  }
}

export async function getEmployerProfile() {
  try {
    const response = await fetch('/api/employer/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch employer profile')
    }

    return {
      success: true,
      company: data.company,
      stats: data.stats
    }
  } catch (error: any) {
    console.error('Error fetching employer profile:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while fetching employer profile',
    }
  }
}

export async function createCompanyProfile(profileData: {
  name: string;
  website?: string;
  size?: string;
  industry?: string;
  description?: string;
  location?: string;
  foundedYear?: number;
  logo?: File | null;
}) {
  try {
    console.log("Sending company profile data:", {
      ...profileData,
      logo: profileData.logo ? {
        name: profileData.logo.name,
        type: profileData.logo.type,
        size: profileData.logo.size
      } : null
    })

    const formData = new FormData()
    formData.append("data", JSON.stringify({
      name: profileData.name,
      website: profileData.website,
      size: profileData.size,
      industry: profileData.industry,
      description: profileData.description,
      location: profileData.location,
      foundedYear: profileData.foundedYear,
    }))

    if (profileData.logo) {
      console.log("Appending logo file:", {
        name: profileData.logo.name,
        type: profileData.logo.type,
        size: profileData.logo.size
      })
      formData.append("logo", profileData.logo)
    }

    const response = await fetch('/api/employer/profile', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    console.log("Server response:", data)

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create company profile')
    }

    return data
  } catch (error: any) {
    console.error('Error creating company profile:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while creating company profile',
    }
  }
}

export async function postJob(jobData: {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  category: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits?: string;
  applicationDeadline: string;
  isRemote: boolean;
  experienceLevel: string;
  educationLevel?: string;
  skills?: string;
  companyWebsite?: string;
  companySize?: string;
  companyIndustry?: string;
  companyDescription?: string;
  logoFile?: File | null;
}) {
  try {
    console.log("Sending job data:", {
      ...jobData,
      logoFile: jobData.logoFile ? {
        name: jobData.logoFile.name,
        type: jobData.logoFile.type,
        size: jobData.logoFile.size
      } : null
    })

    const formData = new FormData()
    formData.append("data", JSON.stringify(jobData))
    
    if (jobData.logoFile) {
      console.log("Appending logo file:", {
        name: jobData.logoFile.name,
        type: jobData.logoFile.type,
        size: jobData.logoFile.size
      })
      formData.append("logo", jobData.logoFile)
    }

    const response = await fetch('/api/jobs', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    console.log("Server response:", data)

    if (!response.ok) {
      throw new Error(data.message || 'Failed to post job')
    }

    return {
      success: true,
      job: data.job
    }
  } catch (error: any) {
    console.error('Error posting job:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while posting the job',
    }
  }
}

export async function updateCompanyProfile(companyId: string, profileData: {
  name: string;
  website?: string;
  size?: string;
  industry?: string;
  description?: string;
  location?: string;
  foundedYear?: number;
}) {
  try {
    console.log("Updating company profile with data:", profileData)

    const response = await fetch(`/api/companies/${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    })

    const data = await response.json()
    console.log("Server response:", data)

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update company profile')
    }

    return {
      success: true,
      company: data.company
    }
  } catch (error: any) {
    console.error('Error updating company profile:', error)
    return {
      success: false,
      error: error.message || 'An error occurred while updating company profile',
    }
  }
}

export async function deleteCompanyProfile(companyId: string) {
  try {
    const response = await fetch(`/api/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete company profile')
    }

    return {
      success: true,
      message: data.message || 'Company profile deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting company profile:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while deleting company profile',
    }
  }
}

export async function getEmployerJobs(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const { search = "", status = "all", page = 1, limit = 5 } = params
    
    // Build query string
    const queryParams = new URLSearchParams({
      search,
      status,
      page: page.toString(),
      limit: limit.toString()
    })

    const response = await fetch(`/api/employer/jobs?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch jobs")
    }

    return {
      success: true,
      jobs: data.jobs,
      pagination: data.pagination
    }
  } catch (error: any) {
    console.error("Error fetching employer jobs:", error)
    return {
      success: false,
      message: error.message || "An error occurred while fetching jobs",
    }
  }
}

export async function getEmployerDashboard() {
  try {
    const response = await fetch('/api/employer/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard data')
    }

    return {
      success: true,
      stats: data.stats
    }
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while fetching dashboard data',
    }
  }
}

export async function updateCompanyLogo(companyId: string, logoFile: File) {
  try {
    const formData = new FormData()
    formData.append("logo", logoFile)

    const response = await fetch(`/api/companies/${companyId}`, {
      method: 'PATCH',
      body: formData,
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message || 'Failed to update company logo')
    }

    const data = await response.json()
    console.log("Logo update response:", data)

    return {
      success: true,
      company: data.company,
      message: data.message
    }
  } catch (error: any) {
    console.error('Error updating company logo:', error)
    return {
      success: false,
      message: error.message || 'An error occurred while updating company logo',
    }
  }
}
