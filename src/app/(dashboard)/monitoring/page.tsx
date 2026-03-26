'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
  RefreshCw,
  Bell,
  Settings,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react'

// Types
interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  change: number
}

interface AlertConfig {
  id: string
  name: string
  metric: string
  condition: 'gt' | 'lt' | 'eq'
  threshold: number
  severity: 'info' | 'warning' | 'critical'
  enabled: boolean
  channels: string[]
}

interface Alert {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
}

interface DatabaseMetric {
  connections: number
  maxConnections: number
  queries: number
  slowQueries: number
  cacheHitRatio: number
  diskUsage: number
  replicationLag: number
}

export default function MonitoringDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'alerts' | 'config'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  
  // System metrics state
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'healthy', trend: 'stable', change: 0 },
    { name: 'Memory Usage', value: 62, unit: '%', status: 'healthy', trend: 'up', change: 5 },
    { name: 'Disk I/O', value: 128, unit: 'MB/s', status: 'healthy', trend: 'down', change: -12 },
    { name: 'Network', value: 45.2, unit: 'Mbps', status: 'healthy', trend: 'stable', change: 0 }
  ])

  const [dbMetrics, setDbMetrics] = useState<DatabaseMetric>({
    connections: 45,
    maxConnections: 100,
    queries: 1247,
    slowQueries: 3,
    cacheHitRatio: 98.5,
    diskUsage: 45.2,
    replicationLag: 0
  })

  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'high_cpu', severity: 'warning', message: 'CPU usage above 80% for 5 minutes', timestamp: new Date(Date.now() - 3600000), resolved: false },
    { id: '2', type: 'slow_query', severity: 'info', message: 'Slow query detected: SELECT * FROM audit_logs', timestamp: new Date(Date.now() - 7200000), resolved: true },
    { id: '3', type: 'connection_pool', severity: 'critical', message: 'Connection pool exhausted', timestamp: new Date(Date.now() - 1800000), resolved: false }
  ])

  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>([
    { id: '1', name: 'High CPU Usage', metric: 'cpu_usage', condition: 'gt', threshold: 80, severity: 'warning', enabled: true, channels: ['email', 'slack'] },
    { id: '2', name: 'Critical CPU Usage', metric: 'cpu_usage', condition: 'gt', threshold: 95, severity: 'critical', enabled: true, channels: ['email', 'slack', 'pagerduty'] },
    { id: '3', name: 'Memory Warning', metric: 'memory_usage', condition: 'gt', threshold: 85, severity: 'warning', enabled: true, channels: ['email'] },
    { id: '4', name: 'Slow Query Alert', metric: 'slow_queries', condition: 'gt', threshold: 10, severity: 'info', enabled: true, channels: ['slack'] },
    { id: '5', name: 'Connection Pool Low', metric: 'available_connections', condition: 'lt', threshold: 10, severity: 'critical', enabled: true, channels: ['email', 'pagerduty'] }
  ])

  // Simulated real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics()
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const refreshMetrics = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Update metrics with simulated data
    setSystemMetrics(prev => prev.map(metric => ({
      ...metric,
      value: metric.value + (Math.random() * 10 - 5),
      trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
    })))

    setDbMetrics(prev => ({
      ...prev,
      connections: Math.floor(Math.random() * 50 + 30),
      queries: prev.queries + Math.floor(Math.random() * 100),
      slowQueries: Math.floor(Math.random() * 5)
    }))

    setLastRefresh(new Date())
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500'
      case 'warning': return 'text-yellow-500'
      case 'critical': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Critical</span>
      case 'warning':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Warning</span>
      default:
        return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Info</span>
    }
  }

  const toggleAlertConfig = (id: string) => {
    setAlertConfigs(prev => prev.map(config => 
      config.id === id ? { ...config, enabled: !config.enabled } : config
    ))
  }

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, resolved: true } : alert
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoring & Observability</h1>
          <p className="text-gray-500 mt-1">Real-time system monitoring and alerting</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={refreshMetrics}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'config', label: 'Configuration', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">System Health</p>
                  <p className="text-2xl font-bold text-green-600">Healthy</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Alerts</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {alerts.filter(a => !a.resolved).length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">DB Connections</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dbMetrics.connections}/{dbMetrics.maxConnections}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cache Hit Ratio</p>
                  <p className="text-2xl font-bold text-gray-900">{dbMetrics.cacheHitRatio}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* System Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{metric.name}</h3>
                  <span className={`flex items-center ${getStatusColor(metric.status)}`}>
                    {metric.status === 'healthy' ? <CheckCircle className="w-5 h-5" /> : 
                     metric.status === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                     <XCircle className="w-5 h-5" />}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {metric.value.toFixed(1)}{metric.unit}
                    </p>
                    <div className="flex items-center mt-1 text-sm">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                      ) : null}
                      <span className={metric.change >= 0 ? 'text-red-500' : 'text-green-500'}>
                        {metric.change >= 0 ? '+' : ''}{metric.change}% from last hour
                      </span>
                    </div>
                  </div>
                  <div className="w-32 h-16">
                    {/* Mini chart placeholder */}
                    <div className="w-full h-full bg-gradient-to-r from-blue-50 to-blue-100 rounded flex items-end justify-around p-1">
                      {[40, 60, 45, 70, 55, 65, 50].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-2 bg-blue-500 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Alerts Preview */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Alerts</h3>
              <button 
                onClick={() => setActiveTab('alerts')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 3).map(alert => (
                <div 
                  key={alert.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    alert.resolved ? 'bg-gray-50' : 'bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(alert.severity)}
                    <span className={alert.resolved ? 'text-gray-500 line-through' : 'text-gray-900'}>
                      {alert.message}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Connection Pool Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Connection Pool Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Active Connections</p>
                <p className="text-3xl font-bold text-blue-600">{dbMetrics.connections}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Max Connections</p>
                <p className="text-3xl font-bold text-gray-900">{dbMetrics.maxConnections}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-3xl font-bold text-green-600">
                  {dbMetrics.maxConnections - dbMetrics.connections}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Utilization</p>
                <p className="text-3xl font-bold text-gray-900">
                  {((dbMetrics.connections / dbMetrics.maxConnections) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <div className="mt-4 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(dbMetrics.connections / dbMetrics.maxConnections) * 100}%` }}
              />
            </div>
          </div>

          {/* Query Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Query Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Queries (24h)</span>
                  <span className="font-bold">{dbMetrics.queries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Slow Queries</span>
                  <span className={`font-bold ${dbMetrics.slowQueries > 5 ? 'text-red-600' : 'text-green-600'}`}>
                    {dbMetrics.slowQueries}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="font-bold">42ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cache Hit Ratio</span>
                  <span className="font-bold text-green-600">{dbMetrics.cacheHitRatio}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Storage Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Disk Usage</span>
                  <span className="font-bold">{dbMetrics.diskUsage} GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Replication Lag</span>
                  <span className="font-bold text-green-600">{dbMetrics.replicationLag}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Index Size</span>
                  <span className="font-bold">12.4 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Table Size</span>
                  <span className="font-bold">32.8 GB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Tables */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Tables by Size</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm border-b">
                    <th className="pb-3">Table Name</th>
                    <th className="pb-3">Rows</th>
                    <th className="pb-3">Size</th>
                    <th className="pb-3">Index Size</th>
                    <th className="pb-3">Seq Scans</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { name: 'audit_logs', rows: '12.5M', size: '8.2 GB', index: '2.1 GB', scans: '45K' },
                    { name: 'agent_executions', rows: '5.2M', size: '4.1 GB', index: '1.2 GB', scans: '32K' },
                    { name: 'projects', rows: '125K', size: '256 MB', index: '64 MB', scans: '890K' },
                    { name: 'users', rows: '45K', size: '12 MB', index: '8 MB', scans: '2.1M' },
                    { name: 'data_sources', rows: '89K', size: '45 MB', index: '12 MB', scans: '456K' }
                  ].map((table, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3 font-medium">{table.name}</td>
                      <td className="py-3">{table.rows}</td>
                      <td className="py-3">{table.size}</td>
                      <td className="py-3">{table.index}</td>
                      <td className="py-3">{table.scans}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Alert Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-600">Critical</p>
                  <p className="text-2xl font-bold text-red-900">
                    {alerts.filter(a => a.severity === 'critical' && !a.resolved).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-600">Warning</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {alerts.filter(a => a.severity === 'warning' && !a.resolved).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">Info</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {alerts.filter(a => a.severity === 'info' && !a.resolved).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Alert List */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">All Alerts</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                    All
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                    Active
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                    Resolved
                  </button>
                </div>
              </div>
            </div>
            <div className="divide-y">
              {alerts.map(alert => (
                <div key={alert.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getSeverityBadge(alert.severity)}
                      <div>
                        <p className={`font-medium ${alert.resolved ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {alert.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-gray-900">Alert Rules</h3>
              <p className="text-sm text-gray-500 mt-1">Configure when alerts should be triggered</p>
            </div>
            <div className="divide-y">
              {alertConfigs.map(config => (
                <div key={config.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleAlertConfig(config.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          config.enabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            config.enabled ? 'translate-x-6' : ''
                          }`}
                        />
                      </button>
                      <div>
                        <p className="font-medium text-gray-900">{config.name}</p>
                        <p className="text-sm text-gray-500">
                          {config.metric} {config.condition === 'gt' ? '>' : config.condition === 'lt' ? '<' : '='} {config.threshold}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(config.severity)}
                      <div className="flex gap-1">
                        {config.channels.map(channel => (
                          <span key={channel} className="px-2 py-1 text-xs bg-gray-100 rounded">
                            {channel}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Channels */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Notification Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 font-bold">@</span>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-gray-500">admin@datasphere.io</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Active</span>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 font-bold">S</span>
                  </div>
                  <div>
                    <p className="font-medium">Slack</p>
                    <p className="text-sm text-gray-500">#alerts</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Active</span>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <span className="text-orange-600 font-bold">P</span>
                  </div>
                  <div>
                    <p className="font-medium">PagerDuty</p>
                    <p className="text-sm text-gray-500">Critical only</p>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
