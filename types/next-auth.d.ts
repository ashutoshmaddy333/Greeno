import "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: string
    isVerified: boolean
    isEmailVerified: boolean
  }

  interface Session {
    user: User & {
      id: string
      role: string
      isVerified: boolean
      isEmailVerified: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    isVerified: boolean
    isEmailVerified: boolean
  }
} 