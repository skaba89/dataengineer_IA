"use client"

import { useState } from "react"
import {
  Book, Code, Database, Zap, Shield, Key, ArrowRight, Copy, Check,
  ChevronDown, Terminal, FileJson, Lock, Globe, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const API_ENDPOINTS = [
  {
    category: "Projects",
    icon: Database,
    endpoints: [
      {
        method: "GET",
        path: "/api/projects",
        description: "Liste tous les projets",
        auth: true,
        params: [],
        response: `{ "success": true, "projects": [...] }`
      },
      {
        method: "POST",
        path: "/api/projects",
        description: "Crée un nouveau projet",
        auth: true,
        params: [
          { name: "name", type: "string", required: true },
          { name: "description", type: "string", required: false },
          { name: "industry", type: "string", required: false }
        ],
        response: `{ "success": true, "project": {...} }`
      },
      {
        method: "GET",
        path: "/api/projects/:id",
        description: "Détails d'un projet",
        auth: true,
        params: [],
        response: `{ "success": true, "project": {...} }`
      }
    ]
  },
  {
    category: "Data Sources",
    icon: Database,
    endpoints: [
      {
        method: "GET",
        path: "/api/data-sources",
        description: "Liste les sources de données",
        auth: true,
        params: [],
        response: `{ "success": true, "dataSources": [...] }`
      },
      {
        method: "POST",
        path: "/api/data-sources",
        description: "Ajoute une source de données",
        auth: true,
        params: [
          { name: "type", type: "string", required: true },
          { name: "name", type: "string", required: true },
          { name: "config", type: "object", required: true }
        ],
        response: `{ "success": true, "dataSource": {...} }`
      },
      {
        method: "POST",
        path: "/api/data-sources/:id/discover",
        description: "Découvre le schéma d'une source",
        auth: true,
        params: [],
        response: `{ "success": true, "tables": [...] }`
      }
    ]
  },
  {
    category: "Executions",
    icon: Zap,
    endpoints: [
      {
        method: "POST",
        path: "/api/executions",
        description: "Déclenche une exécution d'agent",
        auth: true,
        params: [
          { name: "projectId", type: "string", required: true },
          { name: "agentType", type: "string", required: true }
        ],
        response: `{ "success": true, "execution": {...} }`
      },
      {
        method: "GET",
        path: "/api/executions/:id",
        description: "Statut d'une exécution",
        auth: true,
        params: [],
        response: `{ "success": true, "execution": {...} }`
      }
    ]
  },
  {
    category: "Billing",
    icon: Shield,
    endpoints: [
      {
        method: "GET",
        path: "/api/billing/subscription",
        description: "Détails de l'abonnement",
        auth: true,
        params: [],
        response: `{ "success": true, "subscription": {...} }`
      },
      {
        method: "POST",
        path: "/api/billing/checkout",
        description: "Crée une session checkout",
        auth: true,
        params: [
          { name: "plan", type: "string", required: true },
          { name: "billingPeriod", type: "string", required: true }
        ],
        response: `{ "success": true, "checkoutUrl": "..." }`
      }
    ]
  }
]

const CODE_EXAMPLES = {
  javascript: `// Exemple avec fetch
const response = await fetch('https://api.aidataengineering.com/api/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data.projects);`,

  python: `# Exemple avec requests
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.aidataengineering.com/api/projects',
    headers=headers
)
data = response.json()
print(data['projects'])`,

  curl: `# Exemple avec curl
curl -X GET "https://api.aidataengineering.com/api/projects" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
}

const SDK_INSTALL = {
  javascript: `npm install @aide/sdk`,
  python: `pip install aide-sdk`
}

export default function DocsPage() {
  const { toast } = useToast()
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'curl'>('javascript')

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
    toast({ title: "Copié !", description: "Le code a été copié" })
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-violet-500/10 text-violet-400">Documentation API</Badge>
          <h1 className="text-4xl font-bold text-white mb-4">
            Intégrez AI Data Engineering
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            API RESTful complète pour automatiser vos projets data engineering
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Key className="w-4 h-4 mr-2" />
              Obtenir une clé API
            </Button>
            <Button variant="outline">
              <FileJson className="w-4 h-4 mr-2" />
              OpenAPI Spec
            </Button>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Démarrage Rapide
            </CardTitle>
            <CardDescription className="text-slate-400">
              Faites votre premier appel API en moins de 5 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">1</div>
                <h3 className="text-white font-medium">Installez le SDK</h3>
                <code className="block bg-slate-900 p-3 rounded-lg text-sm text-slate-300">
                  {SDK_INSTALL[selectedLanguage]}
                </code>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">2</div>
                <h3 className="text-white font-medium">Configurez votre clé</h3>
                <code className="block bg-slate-900 p-3 rounded-lg text-sm text-slate-300">
                  AIDE_API_KEY=your_key
                </code>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold">3</div>
                <h3 className="text-white font-medium">Faites votre premier appel</h3>
                <p className="text-sm text-slate-400">Listez vos projets en un appel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="endpoints" className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="authentication">Authentification</TabsTrigger>
            <TabsTrigger value="errors">Erreurs</TabsTrigger>
            <TabsTrigger value="ratelimits">Rate Limits</TabsTrigger>
          </TabsList>

          <TabsContent value="endpoints">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800/50 border-slate-700 sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Catégories</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <nav className="space-y-1">
                      {API_ENDPOINTS.map((cat) => (
                        <a
                          key={cat.category}
                          href={`#${cat.category.toLowerCase()}`}
                          className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                        >
                          <cat.icon className="w-4 h-4" />
                          {cat.category}
                        </a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Content */}
              <div className="lg:col-span-3 space-y-6">
                {API_ENDPOINTS.map((cat) => (
                  <div key={cat.category} id={cat.category.toLowerCase()}>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <cat.icon className="w-5 h-5 text-violet-500" />
                      {cat.category}
                    </h2>
                    <Accordion type="single" collapsible className="space-y-2">
                      {cat.endpoints.map((endpoint, index) => (
                        <AccordionItem key={index} value={`${cat.category}-${index}`} className="bg-slate-800/50 border-slate-700 rounded-lg">
                          <AccordionTrigger className="px-4 hover:no-underline">
                            <div className="flex items-center gap-3">
                              <Badge className={cn(
                                "font-mono text-xs",
                                endpoint.method === 'GET' && "bg-emerald-500/10 text-emerald-500",
                                endpoint.method === 'POST' && "bg-blue-500/10 text-blue-500",
                                endpoint.method === 'PUT' && "bg-amber-500/10 text-amber-500",
                                endpoint.method === 'DELETE' && "bg-red-500/10 text-red-500"
                              )}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-slate-300">{endpoint.path}</code>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4">
                            <p className="text-slate-400 mb-4">{endpoint.description}</p>
                            
                            {endpoint.params.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-white mb-2">Paramètres</h4>
                                <div className="bg-slate-900 rounded-lg overflow-hidden">
                                  <table className="w-full text-sm">
                                    <thead className="bg-slate-800">
                                      <tr>
                                        <th className="text-left p-2 text-slate-400">Nom</th>
                                        <th className="text-left p-2 text-slate-400">Type</th>
                                        <th className="text-left p-2 text-slate-400">Requis</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {endpoint.params.map((param, i) => (
                                        <tr key={i} className="border-t border-slate-800">
                                          <td className="p-2 text-white font-mono">{param.name}</td>
                                          <td className="p-2 text-slate-400">{param.type}</td>
                                          <td className="p-2">
                                            {param.required ? (
                                              <Badge className="bg-red-500/10 text-red-400 text-xs">Requis</Badge>
                                            ) : (
                                              <Badge className="bg-slate-700 text-slate-400 text-xs">Optionnel</Badge>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="text-sm font-medium text-white mb-2">Réponse</h4>
                              <pre className="bg-slate-900 p-3 rounded-lg text-sm text-slate-300 overflow-x-auto">
                                {endpoint.response}
                              </pre>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="authentication">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-violet-500" />
                  Authentification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-400">
                  L'API utilise l'authentification par clé API. Incluez votre clé dans l'en-tête Authorization de chaque requête.
                </p>

                <div>
                  <h3 className="text-white font-medium mb-2">Format de l'en-tête</h3>
                  <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300">
                    Authorization: Bearer YOUR_API_KEY
                  </pre>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Obtenir une clé API</h3>
                  <ol className="list-decimal list-inside space-y-2 text-slate-400">
                    <li>Connectez-vous à votre compte</li>
                    <li>Accédez à la page <a href="/api-keys" className="text-violet-400 hover:underline">Clés API</a></li>
                    <li>Cliquez sur "Créer une nouvelle clé"</li>
                    <li>Donnez un nom à votre clé et sélectionnez les permissions</li>
                    <li>Copiez la clé générée (elle ne sera plus affichée)</li>
                  </ol>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <h3 className="text-amber-500 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Sécurité
                  </h3>
                  <p className="text-slate-400 text-sm mt-2">
                    Ne partagez jamais vos clés API. Ne les exposez pas dans le code client ou les dépôts publics.
                    Utilisez des variables d'environnement pour stocker vos clés.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Codes d'erreur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { code: 200, description: "Succès" },
                    { code: 201, description: "Créé avec succès" },
                    { code: 400, description: "Requête invalide - Vérifiez les paramètres" },
                    { code: 401, description: "Non authentifié - Clé API manquante ou invalide" },
                    { code: 403, description: "Accès refusé - Permissions insuffisantes" },
                    { code: 404, description: "Ressource non trouvée" },
                    { code: 429, description: "Trop de requêtes - Rate limit atteint" },
                    { code: 500, description: "Erreur serveur - Veuillez réessayer" }
                  ].map((error) => (
                    <div key={error.code} className="flex items-center gap-4 p-3 bg-slate-900/50 rounded-lg">
                      <Badge className={cn(
                        "font-mono",
                        error.code < 300 ? "bg-emerald-500/10 text-emerald-500" :
                        error.code < 500 ? "bg-amber-500/10 text-amber-500" :
                        "bg-red-500/10 text-red-500"
                      )}>
                        {error.code}
                      </Badge>
                      <span className="text-slate-300">{error.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratelimits">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Limites de requêtes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="text-left p-3 text-slate-400">Plan</th>
                        <th className="text-left p-3 text-slate-400">Requêtes/minute</th>
                        <th className="text-left p-3 text-slate-400">Requêtes/jour</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      <tr>
                        <td className="p-3 text-white">Starter</td>
                        <td className="p-3 text-slate-300">100</td>
                        <td className="p-3 text-slate-300">10,000</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white">Professional</td>
                        <td className="p-3 text-slate-300">500</td>
                        <td className="p-3 text-slate-300">100,000</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white">Enterprise</td>
                        <td className="p-3 text-slate-300">2,000</td>
                        <td className="p-3 text-slate-300">Illimité</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white">Agency</td>
                        <td className="p-3 text-slate-300">1,000</td>
                        <td className="p-3 text-slate-300">500,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6">
                  <h3 className="text-white font-medium mb-3">En-têtes de rate limit</h3>
                  <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300">
{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699887600`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Code Examples */}
        <Card className="bg-slate-800/50 border-slate-700 mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-violet-500" />
                Exemples de code
              </CardTitle>
              <div className="flex gap-2">
                {(['javascript', 'python', 'curl'] as const).map((lang) => (
                  <Button
                    key={lang}
                    variant={selectedLanguage === lang ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang)}
                    className={selectedLanguage === lang ? 'bg-violet-600' : ''}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto">
                {CODE_EXAMPLES[selectedLanguage]}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyCode(CODE_EXAMPLES[selectedLanguage], selectedLanguage)}
              >
                {copied === selectedLanguage ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
