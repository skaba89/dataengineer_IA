/**
 * DataSphere Innovation - Sentry Tunnel Endpoint
 * Proxies client-side events to Sentry to avoid ad-blockers
 */

import { NextRequest, NextResponse } from 'next/server'

// Sentry's ingest endpoint
const SENTRY_INGEST_URL = 'https://o4506999999999999.ingest.sentry.io'

export async function POST(request: NextRequest) {
  // Check if Sentry is configured
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  
  if (!dsn) {
    return NextResponse.json(
      { error: 'Sentry not configured' },
      { status: 503 }
    )
  }

  try {
    // Parse the incoming envelope
    const envelope = await request.text()
    
    if (!envelope) {
      return NextResponse.json(
        { error: 'Empty envelope' },
        { status: 400 }
      )
    }

    // Extract the DSN host and project ID
    const dsnUrl = new URL(dsn)
    const projectId = dsnUrl.pathname.replace('/', '')
    
    // Forward to Sentry
    const response = await fetch(`${SENTRY_INGEST_URL}/${projectId}/envelope/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${dsnUrl.username}, sentry_client=sentry-tunnel/1.0`,
      },
      body: envelope,
    })

    if (!response.ok) {
      console.error('[Sentry Tunnel] Failed to forward event:', response.status)
      return NextResponse.json(
        { error: 'Failed to forward to Sentry' },
        { status: response.status }
      )
    }

    return new NextResponse(null, { status: 200 })
    
  } catch (error) {
    console.error('[Sentry Tunnel] Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Sentry-Auth',
      'Access-Control-Max-Age': '86400',
    },
  })
}
