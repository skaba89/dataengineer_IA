// Advanced Data Quality Monitoring System
// Comprehensive data quality checks, monitoring, and alerting

export interface QualityTest {
  id: string
  name: string
  description?: string
  type: QualityTestType
  tableName: string
  columnName?: string
  config: QualityTestConfig
  schedule?: string // Cron expression
  enabled: boolean
  severity: 'critical' | 'warning' | 'info'
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export type QualityTestType = 
  | 'not_null'
  | 'unique'
  | 'unique_combination'
  | 'accepted_values'
  | 'range'
  | 'regex'
  | 'schema_change'
  | 'row_count'
  | 'freshness'
  | 'referential_integrity'
  | 'custom_sql'
  | 'anomaly_detection'
  | 'distribution'
  | 'null_percentage'
  | 'duplicate_check'

export interface QualityTestConfig {
  // For not_null
  allowNullPercentage?: number // Allow up to X% nulls

  // For unique
  ignoreNulls?: boolean

  // For accepted_values
  values?: (string | number | boolean)[]
  quoteValues?: boolean

  // For range
  minValue?: number
  maxValue?: number
  minDate?: string
  maxDate?: string

  // For regex
  pattern?: string
  flags?: string

  // For row_count
  minRows?: number
  maxRows?: number
  exactRows?: number
  compareToDate?: string // Compare to previous period

  // For freshness
  maxAge?: number // Maximum age in hours
  timestampColumn?: string

  // For referential_integrity
  referenceTable?: string
  referenceColumn?: string

  // For custom_sql
  sql?: string
  expectedValue?: number | string
  comparisonOperator?: '=' | '>' | '<' | '>=' | '<=' | '!=' | 'between' | 'in'

  // For anomaly_detection
  sensitivity?: 'low' | 'medium' | 'high'
  lookbackPeriod?: number // Days to look back
  threshold?: number // Standard deviations

  // For distribution
  distributionType?: 'normal' | 'uniform' | 'poisson'
  columns?: string[]

  // For null_percentage
  maxNullPercentage?: number

