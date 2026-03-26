'use client'

/**
 * DataSphere Innovation - Commercial Landing Page
 * Professional, conversion-optimized landing page with all sections
 */

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ArrowRight,
  Check,
  Zap,
  Shield,
  BarChart3,
  Database,
  Bot,
  GitBranch,
  Clock,
  Star,
  Play,
  Sparkles,
  Search,
  FileCode,
  Settings,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Package,
  X,
  AlertTriangle,
  Users,
  Timer,
  Award,
  Lock,
  FileCheck,
  HeartHandshake,
  Building2,
  ShoppingBag,
  Briefcase,
  Linkedin,
  Twitter,
  Github,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Cpu,
  Layers,
  RefreshCw,
  Target,
  Gauge
} from 'lucide-react'

// 10 AI Agents data
const aiAgents = [
  {
    icon: Search,
    name: 'Discovery Agent',
    description: 'Analyse automatiquement vos sources de données et découvre les schémas',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Layers,
    name: 'Architecture Agent',
    description: 'Conçoit l\'architecture data optimale pour votre cas d\'usage',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: GitBranch,
    name: 'Pipeline Agent',
    description: 'Génère des pipelines ETL/ELT prêts à l\'emploi',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: RefreshCw,
    name: 'Transformation Agent',
    description: 'Automatise les transformations de données complexes',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: BarChart3,
    name: 'BI Agent',
    description: 'Crée des dashboards et rapports interactifs',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: MessageSquare,
    name: 'Conversational Agent',
    description: 'Interface conversationnelle pour interroger vos données',
    color: 'from-teal-500 to-blue-500'
  },
  {
    icon: DollarSign,
    name: 'Pricing Agent',
    description: 'Analyse et optimise les coûts de votre infrastructure',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Package,
    name: 'Productization Agent',
    description: 'Transforme vos data products en services commercialisables',
    color: 'from-pink-500 to-rose-500'
  },
  {
    icon: Target,
    name: 'Business Agent',
    description: 'Aligne les pipelines sur les objectifs business',
    color: 'from-cyan-500 to-teal-500'
  },
  {
    icon: Gauge,
    name: 'Quality Agent',
    description: 'Surveille et garantit la qualité des données',
    color: 'from-emerald-500 to-green-500'
  }
]

// Connectors data
const connectors = [
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'MySQL', color: '#4479A1' },
  { name: 'MongoDB', color: '#47A248' },
  { name: 'BigQuery', color: '#4285F4' },
  { name: 'Snowflake', color: '#29B5E8' }
]

// Pricing plans
const pricingPlans = [
  {
    name: 'Free',
    price: '0€',
    period: '/mois',
    description: 'Pour découvrir la plateforme',
    features: [
      '1 Projet',
      '2 Utilisateurs',
      '5 exécutions Agent/mois',
      '3 connecteurs',
      'Support email',
      'Documentation'
    ],
    cta: 'Commencer gratuitement',
    popular: false,
    gradient: false
  },
  {
    name: 'Starter',
    price: '299€',
    period: '/mois',
    description: 'Pour les petites équipes',
    features: [
      '5 Projets',
      '5 Utilisateurs',
      '50 exécutions Agent/mois',
      '10 connecteurs',
      'Support prioritaire',
      'Templates de pipelines'
    ],
    cta: 'Essai gratuit 14 jours',
    popular: false,
    gradient: false
  },
  {
    name: 'Professional',
    price: '999€',
    period: '/mois',
    description: 'Pour les équipes en croissance',
    features: [
      'Projets illimités',
      '25 Utilisateurs',
      '500 exécutions Agent/mois',
      '35+ connecteurs',
      'SSO inclus',
      'SLA 99.9%',
      'Support dédié'
    ],
    cta: 'Essai gratuit 14 jours',
    popular: true,
    gradient: true
  },
  {
    name: 'Enterprise',
    price: 'Sur devis',
    period: '',
    description: 'Pour les grandes organisations',
    features: [
      'Tout illimité',
      'Utilisateurs illimités',
      'Agents illimités',
      'Connecteurs personnalisés',
      'SLA 99.99%',
      'Infrastructure dédiée',
      'Account Manager dédié',
      'Formation sur site'
    ],
    cta: 'Contacter les ventes',
    popular: false,
    gradient: false
  }
]

