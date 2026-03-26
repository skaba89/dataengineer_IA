/**
 * DataSphere Innovation - Monitoring & Observability System
 * Production-ready metrics, health checks, and performance monitoring
 */

import { db } from '@/lib/db'

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface MetricValue {
  name: string
  value: number
  timestamp: Date
  labels: Record<string, string>
  type: 'counter' | 'gauge' | 'histogram' | 'summary'
}

export interface HealthCheckResult {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  message?: string
  details?: Record<string, unknown>
  timestamp: Date
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: HealthCheckResult[]
  uptime: number
  version: string
  timestamp: Date
}

export interface PerformanceMetrics {
  requestCount: number
  errorCount: number
  avgResponseTime: number
  p50ResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  throughput: number
}

export interface AlertConfig {
  name: string
  condition: (metrics: MetricValue[]) => boolean
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  cooldown: number // seconds
  channels: ('email' | 'slack' | 'pagerduty' | 'webhook')[]
}

export interface Alert {
  id: string
  name: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  metadata: Record<string, unknown>
}

// ============================================================================
// Metrics Collector
// ============================================================================

class MetricsCollector {
  private metrics: Map<string, MetricValue[]> = new Map()
  private counters: Map<string, number> = new Map()
  private gauges: Map<string, number> = new Map()
  private histograms: Map<string, number[]> = new Map()
  private maxDataPoints = 1000
  private retentionMs = 3600000 // 1 hour

  incrementCounter(name: string, labels: Record<string, string> = {}, value: number = 1): void {
    const key = this.getMetricKey(name, labels)
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + value)
    
    this.recordMetric({
      name,
      value: current + value,
      timestamp: new Date(),
      labels,
      type: 'counter',
    })
  }

  setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels)
    this.gauges.set(key, value)
    
    this.recordMetric({
      name,
      value,
      timestamp: new Date(),
      labels,
      type: 'gauge',
    })
  }

  observeHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels)
    const values = this.histograms.get(key) || []
    values.push(value)
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift()
    }
    this.histograms.set(key, values)
    
    this.recordMetric({
      name,
      value,
      timestamp: new Date(),
      labels,
      type: 'histogram',
    })
  }

  getCounter(name: string, labels: Record<string, string> = {}): number {
    const key = this.getMetricKey(name, labels)
    return this.counters.get(key) || 0
  }

  getGauge(name: string, labels: Record<string, string> = {}): number {
    const key = this.getMetricKey(name, labels)
    return this.gauges.get(key) || 0
  }

  getHistogramStats(name: string, labels: Record<string, string> = {}): {
    count: number
    sum: number
    avg: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
  } | null {
    const key = this.getMetricKey(name, labels)
    const values = this.histograms.get(key)
    
    if (!values || values.length === 0) {
      return null
    }

    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)

    return {
      count: values.length,
      sum,
      avg: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    }
  }

  getMetrics(name?: string): MetricValue[] {
    if (name) {
      return this.metrics.get(name) || []
    }
    
    const allMetrics: MetricValue[] = []
    this.metrics.forEach(values => {
      allMetrics.push(...values)
    })
    return allMetrics
  }

  private getMetricKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')
    return `${name}{${labelStr}}`
  }

  private recordMetric(metric: MetricValue): void {
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, [])
    }
    
    const values = this.metrics.get(metric.name)!
    values.push(metric)
    
    // Cleanup old metrics
    if (values.length > this.maxDataPoints) {
      const cutoff = new Date(Date.now() - this.retentionMs)
      const filtered = values.filter(v => v.timestamp >= cutoff)
      this.metrics.set(metric.name, filtered.slice(-this.maxDataPoints))
    }
  }

  reset(): void {
    this.metrics.clear()
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
  }
}

// ============================================================================
// Health Check System
// ============================================================================

class HealthCheckSystem {
  private checks: Map<string, () => Promise<HealthCheckResult>> = new Map()
  private lastResults: Map<string, HealthCheckResult> = new Map()

