/**
 * DataSphere Innovation - Data Migration Script
 * Migrates data from SQLite to PostgreSQL
 */

import { PrismaClient as SqliteClient } from '@prisma/client-sqlite'
import { PrismaClient as PostgresClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

// SQLite client (source)
const sqlite = new SqliteClient({
  datasources: {
    db: {
      url: 'file:./db/custom.db',
    },
  },
})

// PostgreSQL client (destination)
const postgres = new PostgresClient()

// Migration statistics
interface MigrationStats {
  table: string
  sourceCount: number
  migratedCount: number
  skippedCount: number
  errors: string[]
}

const stats: MigrationStats[] = []

/**
 * Migrate Users table
 */
async function migrateUsers(): Promise<MigrationStats> {
  const tableStats: MigrationStats = {
    table: 'User',
    sourceCount: 0,
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  }

  try {
    // Get all users from SQLite
    const users = await sqlite.user.findMany()
    tableStats.sourceCount = users.length

    console.log(`Found ${users.length} users to migrate`)

    // Migrate each user
    for (const user of users) {
      try {
        // Check if user already exists
        const existing = await postgres.user.findUnique({
          where: { id: user.id },
        })

        if (existing) {
          tableStats.skippedCount++
          continue
        }

        // Create user in PostgreSQL
        await postgres.user.create({
          data: {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            name: user.name,
            password: user.password,
            image: user.image,
            role: user.role,
            mfaEnabled: user.mfaEnabled,
            organizationId: user.organizationId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        })

        tableStats.migratedCount++
      } catch (error) {
        tableStats.errors.push(`User ${user.id}: ${error}`)
      }
    }
  } catch (error) {
    tableStats.errors.push(`General error: ${error}`)
  }

  return tableStats
}

/**
 * Migrate Organizations table
 */
async function migrateOrganizations(): Promise<MigrationStats> {
  const tableStats: MigrationStats = {
    table: 'Organization',
    sourceCount: 0,
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  }

  try {
    const orgs = await sqlite.organization.findMany()
    tableStats.sourceCount = orgs.length

    console.log(`Found ${orgs.length} organizations to migrate`)

    for (const org of orgs) {
      try {
        const existing = await postgres.organization.findUnique({
          where: { id: org.id },
        })

        if (existing) {
          tableStats.skippedCount++
          continue
        }

        // Parse JSON fields
        let settings = null
        if (org.settings) {
          try {
            settings = JSON.parse(org.settings)
          } catch {
            settings = null
          }
        }

        await postgres.organization.create({
          data: {
            id: org.id,
            name: org.name,
            slug: org.slug,
            industry: org.industry,
            description: org.description,
            logo: org.logo,
            website: org.website,
            plan: org.plan,
            seats: org.seats,
            settings: settings,
            createdAt: org.createdAt,
            updatedAt: org.updatedAt,
          },
        })

        tableStats.migratedCount++
      } catch (error) {
        tableStats.errors.push(`Organization ${org.id}: ${error}`)
      }
    }
  } catch (error) {
    tableStats.errors.push(`General error: ${error}`)
  }

  return tableStats
}

/**
 * Migrate Projects table
 */
async function migrateProjects(): Promise<MigrationStats> {
  const tableStats: MigrationStats = {
    table: 'Project',
    sourceCount: 0,
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  }

  try {
    const projects = await sqlite.project.findMany()
    tableStats.sourceCount = projects.length

    console.log(`Found ${projects.length} projects to migrate`)

    for (const project of projects) {
      try {
        const existing = await postgres.project.findUnique({
          where: { id: project.id },
        })

        if (existing) {
          tableStats.skippedCount++
          continue
        }

        await postgres.project.create({
          data: {
            id: project.id,
            name: project.name,
            slug: project.slug,
            description: project.description,
            status: project.status,
            package: project.package,
            budget: project.budget,
            startDate: project.startDate,
            endDate: project.endDate,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            organizationId: project.organizationId,
            ownerId: project.ownerId,
          },
        })

        tableStats.migratedCount++
      } catch (error) {
        tableStats.errors.push(`Project ${project.id}: ${error}`)
      }
    }
  } catch (error) {
    tableStats.errors.push(`General error: ${error}`)
  }

  return tableStats
}

/**
 * Migrate DataSources table
 */
async function migrateDataSources(): Promise<MigrationStats> {
  const tableStats: MigrationStats = {
    table: 'DataSource',
    sourceCount: 0,
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  }

  try {
    const dataSources = await sqlite.dataSource.findMany()
    tableStats.sourceCount = dataSources.length

    console.log(`Found ${dataSources.length} data sources to migrate`)

    for (const ds of dataSources) {
      try {
        const existing = await postgres.dataSource.findUnique({
          where: { id: ds.id },
        })

        if (existing) {
          tableStats.skippedCount++
          continue
        }

        // Parse JSON fields
        let schema = null
        let metadata = null
        try {
          schema = ds.schema ? JSON.parse(ds.schema) : null
          metadata = ds.metadata ? JSON.parse(ds.metadata) : null
        } catch {
          // Keep as null if parsing fails
        }

        await postgres.dataSource.create({
          data: {
            id: ds.id,
            name: ds.name,
            type: ds.type,
            host: ds.host,
            port: ds.port,
            database: ds.database,
            schema: schema,
            status: ds.status,
            lastSync: ds.lastSync,
            metadata: metadata,
            createdAt: ds.createdAt,
            updatedAt: ds.updatedAt,
            projectId: ds.projectId,
          },
        })

        tableStats.migratedCount++
      } catch (error) {
        tableStats.errors.push(`DataSource ${ds.id}: ${error}`)
      }
    }
  } catch (error) {
    tableStats.errors.push(`General error: ${error}`)
  }

  return tableStats
}

/**
 * Migrate AuditLogs table
 */
async function migrateAuditLogs(): Promise<MigrationStats> {
  const tableStats: MigrationStats = {
    table: 'AuditLog',
    sourceCount: 0,
    migratedCount: 0,
    skippedCount: 0,
    errors: [],
  }

  try {
    const logs = await sqlite.auditLog.findMany()
    tableStats.sourceCount = logs.length

    console.log(`Found ${logs.length} audit logs to migrate`)

    // Batch insert for performance
    const batchSize = 100
    for (let i = 0; i < logs.length; i += batchSize) {
      const batch = logs.slice(i, i + batchSize)
      
      try {
        await postgres.auditLog.createMany({
          data: batch.map(log => ({
            id: log.id,
            timestamp: log.timestamp,
            userId: log.userId,
            organizationId: log.organizationId,
            action: log.action,
            resource: log.resource,
            resourceId: log.resourceId,
            details: log.details ? JSON.parse(log.details) : null,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            status: log.status,
            riskLevel: log.riskLevel,
            metadata: log.metadata ? JSON.parse(log.metadata) : null,
            signature: log.signature,
          })),
          skipDuplicates: true,
        })

        tableStats.migratedCount += batch.length
      } catch (error) {
        tableStats.errors.push(`Batch ${i / batchSize}: ${error}`)
        tableStats.skippedCount += batch.length
      }
    }
  } catch (error) {
    tableStats.errors.push(`General error: ${error}`)
  }

  return tableStats
}

/**
 * Generate migration report
 */
function generateReport(stats: MigrationStats[]): string {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTables: stats.length,
      totalRecords: stats.reduce((sum, s) => sum + s.sourceCount, 0),
      totalMigrated: stats.reduce((sum, s) => sum + s.migratedCount, 0),
      totalSkipped: stats.reduce((sum, s) => sum + s.skippedCount, 0),
      totalErrors: stats.reduce((sum, s) => sum + s.errors.length, 0),
    },
    details: stats,
  }

  return JSON.stringify(report, null, 2)
}

