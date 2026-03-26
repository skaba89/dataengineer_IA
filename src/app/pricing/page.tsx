"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Check, X, Zap, Building2, Users, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "Pour les startups et TPE qui débutent leur transformation data",
    price: { monthly: 499, yearly: 4784 },
    icon: Sparkles,
    color: "from-blue-500 to-cyan-500",
    features: [
      { text: "1 projet actif", included: true },
      { text: "3 sources de données", included: true },
      { text: "50 exécutions/mois", included: true },
      { text: "Templates basiques", included: true },
      { text: "Support email", included: true },
      { text: "Export PDF", included: true },
      { text: "Connecteurs avancés", included: false },
      { text: "API Access", included: false },
    ],
    cta: "Commencer",
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    description: "Pour les PME qui veulent accélérer leurs projets data",
    price: { monthly: 1499, yearly: 14390 },
    icon: Zap,
    color: "from-violet-500 to-purple-500",
    features: [
      { text: "5 projets actifs", included: true },
      { text: "10 sources de données", included: true },
      { text: "500 exécutions/mois", included: true },
      { text: "Tous les templates", included: true },
      { text: "Support prioritaire", included: true },
      { text: "Export PDF & ZIP", included: true },
      { text: "Calculateur ROI", included: true },
      { text: "Orchestration (Airflow/Dagster)", included: true },
      { text: "API Access", included: true },
      { text: "SSO", included: false },
    ],
    cta: "Choisir Professional",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Pour les grandes entreprises avec besoins avancés",
    price: { monthly: 4999, yearly: 47990 },
    icon: Building2,
    color: "from-amber-500 to-orange-500",
    features: [
      { text: "Projets illimités", included: true },
      { text: "Sources illimitées", included: true },
      { text: "Exécutions illimitées", included: true },
      { text: "SSO (SAML, OIDC)", included: true },
      { text: "Domaine personnalisé", included: true },
      { text: "Audit logs", included: true },
      { text: "SLA 99.9%", included: true },
      { text: "Account manager dédié", included: true },
      { text: "Formation incluse", included: true },
      { text: "Support 24/7", included: true },
    ],
    cta: "Contacter les ventes",
    popular: false,
    isContact: true,
  },
  {
    id: "agency",
    name: "Agency",
    description: "Pour les cabinets conseil et intégrateurs",
    price: { monthly: 2999, yearly: 28790 },
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    features: [
      { text: "Multi-clients", included: true },
      { text: "White-label", included: true },
      { text: "Facturation intégrée", included: true },
      { text: "Portail client", included: true },
      { text: "Templates personnalisés", included: true },
      { text: "Commission marketplace", included: true },
      { text: "Support dédié", included: true },
      { text: "Onboarding personnalisé", included: true },
    ],
    cta: "Nous contacter",
    popular: false,
    isContact: true,
  },
]

