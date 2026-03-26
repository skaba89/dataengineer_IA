'use client'

/**
 * DataSphere Innovation - Marketing Landing Page
 * Modern, conversion-optimized landing page
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Sparkles
} from 'lucide-react'

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DataSphere</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-slate-300 hover:text-white transition">Features</Link>
              <Link href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</Link>
              <Link href="/docs" className="text-slate-300 hover:text-white transition">Docs</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Free Trial
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
              <span className="text-sm text-slate-300">Powered by 10 AI Agents</span>
            </div>
            
            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Transform Your Data
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                With AI-Powered Engineering
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
              Automate your data pipelines, generate code, and build dashboards with our 
              suite of intelligent AI agents. Reduce development time by 80% and accelerate 
              time-to-insight.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex items-center justify-center gap-8 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need for Modern Data Engineering
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our AI-powered platform handles the complexity so you can focus on insights.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: '10 AI Agents',
                description: 'Specialized agents for discovery, architecture, pipeline generation, and more.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: GitBranch,
                title: 'Visual Pipeline Builder',
                description: 'Drag-and-drop interface for creating complex data pipelines without code.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Database,
                title: '35+ Connectors',
                description: 'Connect to PostgreSQL, BigQuery, Snowflake, MongoDB, and many more.',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'SOC 2, HIPAA, RGPD compliant with encryption and SSO support.',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: BarChart3,
                title: 'Real-time Analytics',
                description: 'Interactive dashboards and KPI tracking with AI-generated insights.',
                color: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Clock,
                title: '10x Faster Delivery',
                description: 'Reduce development time from weeks to days with AI automation.',
                color: 'from-teal-500 to-blue-500'
              },
            ].map((feature, i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                <CardHeader>
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-400">
              Start free and scale as you grow. No hidden fees.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Starter</CardTitle>
                <CardDescription className="text-slate-400">For small teams</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">499€</span>
                  <span className="text-slate-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {['3 Projects', '5 Users', '10 AI Agent runs/month', 'Basic connectors', 'Email support'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300">
                  Start Free Trial
                </Button>
              </CardFooter>
            </Card>
            
            {/* Professional */}
            <Card className="bg-gradient-to-b from-blue-900/50 to-purple-900/50 border-blue-700 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-white">Professional</CardTitle>
                <CardDescription className="text-slate-400">For growing teams</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">1,499€</span>
                  <span className="text-slate-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {['Unlimited Projects', '25 Users', '100 AI Agent runs/month', 'All connectors', 'Priority support', 'SSO included'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                  Start Free Trial
                </Button>
              </CardFooter>
            </Card>
            
            {/* Enterprise */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Enterprise</CardTitle>
                <CardDescription className="text-slate-400">For large organizations</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">4,999€</span>
                  <span className="text-slate-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {['Unlimited everything', 'Unlimited Users', 'Unlimited AI runs', 'Custom connectors', 'Dedicated support', 'SLA guarantee'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300">
                  Contact Sales
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl border border-slate-700 p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Data?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join thousands of data teams already using DataSphere Innovation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 DataSphere Innovation. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-slate-500 hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="text-slate-500 hover:text-white transition">Terms</Link>
              <Link href="/security" className="text-slate-500 hover:text-white transition">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
