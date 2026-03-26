'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Building2, 
  Shield, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Users,
  Clock,
  ExternalLink,
  Copy,
  FileText,
  Settings
} from 'lucide-react'

interface SSOProvider {
  id: string
  name: string
  type: 'saml' | 'oidc'
  enabled: boolean
  status: 'active' | 'inactive' | 'not_configured'
  lastUsed: string | null
  userCount: number
  config: Record<string, unknown> | null
}

const IDENTITY_PROVIDERS = [
  { 
    id: 'azure_ad', 
    name: 'Microsoft Entra ID', 
    type: 'oidc',
    description: 'Connect with Azure Active Directory / Microsoft 365',
    icon: '🔵'
  },
  { 
    id: 'okta', 
    name: 'Okta', 
    type: 'oidc',
    description: 'Enterprise identity management with Okta',
    icon: '🟢'
  },
  { 
    id: 'google_workspace', 
    name: 'Google Workspace', 
    type: 'oidc',
    description: 'Sign in with Google Workspace accounts',
    icon: '🔴'
  },
  { 
    id: 'auth0', 
    name: 'Auth0', 
    type: 'oidc',
    description: 'Flexible authentication with Auth0',
    icon: '🟠'
  },
  { 
    id: 'onelogin', 
    name: 'OneLogin', 
    type: 'saml',
    description: 'SAML 2.0 integration with OneLogin',
    icon: '🟣'
  },
  { 
    id: 'adfs', 
    name: 'ADFS', 
    type: 'saml',
    description: 'Active Directory Federation Services',
    icon: '🟤'
  },
]

