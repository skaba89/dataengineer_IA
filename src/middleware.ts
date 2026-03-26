// Middleware for Authentication and Authorization
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/api/auth",
  "/api/health",
  "/api/setup",
  "/api/projects",
  "/api/agents",
  "/demo",
]

// Routes that require specific roles
const roleRestrictedRoutes: Record<string, string[]> = {
  "/admin": ["admin"],
  "/settings": ["admin", "manager"],
}

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role || ""

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )

  // Allow public routes
  if (isPublicRoute) {
    // Redirect logged-in users away from auth pages
    if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleRestrictedRoutes)) {
    if (nextUrl.pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/unauthorized", nextUrl))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)"],
}
