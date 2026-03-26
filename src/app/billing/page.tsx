"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  CreditCard, Download, AlertCircle, Check, X, Zap, Building2, Users, Sparkles,
  TrendingUp, Calendar, FileText, Settings, Loader2, ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import {
  Alert, AlertDescription, AlertTitle
} from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  seats: number
  limits: {
    projects: number
    dataSources: number
    executions: number
    exports: number
    teamMembers: number
  }
}

interface Usage {
  projects: number
  dataSources: number
  executions: number
  exports: number
  teamMembers: number
  periodStart: string
  periodEnd: string
}

interface Invoice {
  id: string
  stripeInvoiceId: string
  amount: number
  currency: string
  status: string
  invoicePdf?: string
  paidAt?: string
  createdAt: string
}

const planConfig = {
  starter: {
    name: "Starter",
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    price: 499
  },
  professional: {
    name: "Professional",
    icon: Zap,
    color: "from-violet-500 to-purple-500",
    price: 1499
  },
  enterprise: {
    name: "Enterprise",
    icon: Building2,
    color: "from-amber-500 to-orange-500",
    price: 4999
  },
  agency: {
    name: "Agency",
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    price: 2999
  }
}

const planFeatures = {
  starter: [
    "1 projet actif", "3 sources de données", "50 exécutions/mois",
    "Templates basiques", "Support email", "Export PDF"
  ],
  professional: [
    "5 projets actifs", "10 sources de données", "500 exécutions/mois",
    "Tous les templates", "Support prioritaire", "Export PDF & ZIP",
    "Calculateur ROI", "Orchestration (Airflow/Dagster)", "API Access"
  ],
  enterprise: [
    "Projets illimités", "Sources illimitées", "Exécutions illimitées",
    "SSO (SAML, OIDC)", "Domaine personnalisé", "Audit logs",
    "SLA 99.9%", "Account manager dédié", "Formation incluse"
  ],
  agency: [
    "Multi-clients", "White-label", "Facturation intégrée",
    "Portail client", "Templates personnalisés", "Commission marketplace",
    "Support dédié", "Onboarding personnalisé"
  ]
}

