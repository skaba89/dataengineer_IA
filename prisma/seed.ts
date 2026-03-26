// Seed Demo Users and Organization
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

async function main() {
  console.log("Seeding database...")

  // Check if demo org exists
  let organization = await db.organization.findFirst({
    where: { slug: "demo-company" }
  })

  if (!organization) {
    organization = await db.organization.create({
      data: {
        name: "Demo Company",
        slug: "demo-company",
        industry: "technology",
        plan: "professional",
        seats: 10,
      }
    })
    console.log("Created organization:", organization.name)
  }

  // Create demo users with different roles
  const users = [
    {
      email: "admin@demo.com",
      name: "Admin User",
      password: "admin123",
      role: "admin",
    },
    {
      email: "manager@demo.com",
      name: "Manager User",
      password: "manager123",
      role: "manager",
    },
    {
      email: "analyst@demo.com",
      name: "Analyst User",
      password: "analyst123",
      role: "analyst",
    },
    {
      email: "viewer@demo.com",
      name: "Viewer User",
      password: "viewer123",
      role: "viewer",
    },
    {
      email: "demo@ai-data-engineering.com",
      name: "Demo User",
      password: "demo123",
      role: "admin",
    },
  ]

  for (const userData of users) {
    const existingUser = await db.user.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      await db.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          organizationId: organization.id,
        }
      })
      console.log(`Created user: ${userData.email} (${userData.role})`)
    } else {
      console.log(`User already exists: ${userData.email}`)
    }
  }

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
