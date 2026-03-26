// Auth Guard Component - Protects routes that require authentication
"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "manager" | "analyst" | "viewer"
}

const ROLE_HIERARCHY = {
  admin: 100,
  manager: 75,
  analyst: 50,
  viewer: 25,
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(pathname || "/dashboard")
      router.push(`/login?callbackUrl=${callbackUrl}`)
    }
  }, [status, router, pathname])

  useEffect(() => {
    if (status === "authenticated" && requiredRole && session?.user?.role) {
      const userLevel = ROLE_HIERARCHY[session.user.role as keyof typeof ROLE_HIERARCHY] ?? 0
      const requiredLevel = ROLE_HIERARCHY[requiredRole]

      if (userLevel < requiredLevel) {
        router.push("/unauthorized")
      }
    }
  }, [status, session, requiredRole, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  // Check role authorization
  if (requiredRole && session?.user?.role) {
    const userLevel = ROLE_HIERARCHY[session.user.role as keyof typeof ROLE_HIERARCHY] ?? 0
    const requiredLevel = ROLE_HIERARCHY[requiredRole]

    if (userLevel < requiredLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-violet-600 hover:underline"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