// Testimonials
const testimonials = [
  {
    quote: "DataSphere a réduit notre temps de développement de 6 mois à 3 semaines. Les agents IA comprennent nos besoins et génèrent un code de qualité production.",
    author: 'Marc Dupont',
    role: 'CTO',
    company: 'FinTech Solutions',
    avatar: 'MD',
    rating: 5
  },
  {
    quote: "Nous avons automatisé 80% de nos pipelines data. L'équipe peut maintenant se concentrer sur l'analyse plutôt que sur l'intégration.",
    author: 'Sophie Martin',
    role: 'Head of Data',
    company: 'E-Commerce Plus',
    avatar: 'SM',
    rating: 5
  },
  {
    quote: "La ROI a été visible dès le premier mois. Les connecteurs pré-configurés et les agents autonomes nous font gagner un temps précieux.",
    author: 'Pierre Bernard',
    role: 'CEO',
    company: 'Data Consulting Group',
    avatar: 'PB',
    rating: 5
  }
]

// FAQ items
const faqItems = [
  {
    question: 'Comment fonctionnent les agents IA ?',
    answer: 'Nos agents IA sont spécialisés dans différentes tâches du data engineering. Ils utilisent des modèles de langage avancés pour analyser vos besoins, générer du code optimisé, et automatiser les tâches répétitives. Chaque agent est entraîné sur des cas d\'usage spécifiques pour garantir des résultats de qualité professionnelle.'
  },
  {
    question: 'Quelles sources de données sont supportées ?',
    answer: 'Nous supportons plus de 35 connecteurs incluant PostgreSQL, MySQL, MongoDB, BigQuery, Snowflake, Redshift, Oracle, SQL Server, Azure Synapse, Kafka, REST APIs, et bien plus. De nouveaux connecteurs sont ajoutés régulièrement.'
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Absolument. Nous sommes certifiés SOC 2 Type II, RGPD, HIPAA, PCI-DSS et ISO 27001. Toutes les données sont chiffrées en transit et au repos (AES-256). Nous offrons également des options de déploiement on-premise pour les exigences les plus strictes.'
  },
  {
    question: 'Puis-je essayer avant de m\'engager ?',
    answer: 'Oui ! Tous nos plans payants incluent un essai gratuit de 14 jours sans carte de crédit requise. Vous aurez accès à toutes les fonctionnalités pour évaluer la plateforme en conditions réelles.'
  },
  {
    question: 'Quel support proposez-vous ?',
    answer: 'Nous offrons un support email pour le plan Free, un support prioritaire pour Starter, et un support dédié avec SLA pour Professional et Enterprise. Les clients Enterprise bénéficient également d\'un Account Manager dédié et de formations personnalisées.'
  }
]

// Security certifications
const certifications = [
  { name: 'SOC 2 Type II', icon: Shield },
  { name: 'RGPD', icon: FileCheck },
  { name: 'HIPAA', icon: HeartHandshake },
  { name: 'PCI-DSS', icon: Lock },
  { name: 'ISO 27001', icon: Award }
]

// Problems & Solutions
const problems = [
  {
    icon: Timer,
    title: 'Time-to-market long',
    description: '6 à 12 mois pour déployer un nouveau pipeline data'
  },
  {
    icon: AlertTriangle,
    title: 'Erreurs manuelles',
    description: '30% des pipelines contiennent des erreurs critiques'
  },
  {
    icon: Users,
    title: 'Talents rares',
    description: 'Pénurie de data engineers qualifiés sur le marché'
  }
]