const faqs = [
  {
    question: "Puis-je changer de forfait à tout moment ?",
    answer:
      "Oui, vous pouvez upgrader ou downgrader votre forfait à tout moment. Les changements sont proratisés et appliqués immédiatement.",
  },
  {
    question: "Y a-t-il une période d'essai gratuite ?",
    answer:
      "Oui, nous offrons 14 jours d'essai gratuit sur tous les forfaits. Aucune carte de crédit n'est requise pour commencer.",
  },
  {
    question: "Quels modes de paiement acceptez-vous ?",
    answer:
      "Nous acceptons les cartes bancaires, les virements bancaires pour les forfaits annuels, et les paiements par facture pour les clients Enterprise.",
  },
  {
    question: "Comment fonctionne le support ?",
    answer:
      "Starter: Support email avec réponse sous 48h. Professional: Support prioritaire avec réponse sous 4h. Enterprise: Account manager dédié et support 24/7.",
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer:
      "Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. L'annulation prend effet à la fin de la période de facturation en cours.",
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [loading, setLoading] = useState<string | null>(null)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  })

  const handleSubscribe = async (planId: string) => {
    // For enterprise/agency plans, show contact form
    const plan = plans.find(p => p.id === planId)
    if (plan?.isContact) {
      setShowContactDialog(true)
      return
    }

    // Check if user is logged in
    if (status !== "authenticated") {
      router.push(`/login?redirect=/pricing&plan=${planId}`)
      return
    }

    setLoading(planId)

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billingPeriod })
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl
      } else if (data.success) {
        // Subscription created without Stripe (demo mode)
        toast({
          title: "Abonnement créé",
          description: "Votre période d'essai de 14 jours a commencé !",
        })
        router.push('/dashboard')
      } else {
        throw new Error(data.error || 'Erreur lors de la création de l\'abonnement')
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  const handleContactSubmit = async () => {
    setLoading('contact')
    try {
      // In a real app, this would send an email or create a lead in CRM
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: "Message envoyé",
        description: "Notre équipe vous contactera dans les plus brefs délais.",
      })
      setShowContactDialog(false)
      setContactForm({ name: "", email: "", company: "", message: "" })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20">
          Tarifs simples et transparents
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Choisissez le forfait
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            adapté à vos besoins
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Démarrez gratuitement pendant 14 jours. Pas de carte de crédit requise.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Label className={billingPeriod === "monthly" ? "text-white" : "text-slate-400"}>
            Mensuel
          </Label>
          <Switch
            checked={billingPeriod === "yearly"}
            onCheckedChange={(checked) => setBillingPeriod(checked ? "yearly" : "monthly")}
            className="data-[state=checked]:bg-violet-600"
          />
          <Label className={billingPeriod === "yearly" ? "text-white" : "text-slate-400"}>
            Annuel
            <Badge className="ml-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">-20%</Badge>
          </Label>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            const price = plan.price[billingPeriod]
            const isLoading = loading === plan.id

            return (
              <Card
                key={plan.id}
                className={`relative bg-slate-800/50 border-slate-700 backdrop-blur-sm ${
                  plan.popular ? "ring-2 ring-violet-500 scale-105 z-10" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                      Plus populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div
                    className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {price.toLocaleString()}€
                    </span>
                    <span className="text-slate-400">
                      /{billingPeriod === "monthly" ? "mois" : "an"}
                    </span>
                  </div>
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-slate-300" : "text-slate-500"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading}
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                    size="lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ROI Preview */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-violet-900/50 to-purple-900/50 border-violet-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              Calculez votre ROI potentiel
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-emerald-400 mb-2">85%</div>
                <div className="text-slate-400">Réduction temps de développement</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-emerald-400 mb-2">3 mois</div>
                <div className="text-slate-400">Payback moyen</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-emerald-400 mb-2">350%</div>
                <div className="text-slate-400">ROI moyen 1ère année</div>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600"
              onClick={() => router.push('/dashboard?tab=roi')}
            >
              Calculer mon ROI
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQs */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Questions fréquentes
        </h2>
        <Accordion type="single" collapsible className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-slate-700">
              <AccordionTrigger className="text-white hover:text-violet-400">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-400">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-violet-600 to-purple-600 border-0">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à transformer vos données ?
            </h2>
            <p className="text-violet-100 mb-8">
              Commencez votre essai gratuit de 14 jours aujourd'hui.
            </p>
            <Button
              size="lg"
              className="bg-white text-violet-600 hover:bg-slate-100"
              onClick={() => handleSubscribe('professional')}
            >
              Démarrer l'essai gratuit
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Contactez-nous</DialogTitle>
            <DialogDescription className="text-slate-400">
              Notre équipe vous contactera dans les plus brefs délais pour discuter de vos besoins.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-slate-300">Nom complet</Label>
              <input
                type="text"
                className="w-full mt-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-slate-300">Email professionnel</Label>
              <input
                type="email"
                className="w-full mt-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-slate-300">Entreprise</Label>
              <input
                type="text"
                className="w-full mt-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-slate-300">Message (optionnel)</Label>
              <textarea
                className="w-full mt-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500 min-h-[100px]"
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowContactDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleContactSubmit}
              disabled={loading === 'contact'}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {loading === 'contact' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