  // For duplicate_check
  groupByColumns?: string[]
  maxDuplicates?: number
}

export interface QualityTestResult {
  id: string
  testId: string
  status: 'passed' | 'failed' | 'warning' | 'error' | 'skipped'
  executedAt: Date
  duration: number // milliseconds
  recordsTested: number
  recordsFailed: number
  failurePercentage: number
  message: string
  details?: QualityTestDetails
  error?: string
}

export interface QualityTestDetails {
  expectedValue?: unknown
  actualValue?: unknown
  sampleFailures?: unknown[]
  statistics?: QualityStatistics
  anomalies?: AnomalyDetection[]
}

export interface QualityStatistics {
  count?: number
  nullCount?: number
  nullPercentage?: number
  distinctCount?: number
  min?: unknown
  max?: unknown
  avg?: number
  sum?: number
  stdDev?: number
  variance?: number
  median?: number
  mode?: unknown
  quartiles?: [number, number, number]
  histogram?: { bucket: string; count: number }[]
}

export interface AnomalyDetection {
  type: 'value' | 'trend' | 'distribution' | 'volume'
  description: string
  severity: 'critical' | 'warning' | 'info'
  confidence: number
  detectedAt: Date
  details?: Record<string, unknown>
}

export interface QualityAlert {
  id: string
  testId: string
  organizationId: string
  type: 'test_failure' | 'test_recovery' | 'anomaly_detected' | 'schema_change' | 'freshness_issue'
  severity: 'critical' | 'warning' | 'info'
  status: 'active' | 'acknowledged' | 'resolved'
  message: string
  details: Record<string, unknown>
  triggeredAt: Date
  acknowledgedAt?: Date
  acknowledgedBy?: string
  resolvedAt?: Date
  notificationSent: boolean
}

export interface QualityDashboard {
  organizationId: string
  overallScore: number // 0-100
  testCounts: {
    total: number
    passed: number
    failed: number
    warning: number
    error: number
  }
  trendData: {
    date: string
    score: number
    passed: number
    failed: number
  }[]
  topFailures: QualityTestResult[]
  recentAlerts: QualityAlert[]
  testsByTable: Record<string, { total: number; passed: number; failed: number }>
  testsBySeverity: Record<string, { total: number; passed: number; failed: number }>
}

// Quality Test Execution Engine
export class QualityTestEngine {
  async executeTest(test: QualityTest, connection: unknown): Promise<QualityTestResult> {
    const startTime = Date.now()
    
    try {
      let result: Partial<QualityTestResult>

      switch (test.type) {
        case 'not_null':
          result = await this.executeNotNullTest(test, connection)
          break
        case 'unique':
          result = await this.executeUniqueTest(test, connection)
          break
        case 'accepted_values':
          result = await this.executeAcceptedValuesTest(test, connection)
          break
        case 'range':
          result = await this.executeRangeTest(test, connection)
          break
        case 'regex':
          result = await this.executeRegexTest(test, connection)
          break
        case 'row_count':
          result = await this.executeRowCountTest(test, connection)
          break
        case 'freshness':
          result = await this.executeFreshnessTest(test, connection)
          break
        case 'referential_integrity':
          result = await this.executeReferentialIntegrityTest(test, connection)
          break
        case 'custom_sql':
          result = await this.executeCustomSqlTest(test, connection)
          break
        case 'anomaly_detection':
          result = await this.executeAnomalyDetectionTest(test, connection)
          break
        case 'null_percentage':
          result = await this.executeNullPercentageTest(test, connection)
          break
        case 'duplicate_check':
          result = await this.executeDuplicateCheckTest(test, connection)
          break
        default:
          throw new Error(`Unknown test type: ${test.type}`)
      }

      return {
        id: `result_${Date.now()}`,
        testId: test.id,
        status: result.status || 'passed',
        executedAt: new Date(),
        duration: Date.now() - startTime,
        recordsTested: result.recordsTested || 0,
        recordsFailed: result.recordsFailed || 0,
        failurePercentage: result.recordsTested && result.recordsFailed 
          ? (result.recordsFailed / result.recordsTested) * 100 
          : 0,
        message: result.message || 'Test passed',
        details: result.details,
      }
    } catch (error) {
      return {
        id: `result_${Date.now()}`,
        testId: test.id,
        status: 'error',
        executedAt: new Date(),
        duration: Date.now() - startTime,
        recordsTested: 0,
        recordsFailed: 0,
        failurePercentage: 0,
        message: 'Test execution failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async executeNotNullTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { allowNullPercentage = 0 } = test.config
    const column = test.columnName!
    
    // Mock implementation - in production, execute actual SQL
    const sql = `
      SELECT 
        COUNT(*) as total,
        COUNT(${column}) as non_null,
        COUNT(*) - COUNT(${column}) as null_count
      FROM ${test.tableName}
    `
    
    // Simulated result
    const total = 10000
    const nullCount = 50
    const nullPercentage = (nullCount / total) * 100
    const passed = nullPercentage <= allowNullPercentage

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: total,
      recordsFailed: nullCount,
      message: passed 
        ? `Null check passed. ${nullPercentage.toFixed(2)}% null values (limit: ${allowNullPercentage}%)`
        : `Null check failed. ${nullPercentage.toFixed(2)}% null values exceeds limit of ${allowNullPercentage}%`,
      details: {
        statistics: {
          count: total,
          nullCount,
          nullPercentage,
        },
      },
    }
  }

  private async executeUniqueTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { ignoreNulls = true } = test.config
    const column = test.columnName!

    // Mock implementation
    const total = 10000
    const duplicates = 5
    const passed = duplicates === 0

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: total,
      recordsFailed: duplicates,
      message: passed 
        ? `Uniqueness check passed. All values in ${column} are unique.`
        : `Uniqueness check failed. Found ${duplicates} duplicate values in ${column}.`,
      details: {
        statistics: {
          count: total,
          distinctCount: total - duplicates,
        },
      },
    }
  }

