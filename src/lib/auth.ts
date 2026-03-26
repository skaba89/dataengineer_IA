// NextAuth.js Configuration - Enterprise SSO Support
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import AzureAD from "next-auth/providers/azure-ad"
import Google from "next-auth/providers/google"
import Okta from "next-auth/providers/okta"
import Auth0 from "next-auth/providers/auth0"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: string
      organizationId?: string | null
    }
  }
  
  interface User {
    id: string
    email: string
    name?: string | null
    role: string
    organizationId?: string | null
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: string
    organizationId?: string | null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  providers: [
    // ============================================
    // Credentials Provider (Email/Password)
    // ============================================
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            organizationId: true,
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        }
      }
    }),

    // ============================================
    // Microsoft Azure AD / Entra ID
    // ============================================
    ...(process.env.AZURE_AD_CLIENT_ID ? [AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email || profile.preferred_username,
          image: profile.picture,
          role: 'viewer', // Default role for SSO users
        }
      },
    })] : []),

    // ============================================
    // Google Workspace
    // ============================================
    ...(process.env.GOOGLE_CLIENT_ID ? [Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          scope: 'openid email profile',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'viewer',
        }
      },
    })] : []),

    // ============================================
    // Okta
    // ============================================
    ...(process.env.OKTA_CLIENT_ID ? [Okta({
      clientId: process.env.OKTA_CLIENT_ID,
      clientSecret: process.env.OKTA_CLIENT_SECRET || '',
      issuer: `https://${process.env.OKTA_DOMAIN}`,
      authorization: {
        params: {
          scope: 'openid profile email groups',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.preferred_username,
          email: profile.email || profile.preferred_username,
          image: profile.picture,
          role: 'viewer',
        }
      },
    })] : []),

    // ============================================
    // Auth0
    // ============================================
    ...(process.env.AUTH0_CLIENT_ID ? [Auth0({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
      issuer: `https://${process.env.AUTH0_DOMAIN}`,
      authorization: {
        params: {
          prompt: 'login',
          scope: 'openid profile email',
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.nickname,
          email: profile.email,
          image: profile.picture,
          role: 'viewer',
        }
      },
    })] : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = user.role!
        token.organizationId = user.organizationId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.organizationId = token.organizationId
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.email}`)
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token?.email}`)
    }
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "default-secret-for-development-at-least-32-chars-long",
})

// Helper functions for role-based access control
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 100,
  manager: 75,
  analyst: 50,
  viewer: 25,
}

export function hasRole(userRole: string, requiredRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] ?? 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole]
  return userLevel >= requiredLevel
}

export function canAccessOrganization(userOrgId: string | null | undefined, targetOrgId: string): boolean {
  // Admins can access all organizations
  // For now, users can only access their own organization
  return userOrgId === targetOrgId
}

// Middleware helper to check authentication
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session
}

// Middleware helper to check role
export async function requireRole(role: Role) {
  const session = await requireAuth()
  if (!hasRole(session.user.role, role)) {
    throw new Error("Insufficient permissions")
  }
  return session
}