  registerCheck(name: string, checkFn: () => Promise<HealthCheckResult>): void {
    this.checks.set(name, checkFn)
  }

  async runCheck(name: string): Promise<HealthCheckResult> {
    const checkFn = this.checks.get(name)
    if (!checkFn) {
      return {
        name,
        status: 'unhealthy',
        latency: 0,
        message: 'Check not found',
        timestamp: new Date(),
      }
    }

    const startTime = Date.now()
    try {
      const result = await checkFn()
      result.latency = Date.now() - startTime
      this.lastResults.set(name, result)
      return result
    } catch (error) {
      const result: HealthCheckResult = {
        name,
        status: 'unhealthy',
        latency: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      }
      this.lastResults.set(name, result)
      return result
    }
  }

  async runAllChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = []
    for (const name of this.checks.keys()) {
      results.push(await this.runCheck(name))
    }
    return results
  }

  getLastResult(name: string): HealthCheckResult | undefined {
    return this.lastResults.get(name)
  }

  getCheckNames(): string[] {
    return Array.from(this.checks.keys())
  }
}

// ============================================================================
// Alert Manager
// ============================================================================

class AlertManager {
  private alerts: Map<string, Alert> = new Map()
  private configs: Map<string, AlertConfig> = new Map()
  private lastTriggered: Map<string, number> = new Map()

  configureAlert(config: AlertConfig): void {
    this.configs.set(config.name, config)
  }

  async evaluateAlerts(metrics: MetricValue[]): Promise<Alert[]> {
    const triggered: Alert[] = []
    const now = Date.now()

    for (const [name, config] of this.configs) {
      const lastTrigger = this.lastTriggered.get(name) || 0
      
      // Check cooldown
      if (now - lastTrigger < config.cooldown * 1000) {
        continue
      }

      // Evaluate condition
      const relevantMetrics = metrics.filter(m => m.name.startsWith(name.split('.')[0]))
      
      try {
        if (config.condition(relevantMetrics)) {
          const alert: Alert = {
            id: `alert-${name}-${now}`,
            name,
            severity: config.severity,
            message: config.message,
            timestamp: new Date(),
            resolved: false,
            metadata: { metrics: relevantMetrics.slice(-10) },
          }

          this.alerts.set(alert.id, alert)
          this.lastTriggered.set(name, now)
          triggered.push(alert)

          // Send notifications
          await this.sendNotifications(alert, config)
        }
      } catch (error) {
        console.error(`Alert evaluation error for ${name}:`, error)
      }
    }

    return triggered
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = new Date()
    }
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(a => !a.resolved)
  }

  getAllAlerts(limit: number = 100): Alert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  private async sendNotifications(alert: Alert, config: AlertConfig): Promise<void> {
    for (const channel of config.channels) {
      try {
        switch (channel) {
          case 'email':
            console.log(`[EMAIL ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`)
            // await EmailService.sendAlert(alert)
            break
          case 'slack':
            console.log(`[SLACK ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`)
            // await SlackService.sendAlert(alert)
            break
          case 'pagerduty':
            console.log(`[PAGERDUTY ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`)
            // await PagerDutyService.sendAlert(alert)
            break
          case 'webhook':
            console.log(`[WEBHOOK ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`)
            // await fetch(config.webhookUrl, { method: 'POST', body: JSON.stringify(alert) })
            break
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error)
      }
    }
  }
}

// ============================================================================
// Monitoring Service
// ============================================================================

export class MonitoringService {
  private static metrics = new MetricsCollector()
  private static healthChecks = new HealthCheckSystem()
  private static alerts = new AlertManager()
  private static startTime = Date.now()
  private static version = '0.2.0'

