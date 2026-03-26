/**
 * Health Check API Endpoint
 * GET /api/health - Returns system health status
 */

import { NextRequest, NextResponse } from 'next/server'
import { MonitoringService } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const health = await MonitoringService.getHealth()
    const responseTime = Date.now() - startTime
    
    // Track this request
    MonitoringService.trackHttpRequest(
      'GET',
      '/api/health',
      health.status === 'healthy' ? 200 : 503,
      responseTime
    )
    
    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Response-Time': `${responseTime}ms`,
      },
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    MonitoringService.trackHttpRequest('GET', '/api/health', 500, responseTime)
    
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date(),
    }, { status: 500 })
  }
}
