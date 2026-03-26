// AI Data Engineering System - Connections API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { PostgreSQLConnector, createConnector, parseConnectionString } from '@/lib/connectors/database';

// GET /api/connections - List data sources for a project
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get data sources for project
    const dataSources = await db.dataSource.findMany({
      where: { projectId },
      include: {
        tables: {
          take: 20,
        },
      },
    });

    return NextResponse.json({
      success: true,
      dataSources,
    });

  } catch (error) {
    console.error('Get connections error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch connections' },
      { status: 500 }
    );
  }
}

// POST /api/connections - Create new connection
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, name, type, connectionString, host, port, database, user, password } = body;

    if (!projectId || !name || !type) {
      return NextResponse.json(
        { success: false, error: 'Project ID, name and type are required' },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create data source
    const dataSource = await db.dataSource.create({
      data: {
        name,
        type,
        host: host || null,
        port: port || null,
        database: database || null,
        status: 'pending',
        metadata: JSON.stringify({
          hasConnectionString: !!connectionString,
          user: user || null,
          // Don't store password in metadata
        }),
        projectId,
      },
    });

    return NextResponse.json({
      success: true,
      dataSource,
      message: 'Data source created. Use /api/connections/test to verify connection.',
    });

  } catch (error) {
    console.error('Create connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create connection' },
      { status: 500 }
    );
  }
}

// Test connection
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dataSourceId, connectionString, host, port, database, user, password } = body;

    if (!dataSourceId) {
      return NextResponse.json(
        { success: false, error: 'Data source ID is required' },
        { status: 400 }
      );
    }

    // Get data source
    const dataSource = await db.dataSource.findUnique({
      where: { id: dataSourceId },
    });

    if (!dataSource) {
      return NextResponse.json(
        { success: false, error: 'Data source not found' },
        { status: 404 }
      );
    }

    // Test connection based on type
    let testResult;

    if (dataSource.type === 'postgresql') {
      const connector = new PostgreSQLConnector({
        type: 'postgresql',
        connectionString,
        host: host || dataSource.host || undefined,
        port: port || dataSource.port || undefined,
        database: database || dataSource.database || undefined,
        user,
        password,
      });

      const connected = await connector.connect();
      
      if (connected) {
        testResult = await connector.testConnection();
        await connector.disconnect();
      } else {
        testResult = { success: false, message: 'Failed to establish connection' };
      }
    } else {
      testResult = { success: false, message: `Connector for ${dataSource.type} not implemented` };
    }

    // Update data source status
    await db.dataSource.update({
      where: { id: dataSourceId },
      data: {
        status: testResult.success ? 'connected' : 'error',
        lastSync: testResult.success ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: testResult.success,
      message: testResult.message,
    });

  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Connection test failed' },
      { status: 500 }
    );
  }
}

// Delete connection
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dataSourceId = searchParams.get('dataSourceId');

    if (!dataSourceId) {
      return NextResponse.json(
        { success: false, error: 'Data source ID is required' },
        { status: 400 }
      );
    }

    await db.dataSource.delete({
      where: { id: dataSourceId },
    });

    return NextResponse.json({
      success: true,
      message: 'Data source deleted',
    });

  } catch (error) {
    console.error('Delete connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete connection' },
      { status: 500 }
    );
  }
}
