// User Registration API
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, organizationName, industry } = body

    // Validate input
    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 400 }
      )
    }

    // Create organization
    const organization = await db.organization.create({
      data: {
        name: organizationName,
        slug: organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36),
        industry: industry || null,
        plan: "starter",
        seats: 5,
      }
    })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with admin role (first user of org)
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "admin",
        organizationId: organization.id,
      }
    })

    return NextResponse.json({
      success: true,
      message: "Compte créé avec succès",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    )
  }
}
