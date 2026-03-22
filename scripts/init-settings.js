const mongoose = require('mongoose')
const { SystemSettings } = require('../models/SystemSettings')

// Default settings
const DEFAULT_SETTINGS = [
  {
    key: "allowJobPosting",
    value: true,
    description: "Allow employers to post new jobs",
    category: "job",
    type: "boolean",
    isPublic: true,
  },
  {
    key: "allowJobApplications",
    value: true,
    description: "Allow job seekers to apply for jobs",
    category: "job",
    type: "boolean",
    isPublic: true,
  },
  {
    key: "requireEmailVerification",
    value: true,
    description: "Require email verification for new accounts",
    category: "security",
    type: "boolean",
    isPublic: true,
  },
  {
    key: "maxJobsPerEmployer",
    value: 10,
    description: "Maximum number of active jobs per employer",
    category: "job",
    type: "number",
    isPublic: true,
  },
  {
    key: "maxApplicationsPerJob",
    value: 100,
    description: "Maximum number of applications per job",
    category: "job",
    type: "number",
    isPublic: true,
  },
  {
    key: "jobPostingFee",
    value: 0,
    description: "Fee for posting a job (in USD)",
    category: "job",
    type: "number",
    isPublic: true,
  },
  {
    key: "maintenanceMode",
    value: false,
    description: "Enable maintenance mode",
    category: "general",
    type: "boolean",
    isPublic: true,
  },
  {
    key: "maintenanceMessage",
    value: "The site is currently under maintenance. Please check back later.",
    description: "Message to display during maintenance mode",
    category: "general",
    type: "string",
    isPublic: true,
  },
  {
    key: "siteName",
    value: "GreenTech Jobs",
    description: "Name of the job board",
    category: "general",
    type: "string",
    isPublic: true,
  },
  {
    key: "contactEmail",
    value: "hrm@greenotechjobs.com",
    description: "Contact email for support",
    category: "general",
    type: "string",
    isPublic: true,
  },
]

async function initSettings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greentech')
    console.log('Connected to MongoDB')

    // Check if settings already exist
    const existingSettings = await SystemSettings.find({})
    
    if (existingSettings.length > 0) {
      console.log('Settings already exist in database')
      console.log('Existing settings:', existingSettings.map(s => s.key))
      return
    }

    // Create default settings
    const settingsWithIds = DEFAULT_SETTINGS.map(setting => ({
      ...setting,
      _id: new mongoose.Types.ObjectId(),
      updatedBy: new mongoose.Types.ObjectId(), // You might want to set this to a real admin user ID
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    await SystemSettings.insertMany(settingsWithIds)
    console.log('Default settings initialized successfully')
    console.log('Created settings:', settingsWithIds.map(s => s.key))

  } catch (error) {
    console.error('Error initializing settings:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the script
initSettings() 