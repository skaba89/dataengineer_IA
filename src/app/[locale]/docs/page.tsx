'use client'

/**
 * DataSphere Innovation - Swagger UI Documentation Page
 * Interactive API documentation powered by Swagger UI
 */

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Database,
  FileJson,
  Download,
  ExternalLink,
  Code,
  ArrowLeft,
  Key,
  Shield,
  Zap,
  Book,
  Copy,
  Check
} from 'lucide-react'

// Import SwaggerUI styles
import 'swagger-ui-react/swagger-ui.css'

interface SwaggerUIProps {
  spec: object
}

// Dynamic SwaggerUI component that only renders on client
function SwaggerUI({ spec }: SwaggerUIProps) {
  const [SwaggerUIComponent, setSwaggerUIComponent] = useState<React.ComponentType<{ spec: object }> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Dynamically import swagger-ui-react only on client side
    import('swagger-ui-react').then((module) => {
      setSwaggerUIComponent(() => module.default)
    })
  }, [])

  if (!mounted || !SwaggerUIComponent) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-800/50 rounded-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Chargement de Swagger UI...</p>
        </div>
      </div>
    )
  }

  return <SwaggerUIComponent spec={spec} />
}

export default function DocsPage() {
  const [spec, setSpec] = useState<object | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Fetch the OpenAPI spec
    fetch('/api/docs')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load API specification')
        return res.json()
      })
      .then((data) => {
        setSpec(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const copySpecUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/api/docs`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Link>
              <div className="w-px h-6 bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">DataSphere API</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300"
                onClick={copySpecUrl}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copié !' : 'Copier URL spec'}
              </Button>
              <a href="/api/docs" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                  <FileJson className="w-4 h-4 mr-2" />
                  JSON
                </Button>
              </a>
              <a href="/api/docs?format=yaml" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300">
                  <Download className="w-4 h-4 mr-2" />
                  YAML
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">23+</div>
                <div className="text-sm text-slate-400">Endpoints</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">10</div>
                <div className="text-sm text-slate-400">Agents IA</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">2</div>
                <div className="text-sm text-slate-400">Auth Methods</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">15+</div>
                <div className="text-sm text-slate-400">Schemas</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Key className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Authentification requise</h3>
                <p className="text-slate-300">
                  La plupart des endpoints nécessitent un token Bearer JWT ou une clé API.
                  Obtenez vos identifiants depuis la page{' '}
                  <Link href="/api-keys" className="text-blue-400 hover:underline">
                    Clés API
                  </Link>.
                </p>
              </div>
              <Link href="/api-keys">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Obtenir une clé API
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* API Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Catégories API</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Auth', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
              { name: 'Projects', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
              { name: 'Agents', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
              { name: 'Billing', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
              { name: 'Connectors', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
              { name: 'Workflows', color: 'bg-pink-500/10 text-pink-400 border-pink-500/30' },
              { name: 'Organizations', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
              { name: 'API Keys', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
            ].map((cat) => (
              <Badge key={cat.name} className={`${cat.color} px-3 py-1`}>
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Swagger UI Container */}
        <Card className="bg-slate-800/30 border-slate-700 overflow-hidden">
          <CardHeader className="bg-slate-800 border-b border-slate-700">
            <CardTitle className="text-white flex items-center gap-2">
              <FileJson className="w-5 h-5 text-blue-400" />
              Documentation Interactive
            </CardTitle>
            <CardDescription className="text-slate-400">
              Explorez et testez les endpoints de l'API DataSphere Innovation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading && (
              <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400">Chargement de la spécification...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Erreur de chargement</h3>
                  <p className="text-slate-400 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Réessayer
                  </Button>
                </div>
              </div>
            )}
            {spec && (
              <div className="swagger-wrapper [&_.swagger-ui]:!bg-slate-900 [&_.information-container]:!bg-slate-900 [&_.information]:!bg-slate-900 [&_.info]:!bg-slate-900 [&_.info_title]:!text-white [&_.info_p]:!text-slate-300 [&_.base-url]:!text-slate-400 [&_hgroup]:!bg-slate-900 [&_.scheme-container]:!bg-slate-800 [&_.schemes]:!bg-slate-800 [&_.schemes_wrapper]:!bg-slate-800 [&_select]:!bg-slate-700 [&_select]:!text-white [&_select]:!border-slate-600 [&_.methods]:!bg-slate-800 [&_.methods]:!border-slate-700 [&_.tag]:!bg-slate-800 [&_.tag]:!border-slate-700 [&_.opblock-tag-section]:!border-slate-700 [&_.opblock-tag]:!text-white [&_.opblock-tag]:!border-b-slate-700 [&_.opblock]:!bg-slate-800 [&_.opblock]:!border-slate-700 [&_.opblock-summary]:!bg-slate-800 [&_.opblock-summary]:!border-slate-700 [&_.opblock-summary-view]:!text-white [&_.opblock-body]:!bg-slate-900 [&_.opblock-body]:!border-slate-700 [&_table]:!bg-slate-900 [&_th]:!text-slate-300 [&_td]:!text-slate-300 [&_.parameters]:!bg-slate-900 [&_.parameter]:!border-b-slate-700 [&_.response-col_description]:!text-slate-300 [&_pre]:!bg-slate-950 [&_code]:!bg-slate-950 [&_.model-box]:!bg-slate-800 [&_.model-box]:!border-slate-700 [&_.model-box-control]:!text-white [&_.model]:!text-slate-300 [&_.model-title]:!text-white [&_.btn]:!bg-slate-700 [&_.btn]:!text-white [&_.btn]:!border-slate-600 [&_.btn.execute]:!bg-blue-600 [&_.btn.execute]:!border-blue-500 [&_input]:!bg-slate-700 [&_input]:!text-white [&_input]:!border-slate-600 [&_textarea]:!bg-slate-700 [&_textarea]:!text-white [&_textarea]:!border-slate-600 [&_.model-box]:!mb-2">
                <SwaggerUI spec={spec} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Book className="w-5 h-5 text-blue-400" />
                Ressources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white transition">
                <ExternalLink className="w-4 h-4" />
                Guide de démarrage rapide
              </a>
              <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white transition">
                <ExternalLink className="w-4 h-4" />
                Exemples de code (SDK)
              </a>
              <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white transition">
                <ExternalLink className="w-4 h-4" />
                Changelog API
              </a>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="mailto:support@datasphere.io" className="flex items-center gap-3 text-slate-300 hover:text-white transition">
                <ExternalLink className="w-4 h-4" />
                support@datasphere.io
              </a>
              <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white transition">
                <ExternalLink className="w-4 h-4" />
                Statut des services
              </a>
              <a href="#" className="flex items-center gap-3 text-slate-300 hover:text-white transition">
                <ExternalLink className="w-4 h-4" />
                Communauté Discord
              </a>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-400 text-sm">
                DataSphere Innovation API v2.0.0
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition">Conditions</a>
              <a href="#" className="hover:text-white transition">Confidentialité</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
