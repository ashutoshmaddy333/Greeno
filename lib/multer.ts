import multer from "multer"
import path from "path"
import { NextApiRequest } from "next"
import { NextResponse } from "next/server"

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/profile")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
    return cb(new Error("Only image files are allowed!"))
  }
  cb(null, true)
}

// Create multer instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
})

// Helper function to handle multer in Next.js API routes
export const handleFileUpload = (req: NextApiRequest) => {
  return new Promise((resolve, reject) => {
    upload.single("profilePicture")(req as any, {} as any, (err: any) => {
      if (err) {
        reject(err)
      } else {
        resolve((req as any).file)
      }
    })
  })
} 