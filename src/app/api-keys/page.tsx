"use client"

import { useState, useEffect } from "react"
import {
  Key, Plus, Trash2, Copy, Eye, EyeOff, Clock, Shield, AlertCircle,
  Check, Loader2, ExternalLink, Code
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string
  lastUsed: string | null
  expiresAt: string | null
  createdAt: string
}

const PERMISSIONS = [
  { id: 'read', label: 'Lecture', description: 'Accès en lecture aux projets et données' },
  { id: 'write', label: 'Écriture', description: 'Créer et modifier des projets' },
  { id: 'execute', label: 'Exécution', description: 'Déclencher des exécutions d\'agents' },
  { id: 'admin', label: 'Admin', description: 'Accès complet incluant la gestion des clés' }
]

export default function ApiKeysPage() {
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'],
    expiresInDays: 0
  })

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys')
      const data = await response.json()
      if (data.success) {
        setApiKeys(data.apiKeys)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la clé est requis",
        variant: "destructive"
      })
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setNewKey(data.apiKey.key)
        fetchApiKeys()
        toast({
          title: "Clé créée",
          description: data.warning
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de créer la clé",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (keyId: string) => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setApiKeys(apiKeys.filter(k => k.id !== keyId))
        toast({
          title: "Clé révoquée",
          description: "La clé API a été révoquée avec succès"
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de révoquer la clé",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
      setDeleteDialogOpen(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copié",
      description: "La clé a été copiée dans le presse-papier"
    })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Jamais'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const togglePermission = (permId: string) => {
    const current = formData.permissions
    if (current.includes(permId)) {
      setFormData({
        ...formData,
        permissions: current.filter(p => p !== permId)
      })
    } else {
      setFormData({
        ...formData,
        permissions: [...current, permId]
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Clés API</h1>
          <p className="text-slate-400">Gérez vos clés API pour intégrer le système dans vos applications</p>
        </div>

        {/* API Documentation Link */}
        <Card className="mb-6 bg-slate-800/50 border-slate-700">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-violet-400" />
                <div>
                  <div className="text-white font-medium">Documentation API</div>
                  <div className="text-sm text-slate-400">Guide d'intégration complet et référence API</div>
                </div>
              </div>
              <Button variant="outline" className="border-slate-600">
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir la documentation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="keys">Clés API</TabsTrigger>
            <TabsTrigger value="usage">Utilisation</TabsTrigger>
            <TabsTrigger value="examples">Exemples</TabsTrigger>
          </TabsList>

          <TabsContent value="keys">
            {/* New Key Display */}
            {newKey && (
              <Alert className="mb-6 bg-emerald-500/10 border-emerald-500/20">
                <Check className="h-4 w-4 text-emerald-500" />
                <AlertTitle className="text-emerald-500">Clé API créée</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="bg-slate-800 px-3 py-1 rounded text-sm text-white font-mono">
                      {showKey ? newKey : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(newKey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    ⚠️ Copiez cette clé maintenant, elle ne sera plus affichée ensuite.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setNewKey(null)}
                  >
                    Fermer
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* API Keys List */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Vos clés API</CardTitle>
                    <CardDescription className="text-slate-400">
                      Gérez les clés d'accès à votre compte
                    </CardDescription>
                  </div>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-violet-600 hover:bg-violet-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle clé
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Créer une clé API</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Générez une nouvelle clé pour accéder à l'API
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label className="text-slate-300">Nom de la clé</Label>
                          <Input
                            className="mt-1 bg-slate-900 border-slate-600"
                            placeholder="ex: Production App"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300">Permissions</Label>
                          <div className="mt-2 space-y-2">
                            {PERMISSIONS.map((perm) => (
                              <div key={perm.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={perm.id}
                                  checked={formData.permissions.includes(perm.id)}
                                  onCheckedChange={() => togglePermission(perm.id)}
                                />
                                <div className="grid gap-1 leading-none">
                                  <label
                                    htmlFor={perm.id}
                                    className="text-sm text-white font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {perm.label}
                                  </label>
                                  <p className="text-xs text-slate-400">{perm.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-slate-300">Expiration (jours)</Label>
                          <Input
                            type="number"
                            className="mt-1 bg-slate-900 border-slate-600"
                            placeholder="0 = pas d'expiration"
                            value={formData.expiresInDays || ''}
                            onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setCreateDialogOpen(false)}>
                          Annuler
                        </Button>
                        <Button
                          onClick={handleCreate}
                          disabled={processing}
                          className="bg-violet-600 hover:bg-violet-700"
                        >
                          {processing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                          Créer
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                  </div>
                ) : apiKeys.length > 0 ? (
                  <div className="space-y-3">
                    {apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <Key className="w-5 h-5 text-violet-400" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{apiKey.name}</div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                              <code className="font-mono">{apiKey.key}</code>
                              <Badge className="bg-slate-700 text-slate-300">
                                {JSON.parse(apiKey.permissions || '[]').join(', ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <div className="text-slate-400">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Dernière utilisation: {formatDate(apiKey.lastUsed)}
                            </div>
                            {apiKey.expiresAt && (
                              <div className="text-amber-400">
                                Expire le {formatDate(apiKey.expiresAt)}
                              </div>
                            )}
                          </div>
                          <Dialog open={deleteDialogOpen === apiKey.id} onOpenChange={(open) => setDeleteDialogOpen(open ? apiKey.id : null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-slate-700">
                              <DialogHeader>
                                <DialogTitle className="text-white">Révoquer la clé</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                  Êtes-vous sûr de vouloir révoquer cette clé ? Cette action est irréversible.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="ghost" onClick={() => setDeleteDialogOpen(null)}>
                                  Annuler
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDelete(apiKey.id)}
                                  disabled={processing}
                                >
                                  Révoquer
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune clé API configurée</p>
                    <p className="text-sm mt-2">Créez une clé pour commencer à utiliser l'API</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Utilisation API ce mois</CardTitle>
                <CardDescription className="text-slate-400">
                  Nombre d'appels API effectués
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-5xl font-bold text-white mb-2">0</div>
                  <div className="text-slate-400">appels API ce mois</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Exemples de code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Lister les projets</h4>
                  <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="text-slate-300">{`curl -X GET https://api.ade.io/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"`}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Déclencher une exécution</h4>
                  <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="text-slate-300">{`curl -X POST https://api.ade.io/v1/trigger \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "proj_xxx",
    "agentType": "discovery"
  }'`}</code>
                  </pre>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-2">JavaScript / Node.js</h4>
                  <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="text-slate-300">{`const response = await fetch('https://api.ade.io/v1/projects', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
console.log(data.projects);`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
