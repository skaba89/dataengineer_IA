'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  FileJson, 
  Key, 
  Terminal,
  Copy,
  CheckCircle2
} from 'lucide-react'

interface Endpoint {
  method: string
  path: string
  description: string
  auth: boolean
}

const API_ENDPOINTS: Endpoint[] = [
  { method: 'POST', path: '/auth/login', description: 'Authenticate user', auth: false },
  { method: 'POST', path: '/auth/register', description: 'Register new user', auth: false },
  { method: 'GET', path: '/projects', description: 'List all projects', auth: true },
  { method: 'POST', path: '/projects', description: 'Create a new project', auth: true },
  { method: 'GET', path: '/projects/{id}', description: 'Get project details', auth: true },
  { method: 'PUT', path: '/projects/{id}', description: 'Update project', auth: true },
  { method: 'DELETE', path: '/projects/{id}', description: 'Delete project', auth: true },
  { method: 'GET', path: '/data-sources', description: 'List data sources', auth: true },
  { method: 'POST', path: '/data-sources', description: 'Add data source', auth: true },
  { method: 'POST', path: '/data-sources/{id}/discover', description: 'Discover schema', auth: true },
  { method: 'POST', path: '/data-sources/{id}/test', description: 'Test connection', auth: true },
  { method: 'GET', path: '/pipelines', description: 'List pipelines', auth: true },
  { method: 'POST', path: '/pipelines', description: 'Generate pipeline', auth: true },
  { method: 'POST', path: '/pipelines/{id}/deploy', description: 'Deploy pipeline', auth: true },
  { method: 'POST', path: '/agents/execute', description: 'Execute AI agent', auth: true },
  { method: 'GET', path: '/agents/executions/{id}', description: 'Get execution status', auth: true },
  { method: 'GET', path: '/quality/tests', description: 'List quality tests', auth: true },
  { method: 'POST', path: '/quality/tests', description: 'Create quality test', auth: true },
  { method: 'POST', path: '/quality/run', description: 'Run quality tests', auth: true },
  { method: 'POST', path: '/export', description: 'Export deliverables', auth: true },
  { method: 'GET', path: '/billing/subscription', description: 'Get subscription', auth: true },
  { method: 'POST', path: '/billing/checkout', description: 'Create checkout session', auth: true },
  { method: 'GET', path: '/api-keys', description: 'List API keys', auth: true },
  { method: 'POST', path: '/api-keys', description: 'Create API key', auth: true },
  { method: 'DELETE', path: '/api-keys/{id}', description: 'Revoke API key', auth: true },
  { method: 'POST', path: '/public/v1/query', description: 'Execute data query', auth: true },
]

const CODE_EXAMPLES = {
  curl: `# Authenticate
curl -X POST https://api.aidataengineering.com/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password"}'

# List projects
curl -X GET https://api.aidataengineering.com/projects \\
  -H "X-API-Key: your-api-key"

# Create a project
curl -X POST https://api.aidataengineering.com/projects \\
  -H "X-API-Key: your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Data Project", "description": "Data pipeline", "industry": "retail"}'`,

  python: `import requests

API_KEY = "your-api-key"
BASE_URL = "https://api.aidataengineering.com"
headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}

# List projects
response = requests.get(f"{BASE_URL}/projects", headers=headers)
projects = response.json()
print(f"Found {len(projects['data'])} projects")

# Create a project
new_project = {"name": "My Data Project", "industry": "retail"}
response = requests.post(f"{BASE_URL}/projects", headers=headers, json=new_project)
project = response.json()
print(f"Created project: {project['id']}")`,

  javascript: `const API_KEY = 'your-api-key';
const BASE_URL = 'https://api.aidataengineering.com';
const headers = { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' };

// List projects
const projects = await fetch(\`\${BASE_URL}/projects\`, { headers }).then(r => r.json());
console.log(\`Found \${projects.data.length} projects\`);

// Create project
const project = await fetch(\`\${BASE_URL}/projects\`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ name: 'My Data Project', industry: 'retail' }),
}).then(r => r.json());
console.log(\`Created project: \${project.id}\`);`,
}

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedCode, setSelectedCode] = useState<keyof typeof CODE_EXAMPLES>('curl')

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500'
      case 'POST': return 'bg-blue-500'
      case 'PUT': return 'bg-yellow-500'
      case 'DELETE': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-muted-foreground">Complete reference for the AI Data Engineering System API</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href="/api/docs/openapi" target="_blank" rel="noopener noreferrer">
              <FileJson className="h-4 w-4 mr-2" />OpenAPI Spec
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/docs/openapi?format=yaml" download="openapi.yaml">
              <Download className="h-4 w-4 mr-2" />Download YAML
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />Quick Start
          </CardTitle>
          <CardDescription>Get started with the API in minutes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Key className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">Authentication</p>
              <p className="text-sm text-muted-foreground">
                All API requests require an API key in the <code className="bg-muted px-1 rounded">X-API-Key</code> header
              </p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                {(['curl', 'python', 'javascript'] as const).map((lang) => (
                  <Button key={lang} variant={selectedCode === lang ? 'default' : 'ghost'} size="sm" onClick={() => setSelectedCode(lang)} className="text-xs">
                    {lang.toUpperCase()}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(CODE_EXAMPLES[selectedCode], selectedCode)}>
                {copied === selectedCode ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap">{CODE_EXAMPLES[selectedCode]}</pre>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="all">All Endpoints</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="data">Data Sources</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All API Endpoints</CardTitle>
              <CardDescription>{API_ENDPOINTS.length} endpoints available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {API_ENDPOINTS.map((endpoint, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getMethodColor(endpoint.method)} text-white font-mono`}>{endpoint.method}</Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                      {endpoint.auth && <Badge variant="outline" className="text-xs">Auth</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader><CardTitle>Projects</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {API_ENDPOINTS.filter(e => e.path.startsWith('/projects')).map((endpoint, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getMethodColor(endpoint.method)} text-white font-mono`}>{endpoint.method}</Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader><CardTitle>Data Sources</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {API_ENDPOINTS.filter(e => e.path.startsWith('/data-sources')).map((endpoint, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getMethodColor(endpoint.method)} text-white font-mono`}>{endpoint.method}</Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipelines">
          <Card>
            <CardHeader><CardTitle>Pipelines</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {API_ENDPOINTS.filter(e => e.path.startsWith('/pipelines')).map((endpoint, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getMethodColor(endpoint.method)} text-white font-mono`}>{endpoint.method}</Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader><CardTitle>AI Agents</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {API_ENDPOINTS.filter(e => e.path.startsWith('/agents')).map((endpoint, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getMethodColor(endpoint.method)} text-white font-mono`}>{endpoint.method}</Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader><CardTitle>Rate Limits</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { plan: 'Starter', limit: '100', unit: 'requests/min' },
              { plan: 'Professional', limit: '1,000', unit: 'requests/min' },
              { plan: 'Enterprise', limit: '10,000', unit: 'requests/min' },
              { plan: 'Agency', limit: '5,000', unit: 'requests/min' },
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg text-center">
                <p className="font-semibold">{item.plan}</p>
                <p className="text-2xl font-bold text-primary">{item.limit}</p>
                <p className="text-sm text-muted-foreground">{item.unit}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