const solutions = [
  {
    icon: Bot,
    title: 'Agents IA autonomes',
    description: '10 agents spécialisés qui automatisent 80% des tâches'
  },
  {
    icon: Zap,
    title: '10x plus rapide',
    description: 'Déployez vos pipelines en semaines, pas en mois'
  },
  {
    icon: Check,
    title: '0 erreur',
    description: 'Code généré testé et validé automatiquement'
  }
]

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    // Reset form after submission
    setTimeout(() => {
      setFormData({ name: '', email: '', company: '', message: '' })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DataSphere</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition text-sm">Fonctionnalités</a>
              <a href="#agents" className="text-slate-300 hover:text-white transition text-sm">Agents IA</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition text-sm">Tarifs</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition text-sm">Témoignages</a>
              <a href="#faq" className="text-slate-300 hover:text-white transition text-sm">FAQ</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white text-sm">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm">
                  Essai gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-slate-300">Propulsé par 10 Agents IA autonomes</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Automatisez vos pipelines data
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                avec l'Intelligence Artificielle
              </span>
            </h1>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">10x</div>
                <div className="text-sm text-slate-400">plus rapide</div>
              </div>
              <div className="w-px h-12 bg-slate-700 hidden md:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">80%</div>
                <div className="text-sm text-slate-400">temps économisé</div>
              </div>
              <div className="w-px h-12 bg-slate-700 hidden md:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">0</div>
                <div className="text-sm text-slate-400">erreur critique</div>
              </div>
              <div className="w-px h-12 bg-slate-700 hidden md:block" />
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">35+</div>
                <div className="text-sm text-slate-400">connecteurs</div>
              </div>
            </div>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10">
              Notre suite d'agents IA autonomes génère, teste et déploie vos pipelines data en quelques jours.
              Plus besoin de mois de développement manuel.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 shadow-lg shadow-blue-500/25">
                  Essai gratuit 14 jours
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6">
                <Play className="mr-2 w-5 h-5" />
                Voir la démo
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Essai gratuit 14 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Sans carte de crédit</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Annulation à tout moment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Problems */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Sans DataSphere</h2>
              </div>
              <div className="space-y-4">
                {problems.map((problem, i) => (
                  <Card key={i} className="bg-red-950/20 border-red-900/50 hover:border-red-800/50 transition-colors">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <problem.icon className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{problem.title}</h3>
                        <p className="text-slate-400 text-sm">{problem.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Avec DataSphere</h2>
              </div>
              <div className="space-y-4">
                {solutions.map((solution, i) => (
                  <Card key={i} className="bg-green-950/20 border-green-900/50 hover:border-green-800/50 transition-colors">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <solution.icon className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{solution.title}</h3>
                        <p className="text-slate-400 text-sm">{solution.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">Agents IA</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              10 Agents IA spécialisés
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Chaque agent est conçu pour une tâche spécifique du data engineering,
              avec une expertise approfondie et des résultats garantis.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {aiAgents.map((agent, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all hover:scale-105 group">
                <CardContent className="p-5 text-center">
                  <div className={`w-14 h-14 bg-gradient-to-br ${agent.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <agent.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 text-sm">{agent.name}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{agent.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Connectors Section */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">Intégrations</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Connectez toutes vos sources de données
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Plus de 35 connecteurs pré-configurés pour les bases de données,
              data warehouses, APIs et systèmes de fichiers.
            </p>
          </div>

          {/* Main Connectors */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
            {connectors.map((connector, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-6 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: connector.color }}
                  >
                    {connector.name.charAt(0)}
                  </div>
                  <span className="text-white font-medium">{connector.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* More Connectors */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-6 py-3">
              <Database className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">35+ connecteurs disponibles</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Connector Categories */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {[
              { title: 'Bases de données', items: 'PostgreSQL, MySQL, Oracle, SQL Server...', icon: Database },
              { title: 'Data Warehouses', items: 'BigQuery, Snowflake, Redshift, Synapse...', icon: BarChart3 },
              { title: 'NoSQL & Streams', items: 'MongoDB, Cassandra, Kafka, Redis...', icon: Zap },
              { title: 'APIs & Cloud', items: 'REST, GraphQL, S3, Azure Blob...', icon: Cloud }
            ].map((category, i) => (
              <Card key={i} className="bg-slate-800/30 border-slate-700">
                <CardContent className="p-5">
                  <category.icon className="w-8 h-8 text-blue-400 mb-3" />
                  <h3 className="font-semibold text-white mb-1">{category.title}</h3>
                  <p className="text-slate-400 text-sm">{category.items}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4">Tarifs</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Des forfaits adaptés à vos besoins
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Commencez gratuitement et évoluez selon vos besoins. Sans engagement, sans surprise.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, i) => (
              <Card
                key={i}
                className={`relative ${
                  plan.gradient
                    ? 'bg-gradient-to-b from-blue-900/50 to-purple-900/50 border-blue-700'
                    : 'bg-slate-900/50 border-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                      Populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-slate-300 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/register" className="w-full">
                    <Button
                      className={`w-full ${
                        plan.gradient
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      variant={plan.gradient ? 'default' : 'secondary'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mb-4">Témoignages</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Découvrez comment nos clients transforment leurs opérations data avec DataSphere.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="p-6">
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-slate-300 mb-6 leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.author}</div>
                      <div className="text-slate-400 text-sm">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Company Logos */}
          <div className="mt-16 pt-12 border-t border-slate-800">
            <p className="text-center text-slate-500 text-sm mb-8">Ils nous font confiance</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {['FinTech Solutions', 'E-Commerce Plus', 'Data Consulting', 'HealthTech Corp', 'SaaS Leader'].map((company, i) => (
                <div key={i} className="text-slate-600 font-semibold text-lg hover:text-slate-400 transition-colors">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security & Compliance Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 mb-4">Sécurité</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Sécurité et Conformité entreprise
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Votre sécurité est notre priorité. Nous respectons les standards les plus exigeants.
            </p>
          </div>

          {/* Certifications Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
            {certifications.map((cert, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors group">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <cert.icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{cert.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Security Features */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: 'Chiffrement de bout en bout',
                description: 'AES-256 pour les données au repos, TLS 1.3 pour les données en transit'
              },
              {
                icon: Shield,
                title: 'Authentification forte',
                description: 'SSO SAML, MFA TOTP, contrôle d\'accès basé sur les rôles (RBAC)'
              },
              {
                icon: FileCheck,
                title: 'Audit trail complet',
                description: 'Journalisation de toutes les actions avec signatures numériques infalsifiables'
              }
            ].map((feature, i) => (
              <Card key={i} className="bg-slate-800/30 border-slate-700">
                <CardContent className="p-6">
                  <feature.icon className="w-8 h-8 text-green-400 mb-4" />
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Questions fréquentes
            </h2>
            <p className="text-lg text-slate-400">
              Trouvez rapidement les réponses à vos questions.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-slate-800/50 border border-slate-700 rounded-lg px-6"
              >
                <AccordionTrigger className="text-white hover:text-blue-400 text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-400 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* CTA Content */}
            <div>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">Commencez maintenant</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Prêt à transformer vos data pipelines ?
              </h2>
              <p className="text-lg text-slate-400 mb-8">
                Rejoignez plus de 500 entreprises qui ont déjà automatisé leurs pipelines data avec DataSphere.
                Essai gratuit de 14 jours, sans engagement.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Mise en place en moins de 30 minutes',
                  'Accès immédiat aux 10 agents IA',
                  'Support dédié pendant l\'essai'
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-slate-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Essai gratuit 14 jours
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  Planifier une démo
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Contactez-nous</CardTitle>
                <CardDescription className="text-slate-400">
                  Notre équipe vous répond sous 24h
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Message envoyé !</h3>
                    <p className="text-slate-400">Nous vous contacterons très prochainement.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">Nom complet</Label>
                      <Input
                        id="name"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">Email professionnel</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="vous@entreprise.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-slate-300">Entreprise</Label>
                      <Input
                        id="company"
                        placeholder="Nom de votre entreprise"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-300">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Décrivez votre projet..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Envoyer le message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DataSphere</span>
              </div>
              <p className="text-slate-400 text-sm mb-6 max-w-xs">
                La plateforme d'ingénierie de données propulsée par l'IA.
                Automatisez vos pipelines, libérez votre potentiel.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Produit</h3>
              <ul className="space-y-3">
                {['Agents IA', 'Connecteurs', 'Pipelines', 'Dashboards', 'API'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-400 hover:text-white transition text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Ressources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition text-sm">Documentation</a>
                </li>
                <li>
                  <Link href="/en/docs" className="text-slate-400 hover:text-white transition text-sm">API Docs (Swagger)</Link>
                </li>
                {['Guides', 'Blog', 'Webinaires', 'Changelog'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-400 hover:text-white transition text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Entreprise</h3>
              <ul className="space-y-3">
                {['À propos', 'Carrières', 'Contact', 'Partenaires', 'Presse'].map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-slate-400 hover:text-white transition text-sm">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid sm:grid-cols-3 gap-6 py-8 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">contact@datasphere.ai</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">+33 1 23 45 67 89</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Paris, France</span>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-800">
            <p className="text-slate-500 text-sm">
              © 2024 DataSphere Innovation. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-500 hover:text-white transition">CGV</a>
              <a href="#" className="text-slate-500 hover:text-white transition">CGU</a>
              <a href="#" className="text-slate-500 hover:text-white transition">Confidentialité</a>
              <a href="#" className="text-slate-500 hover:text-white transition">Mentions légales</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Cloud icon component
function Cloud({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
      />
    </svg>
  )
}