  private async executeAcceptedValuesTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { values = [] } = test.config
    const column = test.columnName!

    // Mock implementation
    const total = 10000
    const invalid = 15
    const passed = invalid === 0

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: total,
      recordsFailed: invalid,
      message: passed
        ? `Accepted values check passed. All values in ${column} are in the accepted list.`
        : `Accepted values check failed. Found ${invalid} rows with invalid values in ${column}.`,
      details: {
        expectedValue: values,
      },
    }
  }

  private async executeRangeTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { minValue, maxValue } = test.config
    const column = test.columnName!

    // Mock implementation
    const total = 10000
    const outOfRange = 3
    const passed = outOfRange === 0

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: total,
      recordsFailed: outOfRange,
      message: passed
        ? `Range check passed. All values in ${column} are within range [${minValue}, ${maxValue}].`
        : `Range check failed. Found ${outOfRange} values outside range [${minValue}, ${maxValue}].`,
      details: {
        expectedValue: `[${minValue}, ${maxValue}]`,
      },
    }
  }

  private async executeRegexTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { pattern } = test.config
    const column = test.columnName!

    // Mock implementation
    const total = 10000
    const invalid = 8
    const passed = invalid === 0

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: total,
      recordsFailed: invalid,
      message: passed
        ? `Regex check passed. All values in ${column} match pattern ${pattern}.`
        : `Regex check failed. Found ${invalid} values not matching pattern ${pattern}.`,
      details: {
        expectedValue: pattern,
      },
    }
  }

  private async executeRowCountTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { minRows, maxRows, exactRows } = test.config

    // Mock implementation
    const count = 50000
    let passed = true
    let message = `Row count: ${count}`

    if (exactRows !== undefined) {
      passed = count === exactRows
      message = passed 
        ? `Row count matches expected value: ${count}`
        : `Row count ${count} does not match expected ${exactRows}`
    } else if (minRows !== undefined && maxRows !== undefined) {
      passed = count >= minRows && count <= maxRows
      message = passed
        ? `Row count ${count} is within expected range [${minRows}, ${maxRows}]`
        : `Row count ${count} is outside expected range [${minRows}, ${maxRows}]`
    } else if (minRows !== undefined) {
      passed = count >= minRows
      message = passed
        ? `Row count ${count} meets minimum of ${minRows}`
        : `Row count ${count} is below minimum ${minRows}`
    }

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: count,
      recordsFailed: passed ? 0 : 1,
      message,
      details: {
        actualValue: count,
        expectedValue: exactRows ?? (minRows !== undefined && maxRows !== undefined ? `[${minRows}, ${maxRows}]` : minRows),
      },
    }
  }

  private async executeFreshnessTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { maxAge = 24, timestampColumn } = test.config

    // Mock implementation
    const lastUpdate = new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
    const ageInHours = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
    const passed = ageInHours <= maxAge

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: 1,
      recordsFailed: passed ? 0 : 1,
      message: passed
        ? `Freshness check passed. Data is ${ageInHours.toFixed(1)} hours old (max: ${maxAge}h).`
        : `Freshness check failed. Data is ${ageInHours.toFixed(1)} hours old, exceeds max of ${maxAge}h.`,
      details: {
        actualValue: `${ageInHours.toFixed(1)} hours`,
        expectedValue: `<= ${maxAge} hours`,
      },
    }
  }

  private async executeReferentialIntegrityTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { referenceTable, referenceColumn } = test.config
    const column = test.columnName!

    // Mock implementation
    const total = 10000
    const orphaned = 2
    const passed = orphaned === 0

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: total,
      recordsFailed: orphaned,
      message: passed
        ? `Referential integrity check passed. All ${column} values exist in ${referenceTable}.${referenceColumn}.`
        : `Referential integrity check failed. Found ${orphaned} orphaned records.`,
    }
  }

  private async executeCustomSqlTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { sql, expectedValue, comparisonOperator = '=' } = test.config

    // Mock implementation
    const actualValue = 0
    const passed = this.compareValues(actualValue, expectedValue, comparisonOperator)

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: 1,
      recordsFailed: passed ? 0 : 1,
      message: passed
        ? `Custom SQL test passed. Result: ${actualValue} ${comparisonOperator} ${expectedValue}`
        : `Custom SQL test failed. Result: ${actualValue} does not satisfy ${comparisonOperator} ${expectedValue}`,
      details: {
        actualValue,
        expectedValue,
      },
    }
  }

  private async executeAnomalyDetectionTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { sensitivity = 'medium', threshold } = test.config
    const column = test.columnName!

    // Mock implementation - anomaly detection
    const thresholds = { low: 3, medium: 2, high: 1.5 }
    const stdDevThreshold = threshold ?? thresholds[sensitivity]
    
    // Simulated anomaly check
    const anomalies = [
      { type: 'value', description: `Unusual spike detected in ${column}`, severity: 'warning' as const, confidence: 0.85 },
    ]
    const hasAnomaly = anomalies.length > 0

    return {
      status: hasAnomaly ? 'warning' : 'passed',
      recordsTested: 10000,
      recordsFailed: hasAnomaly ? 1 : 0,
      message: hasAnomaly
        ? `Anomaly detection found ${anomalies.length} potential issues.`
        : `No anomalies detected in ${column}.`,
      details: {
        anomalies,
      },
    }
  }

  private async executeNullPercentageTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { maxNullPercentage = 5 } = test.config
    const column = test.columnName!

    // Mock implementation
    const total = 10000
    const nullCount = 150
    const nullPercentage = (nullCount / total) * 100
    const passed = nullPercentage <= maxNullPercentage

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: total,
      recordsFailed: nullCount,
      message: passed
        ? `Null percentage check passed. ${nullPercentage.toFixed(2)}% null values (max: ${maxNullPercentage}%).`
        : `Null percentage check failed. ${nullPercentage.toFixed(2)}% exceeds maximum ${maxNullPercentage}%.`,
      details: {
        statistics: {
          count: total,
          nullCount,
          nullPercentage,
        },
      },
    }
  }

  private async executeDuplicateCheckTest(test: QualityTest, _connection: unknown): Promise<Partial<QualityTestResult>> {
    const { groupByColumns = [], maxDuplicates = 0 } = test.config

    // Mock implementation
    const total = 10000
    const duplicates = 12
    const passed = duplicates <= maxDuplicates

    return {
      status: passed ? 'passed' : 'failed',
      recordsTested: total,
      recordsFailed: duplicates,
      message: passed
        ? `Duplicate check passed. Found ${duplicates} duplicates (max allowed: ${maxDuplicates}).`
        : `Duplicate check failed. Found ${duplicates} duplicates exceeds maximum ${maxDuplicates}.`,
      details: {
        expectedValue: maxDuplicates,
        actualValue: duplicates,
      },
    }
  }

  private compareValues(actual: unknown, expected: unknown, operator: string): boolean {
    switch (operator) {
      case '=': return actual === expected
      case '!=': return actual !== expected
      case '>': return (actual as number) > (expected as number)
      case '<': return (actual as number) < (expected as number)
      case '>=': return (actual as number) >= (expected as number)
      case '<=': return (actual as number) <= (expected as number)
      default: return false
    }
  }
}

