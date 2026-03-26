'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Shield, ShieldCheck, ShieldAlert, Lock, Key, AlertTriangle, 
  Activity, Eye, Ban, CheckCircle, XCircle, Clock, Users,
  Server, FileText, Bell, Settings, RefreshCw, Download,
  Smartphone, Globe, Database, Zap
} from 'lucide-react'

// Types
interface SecuritySummary {
  securityScore: number
  activeAlerts: number
  failedLogins24h: number
  complianceStatus: Record<string, number>
  recentEvents: SecurityEvent[]
  vulnerabilities: { critical: number; high: number; medium: number; low: number }
  auditLogCount: number
  mfaEnabled: number
  mfaPercentage: number
}

interface SecurityEvent {
  id: string
  type: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: string
  resolved: boolean
}

interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  resource: string
  status: string
  ipAddress: string
  riskLevel: string
}

interface IpRule {
  id: string
  ip: string
  type: 'whitelist' | 'blacklist'
  reason: string
  active: boolean
  createdAt: string
}

// Sample data
const sampleSummary: SecuritySummary = {
  securityScore: 87,
  activeAlerts: 3,
  failedLogins24h: 12,
  complianceStatus: {
    SOC2: 92,
    RGPD: 88,
    HIPAA: 85,
    PCI_DSS: 78,
    ISO27001: 90
  },
  recentEvents: [
    { id: '1', type: 'brute_force_detected', severity: 'critical', message: 'Brute force attempt from 192.168.1.100', timestamp: '2025-01-15T10:30:00Z', resolved: false },
    { id: '2', type: 'suspicious_activity', severity: 'warning', message: 'Unusual API access pattern detected', timestamp: '2025-01-15T09:45:00Z', resolved: false },
    { id: '3', type: 'rate_limit_exceeded', severity: 'warning', message: 'Rate limit exceeded for API key sk_xxx', timestamp: '2025-01-15T08:20:00Z', resolved: true },
  ],
  vulnerabilities: { critical: 0, high: 1, medium: 3, low: 5 },
  auditLogCount: 1547,
  mfaEnabled: 45,
  mfaPercentage: 78
}

const sampleAuditLogs: AuditLogEntry[] = [
  { id: '1', timestamp: '2025-01-15T10:35:00Z', action: 'auth.login', resource: 'user', status: 'success', ipAddress: '192.168.1.50', riskLevel: 'low' },
  { id: '2', timestamp: '2025-01-15T10:32:00Z', action: 'auth.login', resource: 'user', status: 'failure', ipAddress: '192.168.1.100', riskLevel: 'medium' },
  { id: '3', timestamp: '2025-01-15T10:30:00Z', action: 'data.exported', resource: 'project', status: 'success', ipAddress: '192.168.1.50', riskLevel: 'medium' },
  { id: '4', timestamp: '2025-01-15T10:28:00Z', action: 'api_key.used', resource: 'secret', status: 'success', ipAddress: '10.0.0.5', riskLevel: 'low' },
  { id: '5', timestamp: '2025-01-15T10:25:00Z', action: 'user.role_changed', resource: 'user', status: 'success', ipAddress: '192.168.1.1', riskLevel: 'high' },
  { id: '6', timestamp: '2025-01-15T10:20:00Z', action: 'auth.mfa_enabled', resource: 'user', status: 'success', ipAddress: '192.168.1.50', riskLevel: 'low' },
  { id: '7', timestamp: '2025-01-15T10:15:00Z', action: 'security.alert', resource: 'system', status: 'blocked', ipAddress: '192.168.1.100', riskLevel: 'critical' },
]

const sampleIpRules: IpRule[] = [
  { id: '1', ip: '192.168.1.0/24', type: 'whitelist', reason: 'Office network', active: true, createdAt: '2025-01-10T08:00:00Z' },
  { id: '2', ip: '10.0.0.0/8', type: 'whitelist', reason: 'VPN network', active: true, createdAt: '2025-01-10T08:00:00Z' },
  { id: '3', ip: '45.33.32.0/24', type: 'blacklist', reason: 'Known malicious IPs', active: true, createdAt: '2025-01-12T14:30:00Z' },
]

