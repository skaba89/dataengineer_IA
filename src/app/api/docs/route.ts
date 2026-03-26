/**
 * OpenAPI Specification Endpoint
 * Serves the complete OpenAPI 3.1.0 specification for DataSphere Innovation API
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateOpenAPISpec } from '@/lib/api/openapi'

/**
 * GET /api/docs
 * Returns the OpenAPI specification in JSON format
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'

  // Determine base URL from request headers
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}://${host}/api`

  const spec = generateOpenAPISpec(baseUrl)

  if (format === 'yaml') {
    // Return as YAML-like format (simplified)
    return new NextResponse(JSON.stringify(spec, null, 2), {
      headers: {
        'Content-Type': 'application/yaml',
        'Content-Disposition': 'attachment; filename="openapi.yaml"',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // Default: return JSON
  return new NextResponse(JSON.stringify(spec, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

/**
 * OPTIONS /api/docs
 * CORS preflight handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
