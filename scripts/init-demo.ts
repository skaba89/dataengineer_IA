// Initialize demo user and organization

import { db } from '../src/lib/db'
import { hash } from 'bcryptjs'

async function main() {
  console.log('Initializing demo data...')

  // Check if demo user exists
  const existingUser = await db.user.findUnique({
    where: { email: 'demo@example.com' },
  })

  if (existingUser) {
    console.log('Demo user already exists')
    return
  }

  // Create demo organization
  const organization = await db.organization.create({
    data: {
      name: 'Demo Company',
      slug: 'demo-company',
      industry: 'Technology',
      size: '50-100',
    },
  })

  // Create demo user
  const hashedPassword = await hash('demo123', 10)
  const user = await db.user.create({
    data: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
      role: 'ADMIN',
      organizationId: organization.id,
    },
  })

  // Create a demo project
  const project = await db.project.create({
    data: {
      name: 'Customer Analytics Platform',
      description: 'A comprehensive customer analytics platform with real-time dashboards and predictive insights',
      status: 'DISCOVERY',
      industry: 'E-commerce',
      organizationId: organization.id,
      ownerId: user.id,
    },
  })

  console.log('Demo data created successfully!')
  console.log('User:', user.email)
  console.log('Organization:', organization.name)
  console.log('Project:', project.name)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
