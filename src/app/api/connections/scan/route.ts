// AI Data Engineering System - Schema Scan API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { PostgreSQLConnector } from '@/lib/connectors/database';

// POST /api/connections/scan - Scan database schema
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
    const { dataSourceId, connectionString, host, port, database, user, password, scanType } = body;

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

    // Connect and scan
    const connector = new PostgreSQLConnector({
      type: 'postgresql',
      connectionString,
      host: host || dataSource.host || undefined,
      port: port || dataSource.port || 5432,
      database: database || dataSource.database || undefined,
      user,
      password,
    });

    const connected = await connector.connect();
    if (!connected) {
      return NextResponse.json(
        { success: false, error: 'Failed to connect to database' },
        { status: 400 }
      );
    }

    let result;

    switch (scanType) {
      case 'tables':
        // Get all tables
        const tables = await connector.getTables();
        result = { tables, count: tables.length };
        
        // Store tables in database
        for (const table of tables) {
          await db.sourceTable.upsert({
            where: {
              id: `${dataSourceId}_${table.schema || 'public'}_${table.tableName}`,
            },
            create: {
              id: `${dataSourceId}_${table.schema || 'public'}_${table.tableName}`,
              name: table.tableName,
              schema: table.schema,
              columns: JSON.stringify(table.columns),
              rowCount: table.rowCount,
              dataSourceId,
            },
            update: {
              columns: JSON.stringify(table.columns),
              rowCount: table.rowCount,
            },
          });
        }
        break;

      case 'profile':
        // Profile a specific table
        const tableName = body.tableName;
        const schemaName = body.schema || 'public';
        const profile = await connector.profileTable(tableName, schemaName);
        result = { profile };
        break;

      case 'schema':
        // Get detailed schema for a table
        const table = body.tableName;
        const schema = body.schema || 'public';
        const tableSchema = await connector.getTableSchema(table, schema);
        result = { schema: tableSchema };
        break;

      default:
        // Full scan
        const allTables = await connector.getTables();
        
        // Store all tables
        for (const table of allTables) {
          const rowCount = await connector.getRowCount(table.tableName, table.schema);
          
          await db.sourceTable.upsert({
            where: {
              id: `${dataSourceId}_${table.schema || 'public'}_${table.tableName}`,
            },
            create: {
              id: `${dataSourceId}_${table.schema || 'public'}_${table.tableName}`,
              name: table.tableName,
              schema: table.schema,
              columns: JSON.stringify(table.columns),
              rowCount,
              dataSourceId,
            },
            update: {
              columns: JSON.stringify(table.columns),
              rowCount,
            },
          });
        }

        // Update data source
        await db.dataSource.update({
          where: { id: dataSourceId },
          data: {
            status: 'connected',
            lastSync: new Date(),
            metadata: JSON.stringify({
              tableCount: allTables.length,
              lastScan: new Date().toISOString(),
            }),
          },
        });

        result = { 
          tables: allTables, 
          count: allTables.length,
          message: `Scanned ${allTables.length} tables successfully` 
        };
    }

    await connector.disconnect();

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    );
  }
}
