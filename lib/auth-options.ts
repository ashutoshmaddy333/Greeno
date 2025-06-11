import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/lib/db"
import { User, type IUser } from "@/models/User"
import { compare } from "bcryptjs"
import { Document, Types } from "mongoose"

interface IUserWithPassword extends Omit<IUser, '_id'> {
  _id: Types.ObjectId
  password: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        await dbConnect()

        const user = await User.findOne({ email: credentials.email }).select("+password").lean() as IUserWithPassword | null

        if (!user) {
          throw new Error("No user found with this email")
        }

        if (!user.password) {
          throw new Error("Invalid user data")
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error("Invalid password")
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email before logging in")
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isEmailVerified: user.isEmailVerified,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          isVerified: user.isVerified,
          isEmailVerified: user.isEmailVerified,
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.isVerified = token.isVerified
        session.user.isEmailVerified = token.isEmailVerified
      }
      return session
    }
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
} 