  // Initialize default health checks
  static initialize(): void {
    // Database health check
    this.healthChecks.registerCheck('database', async () => {
      const start = Date.now()
      try {
        await db.$queryRaw`SELECT 1`
        return {
          name: 'database',
          status: 'healthy' as const,
          latency: Date.now() - start,
          message: 'Database connection successful',
          timestamp: new Date(),
        }
      } catch (error) {
        return {
          name: 'database',
          status: 'unhealthy' as const,
          latency: Date.now() - start,
          message: `Database error: ${error instanceof Error ? error.message : 'Unknown'}`,
          timestamp: new Date(),
        }
      }
    })

    // Memory health check
    this.healthChecks.registerCheck('memory', async () => {
      const memUsage = process.memoryUsage()
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024
      const usagePercent = (heapUsedMB / heapTotalMB) * 100

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (usagePercent > 90) {
        status = 'unhealthy'
      } else if (usagePercent > 75) {
        status = 'degraded'
      }

      return {
        name: 'memory',
        status,
        latency: 0,
        message: `Memory usage: ${usagePercent.toFixed(1)}%`,
        details: {
          heapUsedMB: Math.round(heapUsedMB),
          heapTotalMB: Math.round(heapTotalMB),
          usagePercent: Math.round(usagePercent * 10) / 10,
        },
        timestamp: new Date(),
      }
    })

    // Response time health check
    this.healthChecks.registerCheck('response_time', async () => {
      const stats = this.metrics.getHistogramStats('http_request_duration')
      
      if (!stats) {
        return {
          name: 'response_time',
          status: 'healthy' as const,
          latency: 0,
          message: 'No request data yet',
          timestamp: new Date(),
        }
      }

      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (stats.p95 > 2000) {
        status = 'unhealthy'
      } else if (stats.p95 > 1000) {
        status = 'degraded'
      }

      return {
        name: 'response_time',
        status,
        latency: stats.avg,
        message: `P95: ${stats.p95.toFixed(0)}ms, Avg: ${stats.avg.toFixed(0)}ms`,
        details: stats,
        timestamp: new Date(),
      }
    })

    // Error rate health check
    this.healthChecks.registerCheck('error_rate', async () => {
      const total = this.metrics.getCounter('http_requests_total')
      const errors = this.metrics.getCounter('http_requests_errors')
      
      if (total === 0) {
        return {
          name: 'error_rate',
          status: 'healthy' as const,
          latency: 0,
          message: 'No requests yet',
          timestamp: new Date(),
        }
      }

      const errorRate = (errors / total) * 100
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      if (errorRate > 5) {
        status = 'unhealthy'
      } else if (errorRate > 1) {
        status = 'degraded'
      }

      return {
        name: 'error_rate',
        status,
        latency: 0,
        message: `Error rate: ${errorRate.toFixed(2)}%`,
        details: { total, errors, errorRate },
        timestamp: new Date(),
      }
    })

    // Configure default alerts
    this.alerts.configureAlert({
      name: 'high_error_rate',
      condition: (metrics) => {
        const total = metrics.find(m => m.name === 'http_requests_total')?.value || 0
        const errors = metrics.find(m => m.name === 'http_requests_errors')?.value || 0
        return total > 0 && (errors / total) > 0.05
      },
      severity: 'critical',
      message: 'Error rate exceeds 5%',
      cooldown: 300,
      channels: ['slack', 'email'],
    })

    this.alerts.configureAlert({
      name: 'high_latency',
      condition: (metrics) => {
        const latest = metrics[metrics.length - 1]
        return latest?.value > 2000
      },
      severity: 'warning',
      message: 'P95 latency exceeds 2 seconds',
      cooldown: 300,
      channels: ['slack'],
    })

    this.alerts.configureAlert({
      name: 'memory_high',
      condition: (metrics) => {
        const latest = metrics[metrics.length - 1]
        return latest?.value > 85
      },
      severity: 'warning',
      message: 'Memory usage exceeds 85%',
      cooldown: 600,
      channels: ['slack', 'email'],
    })
  }

  // Metrics methods
  static incrementCounter(name: string, labels?: Record<string, string>): void {
    this.metrics.incrementCounter(name, labels)
  }