// Quality Score Calculator
export function calculateQualityScore(results: QualityTestResult[]): number {
  if (results.length === 0) return 100

  const weights = {
    critical: 3,
    warning: 2,
    info: 1,
  }

  const totalWeight = results.reduce((sum, r) => {
    // Assume severity from test type (would be from test config in production)
    const severity = r.status === 'failed' ? 'critical' : r.status === 'warning' ? 'warning' : 'info'
    return sum + weights[severity]
  }, 0)

  const penaltyWeight = results.reduce((sum, r) => {
    if (r.status === 'passed') return sum
    const severity = r.status === 'failed' ? 'critical' : 'warning'
    return sum + weights[severity]
  }, 0)

  if (totalWeight === 0) return 100
  return Math.round(((totalWeight - penaltyWeight) / totalWeight) * 100)
}

// Alert Generation
export function generateAlert(
  test: QualityTest,
  result: QualityTestResult,
  previousResult?: QualityTestResult
): QualityAlert | null {
  // Don't generate alert for passed tests
  if (result.status === 'passed' && previousResult?.status === 'passed') {
    return null
  }

  // Recovery alert
  if (result.status === 'passed' && previousResult?.status !== 'passed') {
    return {
      id: `alert_${Date.now()}`,
      testId: test.id,
      organizationId: '', // Would be populated from test
      type: 'test_recovery',
      severity: 'info',
      status: 'active',
      message: `Test "${test.name}" has recovered and is now passing.`,
      details: {
        previousStatus: previousResult?.status,
        currentStatus: result.status,
        recordsFailed: result.recordsFailed,
      },
      triggeredAt: new Date(),
      notificationSent: false,
    }
  }

  // Failure alert
  if (result.status !== 'passed') {
    return {
      id: `alert_${Date.now()}`,
      testId: test.id,
      organizationId: '', // Would be populated from test
      type: 'test_failure',
      severity: result.status === 'failed' ? 'critical' : 'warning',
      status: 'active',
      message: `Test "${test.name}" ${result.status}: ${result.message}`,
      details: {
        status: result.status,
        recordsTested: result.recordsTested,
        recordsFailed: result.recordsFailed,
        failurePercentage: result.failurePercentage,
      },
      triggeredAt: new Date(),
      notificationSent: false,
    }
  }

  return null
}

