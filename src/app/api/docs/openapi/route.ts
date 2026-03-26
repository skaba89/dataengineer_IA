// OpenAPI Documentation API Endpoint
import { NextRequest, NextResponse } from 'next/server'
import { generateOpenAPISpec, getOpenAPIJson } from '@/lib/api-docs/openapi-spec'

// GET /api/docs/openapi - Get OpenAPI specification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') || 'json'
  
  // Get base URL from request or environment
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}://${host}/api`
  
  if (format === 'yaml') {
    // Return YAML format (simplified - in production use js-yaml)
    const spec = generateOpenAPISpec(baseUrl)
    return new NextResponse(JSON.stringify(spec, null, 2), {
      headers: {
        'Content-Type': 'application/yaml',
        'Content-Disposition': 'attachment; filename="openapi.yaml"',
      },
    })
  }
  
  // Return JSON format (default)
  const jsonSpec = getOpenAPIJson(baseUrl)
  return new NextResponse(jsonSpec, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