  static setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.metrics.setGauge(name, value, labels)
  }

  static observeHistogram(name: string, value: number, labels?: Record<string, string>): void {
    this.metrics.observeHistogram(name, value, labels)
  }

  static getMetrics(name?: string): MetricValue[] {
    return this.metrics.getMetrics(name)
  }

  static getHistogramStats(name: string, labels?: Record<string, string>) {
    return this.metrics.getHistogramStats(name, labels)
  }

  // Health check methods
  static async getHealth(): Promise<SystemHealth> {
    const checks = await this.healthChecks.runAllChecks()
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length
    const degradedCount = checks.filter(c => c.status === 'degraded').length

    if (unhealthyCount > 0) {
      status = 'unhealthy'
    } else if (degradedCount > 0) {
      status = 'degraded'
    }

    return {
      status,
      checks,
      uptime: Date.now() - this.startTime,
      version: this.version,
      timestamp: new Date(),
    }
  }

  static async runHealthCheck(name: string): Promise<HealthCheckResult> {
    return this.healthChecks.runCheck(name)
  }

  // Alert methods
  static configureAlert(config: AlertConfig): void {
    this.alerts.configureAlert(config)
  }

  static async evaluateAlerts(): Promise<Alert[]> {
    const metrics = this.metrics.getMetrics()
    return this.alerts.evaluateAlerts(metrics)
  }

  static getActiveAlerts(): Alert[] {
    return this.alerts.getActiveAlerts()
  }

  static resolveAlert(alertId: string): void {
    this.alerts.resolveAlert(alertId)
  }

  // HTTP Request tracking helper
  static trackHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number
  ): void {
    const labels = { method, path, status: statusCode.toString() }
    
    this.metrics.incrementCounter('http_requests_total', labels)
    
    if (statusCode >= 400) {
      this.metrics.incrementCounter('http_requests_errors', labels)
    }
    
    this.metrics.observeHistogram('http_request_duration', durationMs, labels)
  }

  // Performance metrics helper
  static getPerformanceMetrics(): PerformanceMetrics {
    const stats = this.metrics.getHistogramStats('http_request_duration') || {
      count: 0,
      avg: 0,
      p50: 0,
      p95: 0,
      p99: 0,
    }
    
    const total = this.metrics.getCounter('http_requests_total')
    const errors = this.metrics.getCounter('http_requests_errors')
    
    return {
      requestCount: total,
      errorCount: errors,
      avgResponseTime: stats.avg,
      p50ResponseTime: stats.p50,
      p95ResponseTime: stats.p95,
      p99ResponseTime: stats.p99,
      throughput: total / Math.max(1, (Date.now() - this.startTime) / 1000),
    }
  }

  // Prometheus-compatible metrics export
  static exportPrometheusMetrics(): string {
    const lines: string[] = []
    
    // Counters
    this.metrics.getMetrics()
      .filter(m => m.type === 'counter')
      .forEach(m => {
        const labels = Object.entries(m.labels)
          .map(([k, v]) => `${k}="${v}"`)
          .join(',')
        lines.push(`${m.name}{${labels}} ${m.value}`)
      })
    
    // Gauges
    this.metrics.getMetrics()
      .filter(m => m.type === 'gauge')
      .forEach(m => {
        const labels = Object.entries(m.labels)
          .map(([k, v]) => `${k}="${v}"`)
          .join(',')
        lines.push(`${m.name}{${labels}} ${m.value}`)
      })
    
    // Histograms
    const histogramNames = new Set(
      this.metrics.getMetrics()
        .filter(m => m.type === 'histogram')
        .map(m => m.name)
    )
    
    histogramNames.forEach(name => {
      const stats = this.metrics.getHistogramStats(name)
      if (stats) {
        lines.push(`${name}_count ${stats.count}`)
        lines.push(`${name}_sum ${stats.sum}`)
        lines.push(`${name}_bucket{le="50"} ${stats.p50}`)
        lines.push(`${name}_bucket{le="95"} ${stats.p95}`)
        lines.push(`${name}_bucket{le="99"} ${stats.p99}`)
      }
    })

    return lines.join('\n')
  }
}

// Initialize on import
MonitoringService.initialize()

// ============================================================================
// Exports
// ============================================================================

export { MetricsCollector, HealthCheckSystem, AlertManager }
export default MonitoringService
