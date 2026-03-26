/**
 * Metrics API Endpoint
 * GET /api/metrics - Returns Prometheus-compatible metrics
 * GET /api/metrics?format=json - Returns JSON metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { MonitoringService } from '@/lib/monitoring'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const format = request.nextUrl.searchParams.get('format') || 'prometheus'
  
  try {
    if (format === 'json') {
      const performance = MonitoringService.getPerformanceMetrics()
      const activeAlerts = MonitoringService.getActiveAlerts()
      
      const responseTime = Date.now() - startTime
      MonitoringService.trackHttpRequest('GET', '/api/metrics', 200, responseTime)
      
      return NextResponse.json({
        performance,
        activeAlerts,
        timestamp: new Date(),
      })
    }
    
    // Prometheus format
    const prometheusMetrics = MonitoringService.exportPrometheusMetrics()
    const responseTime = Date.now() - startTime
    
    MonitoringService.trackHttpRequest('GET', '/api/metrics', 200, responseTime)
    
    return new NextResponse(prometheusMetrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    MonitoringService.trackHttpRequest('GET', '/api/metrics', 500, responseTime)
    
    return NextResponse.json({
      error: 'Failed to retrieve metrics',
      timestamp: new Date(),
    }, { status: 500 })
  }
}
