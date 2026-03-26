'use client'

import { useState } from 'react'
import { 
  User, 
  Building, 
  Shield, 
  Bell, 
  Key, 
  Palette, 
  Globe, 
  CreditCard,
  Users,
  Lock,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Check,
  AlertTriangle,
  Trash2,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Form states
  const [profile, setProfile] = useState({
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@datasphere.io',
    phone: '+33 6 12 34 56 78',
    company: 'Demo Company',
    role: 'admin',
    timezone: 'Europe/Paris',
    language: 'fr'
  })

  const [security, setSecurity] = useState({
    mfaEnabled: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginNotifications: true
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReport: true,
    projectUpdates: true,
    securityAlerts: true,
    marketingEmails: false
  })

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast.success('Paramètres sauvegardés avec succès')
  }

  const handleReset = () => {
    toast.info('Paramètres réinitialisés')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 mt-1">Gérez votre compte et vos préférences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border rounded-lg p-1">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="organization" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Organisation
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Facturation
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src="/avatars/demo.png" />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                      DU
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Changer la photo</Button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG ou GIF. 1MB max.</p>
                  </div>
                </div>

                <Separator />

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Préférences</CardTitle>
                <CardDescription>Configurez vos préférences d'affichage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select value={profile.timezone} onValueChange={(value) => setProfile({ ...profile, timezone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (UTC)</SelectItem>
                        <SelectItem value="America/New_York">America/New York (UTC-5)</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los Angeles (UTC-8)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <Select value={profile.language} onValueChange={(value) => setProfile({ ...profile, language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'organisation</CardTitle>
                <CardDescription>Gérez les informations de votre entreprise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Nom de l'entreprise</Label>
                    <Input defaultValue="Demo Company" />
                  </div>
                  <div className="space-y-2">
                    <Label>Site web</Label>
                    <Input defaultValue="https://demo-company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Industrie</Label>
                    <Select defaultValue="technology">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technologie</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Santé</SelectItem>
                        <SelectItem value="retail">Commerce</SelectItem>
                        <SelectItem value="manufacturing">Industrie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan actuel</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-violet-600 to-purple-600">Professional</Badge>
                      <Button variant="link" size="sm">Mettre à niveau</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Membres de l'équipe</span>
                  <Button size="sm">Inviter</Button>
                </CardTitle>
                <CardDescription>Gérez les membres de votre équipe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Demo User', email: 'demo@datasphere.io', role: 'Admin', status: 'active' },
                    { name: 'John Doe', email: 'john@datasphere.io', role: 'Analyst', status: 'active' },
                    { name: 'Jane Smith', email: 'jane@datasphere.io', role: 'Viewer', status: 'pending' },
                  ].map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                        <Button variant="ghost" size="sm">...</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mot de passe actuel</Label>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nouveau mot de passe</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Confirmer le mot de passe</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button>Mettre à jour le mot de passe</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Authentification à deux facteurs</CardTitle>
                <CardDescription>Ajoutez une couche de sécurité supplémentaire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Application d'authentification</p>
                      <p className="text-sm text-gray-500">Utilisez Google Authenticator ou similaire</p>
                    </div>
                  </div>
                  <Switch
                    checked={security.mfaEnabled}
                    onCheckedChange={(checked) => setSecurity({ ...security, mfaEnabled: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session timeout</p>
                    <p className="text-sm text-gray-500">Déconnexion automatique après inactivité</p>
                  </div>
                  <Select 
                    value={String(security.sessionTimeout)} 
                    onValueChange={(value) => setSecurity({ ...security, sessionTimeout: Number(value) })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="60">1 heure</SelectItem>
                      <SelectItem value="120">2 heures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions actives</CardTitle>
                <CardDescription>Gérez vos sessions connectées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { device: 'Chrome sur Windows', location: 'Paris, France', current: true },
                    { device: 'Safari sur iPhone', location: 'Paris, France', current: false },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{session.device}</p>
                        <p className="text-sm text-gray-500">{session.location}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.current && <Badge variant="secondary">Actuelle</Badge>}
                        {!session.current && (
                          <Button variant="destructive" size="sm">Déconnecter</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Alertes par email</p>
                      <p className="text-sm text-gray-500">Recevez les alertes importantes par email</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Notifications push</p>
                      <p className="text-sm text-gray-500">Notifications dans le navigateur</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Alertes de sécurité</p>
                      <p className="text-sm text-gray-500">Notifications de connexion et activités suspectes</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, securityAlerts: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Rapport hebdomadaire</p>
                      <p className="text-sm text-gray-500">Résumé d'activité chaque semaine</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.weeklyReport}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Mises à jour projets</p>
                      <p className="text-sm text-gray-500">Notifications sur vos projets</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.projectUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, projectUpdates: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clés API</CardTitle>
                <CardDescription>Gérez vos clés d'accès à l'API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Clé de production</p>
                    <p className="text-sm text-gray-500 font-mono">ds_prod_••••••••••••••••</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Copier</Button>
                    <Button variant="destructive" size="sm">Révoquer</Button>
                  </div>
                </div>
                <Button>Générer une nouvelle clé</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Configurez les webhooks pour votre intégration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Configuration requise</AlertTitle>
                  <AlertDescription>
                    Configurez vos webhooks pour recevoir les événements en temps réel.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label>URL du webhook</Label>
                  <Input placeholder="https://votre-serveur.com/webhook" />
                </div>
                <Button>Enregistrer le webhook</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan actuel</CardTitle>
                <CardDescription>Votre abonnement et ses avantages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                  <div>
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 mb-2">Professional</Badge>
                    <p className="text-2xl font-bold">499€<span className="text-sm font-normal text-gray-500">/mois</span></p>
                    <p className="text-sm text-gray-500">Renouvellement le 15 janvier 2025</p>
                  </div>
                  <Button variant="outline">Changer de plan</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilisation</CardTitle>
                <CardDescription>Votre consommation ce mois-ci</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Projets</span>
                    <span>8 / 20</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Requêtes API</span>
                    <span>45,000 / 100,000</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Stockage</span>
                    <span>12 GB / 50 GB</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-violet-600 rounded-full" style={{ width: '24%' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Méthode de paiement</CardTitle>
                <CardDescription>Gérez vos moyens de paiement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-gray-500" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expire 12/2025</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">Annuler</Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