export default function SSOPage() {
  const [providers, setProviders] = useState<SSOProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [configForm, setConfigForm] = useState({
    clientId: '',
    clientSecret: '',
    issuer: '',
    certificate: '',
    defaultRole: 'viewer',
    jitProvisioning: true,
  })

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/sso/providers')
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers)
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigureProvider = () => {
    setShowConfigDialog(true)
  }

  const handleSaveConfig = async () => {
    setShowConfigDialog(false)
    fetchProviders()
  }

  const toggleProvider = async (providerId: string, enabled: boolean) => {
    try {
      await fetch('/api/sso/providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: providerId, enabled }),
      })
      fetchProviders()
    } catch (error) {
      console.error('Failed to toggle provider:', error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const spMetadataUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/saml/metadata`
    : ''

  const callbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/sso/callback`
    : ''

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enterprise SSO</h1>
          <p className="text-muted-foreground">
            Configure Single Sign-On for your organization
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Enterprise Feature
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{providers.filter(p => p.enabled).length}</p>
                <p className="text-sm text-muted-foreground">Active Providers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {providers.reduce((sum, p) => sum + p.userCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">SSO Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {providers.find(p => p.lastUsed)?.lastUsed 
                    ? new Date(providers.find(p => p.lastUsed)?.lastUsed || '').toLocaleDateString()
                    : 'Never'}
                </p>
                <p className="text-sm text-muted-foreground">Last SSO Login</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">100%</p>
                <p className="text-sm text-muted-foreground">Security Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="providers">Identity Providers</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="users">SSO Users</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-6">
          {/* Available Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Available Identity Providers</CardTitle>
              <CardDescription>
                Configure SSO with your preferred identity provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {IDENTITY_PROVIDERS.map((provider) => {
                  const existingProvider = providers.find(p => p.id.includes(provider.id))
                  return (
                    <Card key={provider.id} className="relative">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{provider.icon}</span>
                            <div>
                              <h3 className="font-semibold">{provider.name}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{provider.type}</p>
                            </div>
                          </div>
                          {existingProvider?.enabled && (
                            <Badge variant="default" className="bg-green-500">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">
                          {provider.description}
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={handleConfigureProvider}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                          {existingProvider && (
                            <Switch
                              checked={existingProvider.enabled}
                              onCheckedChange={(checked) => toggleProvider(existingProvider.id, checked)}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configured Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Configured Providers</CardTitle>
            </CardHeader>
            <CardContent>
              {providers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No SSO providers configured yet</p>
                  <p className="text-sm">Configure your first identity provider above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div 
                      key={provider.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded-lg">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{provider.name}</h4>
                            <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                              {provider.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {provider.userCount} users • Last used: {provider.lastUsed || 'Never'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={provider.enabled}
                          onCheckedChange={(checked) => toggleProvider(provider.id, checked)}
                        />
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Provider Configuration</CardTitle>
              <CardDescription>
                Use these values to configure your Identity Provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Configure these values in your Identity Provider&apos;s application settings
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Entity ID / Identifier</Label>
                    <div className="flex gap-2">
                      <Input value={spMetadataUrl || 'Loading...'} readOnly />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(spMetadataUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Reply URL / ACS URL</Label>
                    <div className="flex gap-2">
                      <Input value={callbackUrl || 'Loading...'} readOnly />
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(callbackUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>SP Metadata URL</Label>
                  <div className="flex gap-2">
                    <Input value={`${spMetadataUrl}/saml/metadata` || 'Loading...'} readOnly />
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(`${spMetadataUrl}/saml/metadata`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use this URL to automatically import SP metadata in your IdP
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Attribute Mapping</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Required attributes to be sent by your Identity Provider:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">Required - User identifier</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">First Name</p>
                    <p className="text-sm text-muted-foreground">Optional</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Last Name</p>
                    <p className="text-sm text-muted-foreground">Optional</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>JIT Provisioning</CardTitle>
              <CardDescription>
                Automatically create user accounts on first SSO login
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Enable Just-In-Time Provisioning</p>
                  <p className="text-sm text-muted-foreground">
                    New users will be automatically created when they log in via SSO
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Default Role for New Users</Label>
                  <Select defaultValue="viewer">
                    <SelectTrigger className="w-full md:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SSO Users</CardTitle>
              <CardDescription>
                Users who have authenticated via SSO
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>SSO user management</p>
                <p className="text-sm">View and manage users who authenticate via SSO</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SSO Audit Log</CardTitle>
              <CardDescription>
                Track all SSO authentication events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { event: 'sso.login.success', user: 'john.doe@example.com', provider: 'Microsoft Entra ID', time: '2 minutes ago', status: 'success' },
                  { event: 'sso.login.success', user: 'jane.smith@example.com', provider: 'Microsoft Entra ID', time: '1 hour ago', status: 'success' },
                  { event: 'sso.user.created', user: 'new.user@example.com', provider: 'Okta', time: '2 hours ago', status: 'info' },
                  { event: 'sso.login.failure', user: 'unknown@example.com', provider: 'Microsoft Entra ID', time: '3 hours ago', status: 'error' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {log.status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      {log.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                      {log.status === 'info' && <FileText className="h-5 w-5 text-blue-500" />}
                      <div>
                        <p className="font-medium">{log.event}</p>
                        <p className="text-sm text-muted-foreground">{log.user} via {log.provider}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Identity Provider</DialogTitle>
            <DialogDescription>
              Enter your identity provider configuration details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client ID</Label>
                <Input 
                  value={configForm.clientId}
                  onChange={(e) => setConfigForm({...configForm, clientId: e.target.value})}
                  placeholder="Enter Client ID"
                />
              </div>
              <div className="space-y-2">
                <Label>Client Secret</Label>
                <Input 
                  type="password"
                  value={configForm.clientSecret}
                  onChange={(e) => setConfigForm({...configForm, clientSecret: e.target.value})}
                  placeholder="Enter Client Secret"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Issuer URL</Label>
              <Input 
                value={configForm.issuer}
                onChange={(e) => setConfigForm({...configForm, issuer: e.target.value})}
                placeholder="https://your-identity-provider.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Certificate (for SAML)</Label>
              <Textarea 
                value={configForm.certificate}
                onChange={(e) => setConfigForm({...configForm, certificate: e.target.value})}
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Role</Label>
                <Select 
                  value={configForm.defaultRole}
                  onValueChange={(value) => setConfigForm({...configForm, defaultRole: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>JIT Provisioning</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch 
                    checked={configForm.jitProvisioning}
                    onCheckedChange={(checked) => setConfigForm({...configForm, jitProvisioning: checked})}
                  />
                  <span className="text-sm">Auto-create users</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig}>
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