/**
 * Main migration function
 */
async function main() {
  console.log('==========================================')
  console.log('DataSphere Innovation - Data Migration')
  console.log('==========================================\n')

  try {
    // Run migrations in order (respecting foreign key constraints)
    console.log('Step 1: Migrating Organizations...')
    stats.push(await migrateOrganizations())

    console.log('\nStep 2: Migrating Users...')
    stats.push(await migrateUsers())

    console.log('\nStep 3: Migrating Projects...')
    stats.push(await migrateProjects())

    console.log('\nStep 4: Migrating Data Sources...')
    stats.push(await migrateDataSources())

    console.log('\nStep 5: Migrating Audit Logs...')
    stats.push(await migrateAuditLogs())

    // Generate report
    const report = generateReport(stats)
    const reportPath = path.join(__dirname, '..', 'migration-report.json')
    fs.writeFileSync(reportPath, report)

    console.log('\n==========================================')
    console.log('Migration Completed!')
    console.log('==========================================')
    console.log(`Total Migrated: ${stats.reduce((s, st) => s + st.migratedCount, 0)} records`)
    console.log(`Total Skipped: ${stats.reduce((s, st) => s + st.skippedCount, 0)} records`)
    console.log(`Total Errors: ${stats.reduce((s, st) => s + st.errors.length, 0)}`)
    console.log(`\nReport saved to: ${reportPath}`)

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  }
}

main()