// Predefined Quality Test Templates
export const QUALITY_TEST_TEMPLATES: Record<string, Partial<QualityTest>> = {
  primary_key_check: {
    name: 'Primary Key Uniqueness',
    type: 'unique',
    description: 'Ensures primary key column contains only unique values',
    severity: 'critical',
    config: { ignoreNulls: false },
  },
  not_null_check: {
    name: 'Not Null Check',
    type: 'not_null',
    description: 'Ensures column contains no null values',
    severity: 'critical',
    config: { allowNullPercentage: 0 },
  },
  data_freshness: {
    name: 'Data Freshness',
    type: 'freshness',
    description: 'Checks if data is being updated within expected timeframe',
    severity: 'warning',
    config: { maxAge: 24 },
  },
  row_volume_check: {
    name: 'Row Volume Check',
    type: 'row_count',
    description: 'Validates expected number of rows in table',
    severity: 'warning',
    config: {},
  },
  referential_integrity: {
    name: 'Referential Integrity',
    type: 'referential_integrity',
    description: 'Ensures foreign key relationships are valid',
    severity: 'critical',
    config: {},
  },
  email_format: {
    name: 'Email Format Validation',
    type: 'regex',
    description: 'Validates email addresses format',
    severity: 'warning',
    config: {
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    },
  },
  phone_format: {
    name: 'Phone Number Format',
    type: 'regex',
    description: 'Validates phone number format',
    severity: 'info',
    config: {
      pattern: '^\\+?[1-9]\\d{1,14}$',
    },
  },
  date_range: {
    name: 'Date Range Validation',
    type: 'range',
    description: 'Ensures dates fall within expected range',
    severity: 'warning',
    config: {},
  },
  null_percentage: {
    name: 'Null Percentage Check',
    type: 'null_percentage',
    description: 'Ensures null values stay below threshold',
    severity: 'warning',
    config: { maxNullPercentage: 5 },
  },
  duplicate_detection: {
    name: 'Duplicate Detection',
    type: 'duplicate_check',
    description: 'Detects duplicate records',
    severity: 'warning',
    config: { maxDuplicates: 0 },
  },
  anomaly_detection: {
    name: 'Anomaly Detection',
    type: 'anomaly_detection',
    description: 'Detects statistical anomalies in data patterns',
    severity: 'warning',
    config: { sensitivity: 'medium' },
  },
}

// Export all
export const qualityMonitoring = {
  QualityTestEngine,
  calculateQualityScore,
  generateAlert,
  QUALITY_TEST_TEMPLATES,
}
