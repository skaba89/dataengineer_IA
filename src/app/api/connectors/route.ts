// Connectors API - Manage data source connections

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CONNECTOR_REGISTRY, type ConnectorType } from '@/lib/connectors/types'

// GET /api/connectors - List all connectors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId')
    const projectId = searchParams.get('projectId')

    // Get connector types from registry
    const connectorTypes = Object.entries(CONNECTOR_REGISTRY).map(([type, config]) => ({
      type,
      name: config.name,
      description: config.description,
      icon: config.icon,
      features: config.features,
      requiredFields: config.requiredFields,
    }))

    // Get saved connectors from database
    const where: Record<string, unknown> = {}
    if (organizationId) where.organizationId = organizationId
    if (projectId) where.projectId = projectId

    const savedConnectors = await db.connector.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        lastSync: true,
        createdAt: true,
        // Don't return credentials for security
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      connectorTypes,
      savedConnectors,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/connectors - Create and test a new connector
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      type, 
      config, 
      credentials, 
      organizationId,
      projectId,
      testOnly,
    } = body

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Name and type are required' },
        { status: 400 }
      )
    }

    const connectorConfig = CONNECTOR_REGISTRY[type as ConnectorType]
    if (!connectorConfig) {
      return NextResponse.json(
        { success: false, error: 'Invalid connector type' },
        { status: 400 }
      )
    }

    // Validate required fields
    const missingFields = connectorConfig.requiredFields
      .filter(f => f.required && !config?.[f.name])
      .map(f => f.label)

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Test connection (simulation)
    const testResult = await testConnectorConnection(type as ConnectorType, config, credentials)

    if (testOnly) {
      return NextResponse.json({
        success: testResult.success,
        testResult,
      })
    }

    if (!testResult.success) {
      return NextResponse.json(
        { success: false, error: `Connection test failed: ${testResult.message}` },
        { status: 400 }
      )
    }

    // Save connector to database
    const connector = await db.connector.create({
      data: {
        name,
        type: type as ConnectorType,
        status: 'ACTIVE',
        config: JSON.stringify(config),
        credentials: JSON.stringify(credentials), // Should be encrypted in production
        organizationId,
        projectId,
      },
    })

    return NextResponse.json({
      success: true,
      connector: {
        id: connector.id,
        name: connector.name,
        type: connector.type,
        status: connector.status,
      },
      testResult,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE /api/connectors - Delete a connector
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const connectorId = searchParams.get('connectorId')

    if (!connectorId) {
      return NextResponse.json(
        { success: false, error: 'connectorId is required' },
        { status: 400 }
      )
    }

    await db.connector.delete({
      where: { id: connectorId },
    })

    return NextResponse.json({
      success: true,
      message: 'Connector deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Test connector connection
 * In production, this would actually test the connection
 */
async function testConnectorConnection(
  type: ConnectorType,
  config: Record<string, unknown>,
  _credentials: Record<string, unknown>
): Promise<{ success: boolean; message: string; details?: Record<string, unknown>; latency?: number }> {
  const startTime = Date.now()

  // Simulate connection test based on type
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))

  const latency = Date.now() - startTime

  // Simulated success for demo purposes
  // In production, actual connection tests would be performed
  const mockResults: Record<ConnectorType, { success: boolean; message: string; details?: Record<string, unknown> }> = {
    POSTGRESQL: {
      success: true,
      message: 'Successfully connected to PostgreSQL database',
      details: { version: 'PostgreSQL 15.2', database: config.database },
    },
    MYSQL: {
      success: true,
      message: 'Successfully connected to MySQL database',
      details: { version: 'MySQL 8.0.32', database: config.database },
    },
    BIGQUERY: {
      success: true,
      message: 'Successfully authenticated with BigQuery',
      details: { projectId: config.projectId, datasets: 3 },
    },
    SNOWFLAKE: {
      success: true,
      message: 'Successfully connected to Snowflake',
      details: { account: config.account, warehouse: config.warehouse },
    },
    REDSHIFT: {
      success: true,
      message: 'Successfully connected to Redshift',
      details: { database: config.database, nodes: 2 },
    },
    MONGODB: {
      success: true,
      message: 'Successfully connected to MongoDB',
      details: { database: config.database, collections: 12 },
    },
    ELASTICSEARCH: {
      success: true,
      message: 'Successfully connected to Elasticsearch',
      details: { version: '8.8.0', indices: 5 },
    },
    S3: {
      success: true,
      message: 'Successfully connected to S3 bucket',
      details: { bucket: config.bucket, objects: 1250 },
    },
    AZURE_BLOB: {
      success: true,
      message: 'Successfully connected to Azure Blob Storage',
      details: { container: config.container, blobs: 850 },
    },
    GOOGLE_SHEETS: {
      success: true,
      message: 'Successfully connected to Google Sheets',
      details: { spreadsheetId: config.spreadsheetId, sheets: 3 },
    },
    SALESFORCE: {
      success: true,
      message: 'Successfully authenticated with Salesforce',
      details: { instance: config.instanceUrl, objects: 45 },
    },
    HUBSPOT: {
      success: true,
      message: 'Successfully authenticated with HubSpot',
      details: { portalId: '12345678' },
    },
    STRIPE: {
      success: true,
      message: 'Successfully authenticated with Stripe',
      details: { mode: 'test', accountId: 'acct_12345' },
    },
    CUSTOM: {
      success: true,
      message: 'Successfully connected to custom endpoint',
      details: { endpoint: config.endpoint },
    },
  }

  return {
    ...mockResults[type],
    latency,
  }
}
