/**
 * DataSphere Innovation - Monitoring Tests
 * Unit tests for monitoring and metrics module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ============================================================================
// Monitoring Service Tests
// ============================================================================

describe('MonitoringService', () => {
  let MonitoringService: any
  let monitoring: any

  beforeEach(async () => {
    vi.resetModules()
    const module = await import('../../lib/monitoring/index')
    MonitoringService = module.MonitoringService
    monitoring = MonitoringService.getInstance()
  })

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = MonitoringService.getInstance()
      const instance2 = MonitoringService.getInstance()
      
      expect(instance1).toBe(instance2)
    })
  })

  describe('Metrics Collection', () => {
    it('should record metrics', () => {
      monitoring.recordMetric('test_metric', 42, { tag: 'value' })
      
      const metrics = monitoring.getMetrics()
      expect(metrics['test_metric']).toBeDefined()
    })

    it('should aggregate counter metrics', () => {
      monitoring.incrementCounter('requests_total', 1)
      monitoring.incrementCounter('requests_total', 2)
      
      const value = monitoring.getCounter('requests_total')
      expect(value).toBe(3)
    })

    it('should track histogram metrics', () => {
      monitoring.recordHistogram('response_time', 100)
      monitoring.recordHistogram('response_time', 200)
      monitoring.recordHistogram('response_time', 300)
      
      const stats = monitoring.getHistogramStats('response_time')
      expect(stats.count).toBe(3)
      expect(stats.avg).toBe(200)
    })
  })

  describe('Health Checks', () => {
    it('should register health check', () => {
      monitoring.registerHealthCheck('test_check', async () => ({
        status: 'healthy',
        message: 'Test check passed',
      }))
      
      const checks = monitoring.getHealthChecks()
      expect(checks).toContain('test_check')
    })

    it('should run health checks', async () => {
      monitoring.registerHealthCheck('passing_check', async () => ({
        status: 'healthy',
        message: 'Check passed',
      }))
      
      const results = await monitoring.runHealthChecks()
      
      expect(results['passing_check']).toBeDefined()
      expect(results['passing_check'].status).toBe('healthy')
    })

    it('should handle failing health checks', async () => {
      monitoring.registerHealthCheck('failing_check', async () => ({
        status: 'unhealthy',
        message: 'Check failed',
      }))
      
      const results = await monitoring.runHealthChecks()
      
      expect(results['failing_check'].status).toBe('unhealthy')
    })
  })

  describe('Alerting', () => {
    it('should define alert rules', () => {
      monitoring.defineAlertRule({
        name: 'high_error_rate',
        condition: (metrics: any) => metrics.error_rate > 0.05,
        severity: 'critical',
        message: 'Error rate exceeds 5%',
      })
      
      const rules = monitoring.getAlertRules()
      expect(rules.length).toBeGreaterThan(0)
    })

    it('should trigger alerts', () => {
      let alertTriggered = false
      
      monitoring.defineAlertRule({
        name: 'test_alert',
        condition: () => true,
        severity: 'warning',
        message: 'Test alert',
        onTrigger: () => { alertTriggered = true },
      })
      
      monitoring.checkAlerts()
      
      expect(alertTriggered).toBe(true)
    })
  })

  describe('Prometheus Export', () => {
    it('should export metrics in Prometheus format', () => {
      monitoring.recordMetric('test_gauge', 100)
      monitoring.incrementCounter('test_counter', 5)
      
      const output = monitoring.exportPrometheus()
      
      expect(output).toContain('# TYPE')
      expect(output).toContain('# HELP')
      expect(output).toContain('test_gauge')
      expect(output).toContain('test_counter')
    })

    it('should include metric labels', () => {
      monitoring.recordMetric('labeled_metric', 42, { env: 'test', service: 'api' })
      
      const output = monitoring.exportPrometheus()
      
      expect(output).toContain('env="test"')
      expect(output).toContain('service="api"')
    })
  })
})

// ============================================================================
// Metrics Helpers Tests
// ============================================================================

describe('Metrics Helpers', () => {
  describe('formatMetricName', () => {
    it('should format metric names correctly', async () => {
      const { formatMetricName } = await import('../../lib/monitoring/index')
      
      expect(formatMetricName('Response Time')).toBe('response_time')
      expect(formatMetricName('API.Requests.Total')).toBe('api_requests_total')
    })
  })

  describe('calculatePercentile', () => {
    it('should calculate percentiles correctly', async () => {
      const { calculatePercentile } = await import('../../lib/monitoring/index')
      
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
      
      expect(calculatePercentile(values, 50)).toBe(50) // median
      expect(calculatePercentile(values, 95)).toBe(95)
      expect(calculatePercentile(values, 99)).toBe(99)
    })
  })
})

// ============================================================================
// Performance Monitoring Tests
// ============================================================================

describe('Performance Monitoring', () => {
  let monitoring: any

  beforeEach(async () => {
    const { MonitoringService } = await import('../../lib/monitoring/index')
    monitoring = MonitoringService.getInstance()
  })

  describe('Timing', () => {
    it('should measure execution time', async () => {
      const timer = monitoring.startTimer('operation')
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const duration = timer.end()
      
      expect(duration).toBeGreaterThan(90)
      expect(duration).toBeLessThan(200)
    })

    it('should record timing histogram', async () => {
      const timer = monitoring.startTimer('timed_operation')
      await new Promise(resolve => setTimeout(resolve, 50))
      timer.end()
      
      const stats = monitoring.getHistogramStats('timed_operation')
      expect(stats.count).toBeGreaterThan(0)
    })
  })

  describe('Memory Tracking', () => {
    it('should track memory usage', () => {
      const memUsage = monitoring.getMemoryUsage()
      
      expect(memUsage).toBeDefined()
      expect(memUsage.heapUsed).toBeGreaterThan(0)
      expect(memUsage.heapTotal).toBeGreaterThan(0)
      expect(memUsage.rss).toBeGreaterThan(0)
    })

    it('should detect memory leaks', () => {
      const baseline = monitoring.getMemoryUsage()
      
      // Simulate some operations
      for (let i = 0; i < 1000; i++) {
        monitoring.recordMetric(`temp_metric_${i}`, i)
      }
      
      const current = monitoring.getMemoryUsage()
      
      // Memory should not grow excessively
      expect(current.heapUsed).toBeLessThan(baseline.heapTotal * 2)
    })
  })
})

// ============================================================================
// Error Tracking Tests
// ============================================================================

describe('Error Tracking', () => {
  let monitoring: any

  beforeEach(async () => {
    const { MonitoringService } = await import('../../lib/monitoring/index')
    monitoring = MonitoringService.getInstance()
  })

  it('should track errors', () => {
    const error = new Error('Test error')
    monitoring.trackError(error, { context: 'test' })
    
    const errors = monitoring.getErrorCount()
    expect(errors).toBeGreaterThan(0)
  })

  it('should categorize errors', () => {
    monitoring.trackError(new Error('Network error'), { type: 'network' })
    monitoring.trackError(new Error('Validation error'), { type: 'validation' })
    
    const byType = monitoring.getErrorsByType()
    
    expect(byType['network']).toBeDefined()
    expect(byType['validation']).toBeDefined()
  })

  it('should track error frequency', () => {
    monitoring.trackError(new Error('Recurring error'))
    monitoring.trackError(new Error('Recurring error'))
    monitoring.trackError(new Error('Recurring error'))
    
    const frequent = monitoring.getFrequentErrors()
    
    expect(frequent.length).toBeGreaterThan(0)
    expect(frequent[0].count).toBe(3)
  })
})
