import multer from "multer"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"

// Ensure upload directories exist
const ensureUploadDirectories = () => {
  const directories = [
    path.join(process.cwd(), "public", "uploads", "logos"),
    path.join(process.cwd(), "public", "uploads", "job-logos")
  ]

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

// Call this when the server starts
ensureUploadDirectories()

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine which directory to use based on the upload type
    const uploadType = req.path.includes("/companies/") ? "logos" : "job-logos"
    const uploadDir = path.join(process.cwd(), "public", "uploads", uploadType)
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = uuidv4()
    const ext = path.extname(file.originalname)
    cb(null, `logo-${uniqueSuffix}${ext}`)
  }
})

// File filter function
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"]
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and SVG files are allowed."))
  }
}

// Configure multer upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  }
})

// Helper function to get the relative path for the uploaded file
export const getRelativePath = (file: Express.Multer.File) => {
  const uploadType = file.destination.includes("job-logos") ? "job-logos" : "logos"
  return `/uploads/${uploadType}/${file.filename}`
}

// Helper function to delete old logo file
export const deleteOldLogo = (oldLogoPath: string) => {
  if (!oldLogoPath) return

  const fullPath = path.join(process.cwd(), "public", oldLogoPath)
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
  }
}

// Middleware to handle multer errors
export const handleMulterError = (err: any, req: Express.Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size too large. Maximum size is 2MB." })
    }
    return res.status(400).json({ message: err.message })
  }
  if (err) {
    return res.status(400).json({ message: err.message })
  }
  next()
} 