export default function BillingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [plans, setPlans] = useState<any>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/billing/subscription')
      const data = await response.json()

      if (data.success) {
        setSubscription(data.subscription)
        setUsage(data.usage)
        setInvoices(data.invoices || [])
        setPlans(data.plans)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (plan: string) => {
    setProcessing(true)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingPeriod: 'monthly' })
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        toast({
          title: "Succès",
          description: "Votre abonnement a été mis à jour",
        })
        fetchBillingData()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la demande",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
      setUpgradeDialogOpen(false)
    }
  }

  const handleCancel = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Abonnement annulé",
          description: "Votre abonnement sera annulé à la fin de la période en cours",
        })
        fetchBillingData()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'abonnement",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
      setCancelDialogOpen(false)
    }
  }

  const handleReactivate = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/billing/subscription', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Abonnement réactivé",
          description: "Votre abonnement a été réactivé avec succès",
        })
        fetchBillingData()
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réactiver l'abonnement",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const getUsagePercent = (current: number, limit: number) => {
    if (limit === -1) return 0 // Unlimited
    return Math.min(100, (current / limit) * 100)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      past_due: "bg-red-500/10 text-red-500 border-red-500/20",
      canceled: "bg-slate-500/10 text-slate-500 border-slate-500/20",
      trialing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      incomplete: "bg-amber-500/10 text-amber-500 border-amber-500/20"
    }
    const labels: Record<string, string> = {
      active: "Actif",
      past_due: "En retard",
      canceled: "Annulé",
      trialing: "Période d'essai",
      incomplete: "Incomplet"
    }
    return <Badge className={styles[status] || styles.incomplete}>{labels[status] || status}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  const currentPlan = subscription?.plan || 'starter'
  const planInfo = planConfig[currentPlan as keyof typeof planConfig]
  const PlanIcon = planInfo?.icon || Sparkles

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Facturation & Abonnement</h1>
          <p className="text-slate-400">Gérez votre abonnement, consultez votre utilisation et vos factures</p>
        </div>

        {/* Alert if no subscription */}
        {!subscription && (
          <Alert className="mb-8 bg-amber-500/10 border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500">Aucun abonnement actif</AlertTitle>
            <AlertDescription className="text-slate-400">
              Vous n'avez pas encore d'abonnement actif. Choisissez un forfait pour commencer.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Votre forfait
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${planInfo?.color} flex items-center justify-center`}>
                      <PlanIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{planInfo?.name}</h3>
                      {getStatusBadge(subscription.status)}
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-white">
                    {planInfo?.price}€<span className="text-lg text-slate-400">/mois</span>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <Alert className="bg-red-500/10 border-red-500/20">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-400">
                        Annulation prévue le {formatDate(subscription.currentPeriodEnd)}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="text-sm text-slate-400">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Prochaine facturation : {formatDate(subscription.currentPeriodEnd)}
                  </div>

                  <Separator className="bg-slate-700" />

                  <div className="space-y-2">
                    {planFeatures[currentPlan as keyof typeof planFeatures]?.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">Aucun abonnement actif</p>
                  <Button onClick={() => router.push('/pricing')}>
                    Voir les forfaits
                  </Button>
                </div>
              )}
            </CardContent>
            {subscription && (
              <CardFooter className="flex-col gap-2">
                {subscription.cancelAtPeriodEnd ? (
                  <Button
                    onClick={handleReactivate}
                    disabled={processing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Réactiver l'abonnement
                  </Button>
                ) : (
                  <>
                    <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-violet-600 hover:bg-violet-700">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Changer de forfait
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Choisir un nouveau forfait</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Sélectionnez le forfait qui correspond à vos besoins
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {Object.entries(planConfig).map(([key, plan]) => (
                            <Button
                              key={key}
                              variant={key === currentPlan ? "outline" : "default"}
                              disabled={key === currentPlan}
                              onClick={() => handleUpgrade(key)}
                              className={`justify-start ${key !== currentPlan ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
                            >
                              <plan.icon className="w-4 h-4 mr-2" />
                              {plan.name} - {plan.price}€/mois
                              {key === currentPlan && " (actuel)"}
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full text-slate-400 hover:text-red-400">
                          Annuler l'abonnement
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Annuler l'abonnement ?</DialogTitle>
                          <DialogDescription className="text-slate-400">
                            Votre abonnement sera annulé à la fin de la période en cours.
                            Vous pourrez continuer à utiliser le service jusqu'au {formatDate(subscription.currentPeriodEnd)}.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="ghost" onClick={() => setCancelDialogOpen(false)}>
                            Retour
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={processing}
                          >
                            Confirmer l'annulation
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </CardFooter>
            )}
          </Card>

          {/* Usage Card */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Utilisation ce mois
              </CardTitle>
              <CardDescription className="text-slate-400">
                Période : {usage ? `${formatDate(usage.periodStart)} - ${formatDate(usage.periodEnd)}` : 'N/A'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usage && subscription ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Projects */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Projets</span>
                      <span className="text-white">
                        {usage.projects} / {subscription.limits.projects === -1 ? '∞' : subscription.limits.projects}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercent(usage.projects, subscription.limits.projects)}
                      className="h-2"
                    />
                  </div>

                  {/* Data Sources */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Sources de données</span>
                      <span className="text-white">
                        {usage.dataSources} / {subscription.limits.dataSources === -1 ? '∞' : subscription.limits.dataSources}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercent(usage.dataSources, subscription.limits.dataSources)}
                      className="h-2"
                    />
                  </div>

                  {/* Executions */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Exécutions</span>
                      <span className="text-white">
                        {usage.executions} / {subscription.limits.executions === -1 ? '∞' : subscription.limits.executions}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercent(usage.executions, subscription.limits.executions)}
                      className="h-2"
                    />
                  </div>

                  {/* Exports */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Exports</span>
                      <span className="text-white">
                        {usage.exports} / {subscription.limits.exports === -1 ? '∞' : subscription.limits.exports}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercent(usage.exports, subscription.limits.exports)}
                      className="h-2"
                    />
                  </div>

                  {/* Team Members */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Membres d'équipe</span>
                      <span className="text-white">
                        {usage.teamMembers} / {subscription.limits.teamMembers === -1 ? '∞' : subscription.limits.teamMembers}
                      </span>
                    </div>
                    <Progress
                      value={getUsagePercent(usage.teamMembers, subscription.limits.teamMembers)}
                      className="h-2"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  Aucune donnée d'utilisation disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invoices */}
        <Card className="mt-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Factures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          Facture #{invoice.stripeInvoiceId.slice(-8)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {formatDate(invoice.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </div>
                        <Badge className={
                          invoice.status === 'paid'
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }>
                          {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                        </Badge>
                      </div>
                      {invoice.invoicePdf && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={invoice.invoicePdf} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                Aucune facture disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mt-6 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Méthode de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <div className="text-white">•••• •••• •••• 4242</div>
                  <div className="text-sm text-slate-400">Expire 12/2025</div>
                </div>
              </div>
              <Button variant="outline" className="border-slate-600">
                Modifier
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