export default function SecurityPage() {
  const [summary, setSummary] = useState<SecuritySummary>(sampleSummary)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(sampleAuditLogs)
  const [ipRules, setIpRules] = useState<IpRule[]>(sampleIpRules)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [newIp, setNewIp] = useState('')
  const [newIpType, setNewIpType] = useState<'whitelist' | 'blacklist'>('whitelist')
  const [newIpReason, setNewIpReason] = useState('')
  const [mfaSetupMode, setMfaSetupMode] = useState(false)
  const [mfaSecret, setMfaSecret] = useState('')
  const [mfaQrCode, setMfaQrCode] = useState('')
  const [mfaToken, setMfaToken] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-green-600'
    if (score >= 60) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[severity] || 'bg-gray-100 text-gray-800'
  }

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'auth.login': 'Connexion',
      'auth.logout': 'Déconnexion',
      'auth.mfa_enabled': 'MFA Activé',
      'auth.mfa_disabled': 'MFA Désactivé',
      'data.exported': 'Données Exportées',
      'data.accessed': 'Données Accédées',
      'api_key.used': 'Clé API Utilisée',
      'user.role_changed': 'Rôle Modifié',
      'security.alert': 'Alerte Sécurité',
      'ip.whitelist_added': 'IP Autorisée',
      'ip.blacklist_added': 'IP Bloquée'
    }
    return labels[action] || action
  }

  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (status === 'failure') return <XCircle className="w-4 h-4 text-red-500" />
    return <Ban className="w-4 h-4 text-orange-500" />
  }

  const handleAddIpRule = () => {
    if (!newIp || !newIpReason) return
    
    const rule: IpRule = {
      id: crypto.randomUUID(),
      ip: newIp,
      type: newIpType,
      reason: newIpReason,
      active: true,
      createdAt: new Date().toISOString()
    }
    
    setIpRules([...ipRules, rule])
    setNewIp('')
    setNewIpReason('')
  }

  const handleSetupMfa = () => {
    // Simulate MFA setup
    setMfaSecret('JBSWY3DPEHPK3PXP')
    setMfaQrCode('otpauth://totp/DataSphere:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=DataSphere')
    setBackupCodes([
      'A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2',
      'M3N4-O5P6', 'Q7R8-S9T0', 'U1V2-W3X4',
      'Y5Z6-A7B8', 'C9D0-E1F2', 'G3H4-I5J6', 'K7L8-M9N0'
    ])
    setMfaSetupMode(true)
  }

  const handleVerifyMfa = () => {
    // Simulate verification
    if (mfaToken.length === 6) {
      setMfaSetupMode(false)
      setSummary({ ...summary, mfaPercentage: 100 })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Security & Compliance Center
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Protection maximale et conformité entreprise
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Rapport
              </Button>
            </div>
          </div>
        </div>

        {/* Security Score Banner */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getScoreBgColor(summary.securityScore)} flex items-center justify-center`}>
                      <span className="text-3xl font-bold text-white">{summary.securityScore}</span>
                    </div>
                    <ShieldCheck className="absolute -bottom-1 -right-1 w-8 h-8 text-white bg-green-500 rounded-full p-1" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Score de Sécurité Global</h2>
                    <p className="text-slate-300">
                      {summary.securityScore >= 80 ? 'Excellent - Votre système est bien protégé' :
                       summary.securityScore >= 60 ? 'Bon - Quelques améliorations recommandées' :
                       'Attention - Des actions correctives sont nécessaires'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="outline" className="text-white border-white/30">
                        <Activity className="w-3 h-3 mr-1" />
                        {summary.activeAlerts} Alertes Actives
                      </Badge>
                      <Badge variant="outline" className="text-white border-white/30">
                        <Clock className="w-3 h-3 mr-1" />
                        {summary.failedLogins24h} Échecs 24h
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Dernière analyse</p>
                  <p className="text-white font-medium">Il y a 5 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.vulnerabilities.critical + summary.vulnerabilities.high}</p>
                  <p className="text-sm text-slate-600">Vulnérabilités Critiques</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.mfaPercentage}%</p>
                  <p className="text-sm text-slate-600">MFA Activé</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.auditLogCount.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Logs d'Audit 30j</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ipRules.length}</p>
                  <p className="text-sm text-slate-600">Règles IP</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-6 mb-6">
            <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="access">Contrôle d'Accès</TabsTrigger>
            <TabsTrigger value="compliance">Conformité</TabsTrigger>
            <TabsTrigger value="secrets">Secrets</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-6">
              {/* Recent Security Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Événements Récents
                  </CardTitle>
                  <CardDescription>Alertes et événements de sécurité des dernières 24h</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.recentEvents.map(event => (
                      <div key={event.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className={`p-1 rounded ${event.severity === 'critical' ? 'bg-red-100' : event.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                          {event.severity === 'critical' ? (
                            <ShieldAlert className="w-4 h-4 text-red-600" />
                          ) : event.severity === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          ) : (
                            <Activity className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{event.message}</p>
                            {event.resolved ? (
                              <Badge className="bg-green-100 text-green-800">Résolu</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Actif</Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(event.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Vulnerabilities Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Vulnérabilités
                  </CardTitle>
                  <CardDescription>État des vulnérabilités détectées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="font-medium">Critique</span>
                      </div>
                      <span className="text-2xl font-bold text-red-600">{summary.vulnerabilities.critical}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                        <span className="font-medium">Haute</span>
                      </div>
                      <span className="text-2xl font-bold text-orange-600">{summary.vulnerabilities.high}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span className="font-medium">Moyenne</span>
                      </div>
                      <span className="text-2xl font-bold text-yellow-600">{summary.vulnerabilities.medium}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="font-medium">Basse</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{summary.vulnerabilities.low}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Lancer un Scan Complet
                  </Button>
                </CardContent>
              </Card>

              {/* MFA Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Authentification Multi-Facteurs
                  </CardTitle>
                  <CardDescription>Statut MFA de l'organisation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-green-600">{summary.mfaPercentage}%</div>
                    <p className="text-slate-500">{summary.mfaEnabled} utilisateurs avec MFA activé</p>
                  </div>
                  <Progress value={summary.mfaPercentage} className="h-3 mb-4" />
                  
                  {mfaSetupMode ? (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm font-medium">Configurez votre application d'authentification:</p>
                      <p className="text-xs text-slate-500 break-all font-mono bg-white p-2 rounded">{mfaSecret}</p>
                      <Input 
                        placeholder="Entrez le code à 6 chiffres"
                        value={mfaToken}
                        onChange={(e) => setMfaToken(e.target.value)}
                        maxLength={6}
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleVerifyMfa} className="flex-1">Vérifier & Activer</Button>
                        <Button variant="outline" onClick={() => setMfaSetupMode(false)}>Annuler</Button>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs font-medium text-slate-600 mb-2">Codes de récupération (gardez-les en lieu sûr):</p>
                        <div className="grid grid-cols-2 gap-1">
                          {backupCodes.map((code, i) => (
                            <code key={i} className="text-xs bg-white p-1 rounded text-center">{code}</code>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={handleSetupMfa}>
                      <Lock className="w-4 h-4 mr-2" />
                      Configurer MFA
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Actions Rapides
                  </CardTitle>
                  <CardDescription>Actions de sécurité immédiates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Key className="w-4 h-4 mr-2" />
                      Rotation des Clés API
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Révoquer Sessions Actives
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Ban className="w-4 h-4 mr-2" />
                      Bloquer IP Suspecte
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Générer Rapport Sécurité
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="w-4 h-4 mr-2" />
                      Configurer Alertes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Journal d'Audit
                    </CardTitle>
                    <CardDescription>Traçabilité complète de toutes les actions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Rechercher..." className="w-64" />
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-sm font-medium text-slate-500">Timestamp</th>
                        <th className="text-left p-2 text-sm font-medium text-slate-500">Action</th>
                        <th className="text-left p-2 text-sm font-medium text-slate-500">Ressource</th>
                        <th className="text-left p-2 text-sm font-medium text-slate-500">IP</th>
                        <th className="text-left p-2 text-sm font-medium text-slate-500">Statut</th>
                        <th className="text-left p-2 text-sm font-medium text-slate-500">Risque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id} className="border-b hover:bg-slate-50">
                          <td className="p-2 text-sm">{new Date(log.timestamp).toLocaleString('fr-FR')}</td>
                          <td className="p-2">
                            <Badge variant="outline">{getActionLabel(log.action)}</Badge>
                          </td>
                          <td className="p-2 text-sm">{log.resource}</td>
                          <td className="p-2 text-sm font-mono">{log.ipAddress}</td>
                          <td className="p-2">{getStatusIcon(log.status)}</td>
                          <td className="p-2">
                            <Badge className={`
                              ${log.riskLevel === 'critical' ? 'bg-red-100 text-red-800' :
                                log.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                log.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'}
                            `}>
                              {log.riskLevel}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access">
            <div className="grid grid-cols-2 gap-6">
              {/* IP Whitelist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Liste Blanche IP
                  </CardTitle>
                  <CardDescription>Adresses IP autorisées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {ipRules.filter(r => r.type === 'whitelist').map(rule => (
                      <div key={rule.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                        <div>
                          <span className="font-mono text-sm">{rule.ip}</span>
                          <p className="text-xs text-slate-500">{rule.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">Actif</Badge>
                          <Button variant="ghost" size="sm">
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Input 
                      placeholder="IP ou CIDR (ex: 192.168.1.0/24)"
                      value={newIp}
                      onChange={(e) => setNewIp(e.target.value)}
                    />
                    <Input 
                      placeholder="Raison"
                      value={newIpReason}
                      onChange={(e) => setNewIpReason(e.target.value)}
                    />
                    <Button onClick={handleAddIpRule} className="w-full">
                      Ajouter à la Liste Blanche
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* IP Blacklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ban className="w-5 h-5 text-red-600" />
                    Liste Noire IP
                  </CardTitle>
                  <CardDescription>Adresses IP bloquées</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {ipRules.filter(r => r.type === 'blacklist').map(rule => (
                      <div key={rule.id} className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-200">
                        <div>
                          <span className="font-mono text-sm">{rule.ip}</span>
                          <p className="text-xs text-slate-500">{rule.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-100 text-red-800">Bloqué</Badge>
                          <Button variant="ghost" size="sm">
                            <XCircle className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <div className="grid grid-cols-3 gap-6">
              {Object.entries(summary.complianceStatus).map(([framework, score]) => (
                <Card key={framework}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{framework.replace('_', '-')}</span>
                      <Badge className={`
                        ${score >= 80 ? 'bg-green-100 text-green-800' :
                          score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {score >= 80 ? 'Conforme' : score >= 60 ? 'Partiel' : 'Non Conforme'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}%</div>
                      <p className="text-sm text-slate-500">Score de conformité</p>
                    </div>
                    <Progress value={score} className="h-2 mb-4" />
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Voir le Rapport
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Secrets Tab */}
          <TabsContent value="secrets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Gestion des Secrets
                    </CardTitle>
                    <CardDescription>Clés API, certificats et secrets chiffrés</CardDescription>
                  </div>
                  <Button>
                    <Lock className="w-4 h-4 mr-2" />
                    Ajouter un Secret
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'STRIPE_API_KEY', type: 'api_key', created: '2025-01-10', lastUsed: '2 min ago', expires: '2026-01-10' },
                    { name: 'DATABASE_PASSWORD', type: 'password', created: '2025-01-05', lastUsed: '1 hour ago', expires: '2025-04-05' },
                    { name: 'JWT_SECRET', type: 'encryption_key', created: '2025-01-01', lastUsed: 'Just now', expires: 'Never' },
                    { name: 'SENDGRID_API_KEY', type: 'api_key', created: '2025-01-12', lastUsed: '5 hours ago', expires: '2026-01-12' },
                  ].map((secret, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          secret.type === 'api_key' ? 'bg-blue-100' :
                          secret.type === 'password' ? 'bg-red-100' :
                          'bg-purple-100'
                        }`}>
                          <Key className={`w-5 h-5 ${
                            secret.type === 'api_key' ? 'text-blue-600' :
                            secret.type === 'password' ? 'text-red-600' :
                            'text-purple-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{secret.name}</p>
                          <p className="text-sm text-slate-500">
                            Créé: {secret.created} • Dernière utilisation: {secret.lastUsed}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{secret.type}</Badge>
                        {secret.expires !== 'Never' && (
                          <Badge className="bg-yellow-100 text-yellow-800">Expire: {secret.expires}</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Configuration des Alertes
                </CardTitle>
                <CardDescription>Gérez vos notifications de sécurité</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Tentatives de connexion échouées', enabled: true, severity: 'warning' },
                    { name: 'Accès depuis une nouvelle IP', enabled: true, severity: 'info' },
                    { name: 'Activité suspecte détectée', enabled: true, severity: 'critical' },
                    { name: 'Expiration de certificat', enabled: true, severity: 'warning' },
                    { name: 'Vulnérabilité critique trouvée', enabled: true, severity: 'critical' },
                    { name: 'Rate limit dépassé', enabled: false, severity: 'info' },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        <span>{alert.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={alert.enabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
                          {alert.enabled ? 'Activé' : 'Désactivé'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
