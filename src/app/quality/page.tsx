"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Shield, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Minus, RefreshCw, Download, Filter, Search, ChevronDown,
  Activity, Database, Zap, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type QualityGrade = 'A' | 'B' | 'C' | 'D' | 'F'
type QualityDimension = 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'validity' | 'uniqueness' | 'integrity'

interface QualityMetric {
  dimension: QualityDimension
  score: number
  grade: QualityGrade
  trend: 'improving' | 'stable' | 'declining'
}

interface QualityReport {
  sourceId: string
  sourceName: string
  overallScore: number
  overallGrade: QualityGrade
  metrics: QualityMetric[]
  totalIssues: number
  criticalIssues: number
  lastChecked: string
  recommendations: string[]
}

interface DashboardSummary {
  overallScore: number
  sourcesAnalyzed: number
  criticalIssues: number
  improving: number
  declining: number
  topIssues: any[]
}

const DIMENSION_LABELS: Record<QualityDimension, string> = {
  completeness: "Complétude",
  accuracy: "Précision",
  consistency: "Cohérence",
  timeliness: "Actualité",
  validity: "Validité",
  uniqueness: "Unicité",
  integrity: "Intégrité"
}

const GRADE_COLORS: Record<QualityGrade, string> = {
  A: "text-emerald-500 bg-emerald-500/10",
  B: "text-blue-500 bg-blue-500/10",
  C: "text-amber-500 bg-amber-500/10",
  D: "text-orange-500 bg-orange-500/10",
  F: "text-red-500 bg-red-500/10"
}

export default function QualityPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [reports, setReports] = useState<QualityReport[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchQualityData()
  }, [])

  const fetchQualityData = async () => {
    setLoading(true)
    try {
      // Fetch dashboard summary
      const response = await fetch(`/api/quality?organizationId=demo`)
      const data = await response.json()
      
      if (data.success) {
        setSummary(data.summary)
        // Generate demo reports
        setReports(generateDemoReports())
      }
    } catch (error) {
      console.error('Error fetching quality data:', error)
      setSummary({
        overallScore: 92,
        sourcesAnalyzed: 8,
        criticalIssues: 0,
        improving: 5,
        declining: 1,
        topIssues: []
      })
      setReports(generateDemoReports())
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    await fetchQualityData()
    setRefreshing(false)
    toast({
      title: "Qualité actualisée",
      description: "Les données de qualité ont été rafraîchies"
    })
  }

  const generateDemoReports = (): QualityReport[] => {
    const sources = [
      "PostgreSQL Production", "Snowflake Data Warehouse", "Salesforce CRM",
      "Google Analytics 4", "Stripe Payments", "HubSpot Marketing", 
      "Zendesk Support", "Shopify Orders"
    ]
    
    return sources.map((name, index) => {
      const score = 75 + Math.random() * 20
      const grade: QualityGrade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D'
      
      return {
        sourceId: `source_${index}`,
        sourceName: name,
        overallScore: Math.round(score),
        overallGrade: grade,
        metrics: [
          { dimension: 'completeness', score: 90 + Math.random() * 10, grade: 'A', trend: 'stable' },
          { dimension: 'accuracy', score: 85 + Math.random() * 10, grade: 'A', trend: 'improving' },
          { dimension: 'consistency', score: 80 + Math.random() * 15, grade: 'A', trend: 'stable' },
          { dimension: 'timeliness', score: 75 + Math.random() * 20, grade: 'B', trend: 'improving' },
          { dimension: 'validity', score: 88 + Math.random() * 10, grade: 'A', trend: 'stable' },
          { dimension: 'uniqueness', score: 92 + Math.random() * 8, grade: 'A', trend: 'improving' },
          { dimension: 'integrity', score: 95 + Math.random() * 5, grade: 'A', trend: 'stable' }
        ],
        totalIssues: Math.floor(Math.random() * 5),
        criticalIssues: 0,
        lastChecked: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        recommendations: []
      }
    })
  }

  const filteredReports = reports.filter(r => 
    r.sourceName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-emerald-500" />
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <Minus className="w-4 h-4 text-slate-400" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Shield className="w-12 h-12 text-violet-500 mb-4" />
          <p className="text-slate-400">Chargement des données de qualité...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-violet-500" />
              Data Quality Monitoring
            </h1>
            <p className="text-slate-400 mt-2">
              Surveillez et améliorez la qualité de vos données en temps réel
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
              Actualiser
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Score Global</p>
                  <p className="text-3xl font-bold text-white">{summary?.overallScore || 0}%</p>
                </div>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold", 
                  GRADE_COLORS[summary?.overallScore >= 90 ? 'A' : summary?.overallScore >= 80 ? 'B' : 'C'])}>
                  {summary?.overallScore >= 90 ? 'A' : summary?.overallScore >= 80 ? 'B' : 'C'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Sources Analysées</p>
                  <p className="text-3xl font-bold text-white">{summary?.sourcesAnalyzed || 0}</p>
                </div>
                <Database className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Problèmes Critiques</p>
                  <p className="text-3xl font-bold text-white">{summary?.criticalIssues || 0}</p>
                </div>
                <AlertTriangle className={cn("w-8 h-8", summary?.criticalIssues ? "text-red-500" : "text-emerald-500")} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">{summary?.improving || 0}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">En amélioration</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 font-medium">{summary?.declining || 0}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">En déclin</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert if critical issues */}
        {summary?.criticalIssues ? (
          <Alert className="mb-6 bg-red-500/10 border-red-500/20">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-500">Problèmes critiques détectés</AlertTitle>
            <AlertDescription className="text-slate-400">
              {summary.criticalIssues} source(s) nécessitent une attention immédiate.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 bg-emerald-500/10 border-emerald-500/20">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <AlertTitle className="text-emerald-500">Excellente qualité des données</AlertTitle>
            <AlertDescription className="text-slate-400">
              Toutes les sources de données ont un score de qualité satisfaisant.
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-9 bg-slate-800 border-slate-700"
              placeholder="Rechercher une source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="sources" className="space-y-6">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="metrics">Métriques</TabsTrigger>
            <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
          </TabsList>

          <TabsContent value="sources">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <Card key={report.sourceId} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-slate-400" />
                        <CardTitle className="text-white text-base">{report.sourceName}</CardTitle>
                      </div>
                      <Badge className={GRADE_COLORS[report.overallGrade]}>
                        {report.overallGrade}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400 text-xs">
                      Dernière vérification: {new Date(report.lastChecked).toLocaleString('fr-FR')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Score</span>
                        <span className="text-lg font-bold text-white">{report.overallScore}%</span>
                      </div>
                      <Progress value={report.overallScore} className="h-2" />
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {report.metrics.slice(0, 4).map((metric) => (
                          <div key={metric.dimension} className="flex items-center justify-between">
                            <span className="text-slate-400">{DIMENSION_LABELS[metric.dimension]}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-white">{Math.round(metric.score)}%</span>
                              {getTrendIcon(metric.trend)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {report.totalIssues > 0 && (
                        <div className="flex items-center gap-2 text-xs text-amber-500">
                          <AlertTriangle className="w-3 h-3" />
                          {report.totalIssues} problème(s) détecté(s)
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Scores par Dimension</CardTitle>
                <CardDescription className="text-slate-400">
                  Vue d'ensemble de la qualité par dimension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(DIMENSION_LABELS).map(([dimension, label]) => {
                    const avgScore = reports.reduce((sum, r) => {
                      const m = r.metrics.find(m => m.dimension === dimension)
                      return sum + (m?.score || 0)
                    }, 0) / reports.length

                    return (
                      <div key={dimension}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{label}</span>
                          <span className="text-slate-400">{Math.round(avgScore)}%</span>
                        </div>
                        <Progress value={avgScore} className="h-3" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recommandations</CardTitle>
                <CardDescription className="text-slate-400">
                  Actions suggérées pour améliorer la qualité des données
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { priority: 'high', title: 'Implémenter la validation des emails', description: 'Ajouter une validation regex pour les champs email dans les sources CRM' },
                    { priority: 'medium', title: 'Augmenter la fréquence de synchronisation', description: 'Passer de 6h à 1h pour les sources critiques' },
                    { priority: 'low', title: 'Standardiser les formats de date', description: 'Utiliser ISO 8601 pour toutes les dates' },
                    { priority: 'low', title: 'Ajouter des contraintes d\'unicité', description: 'Implémenter des clés uniques sur les identifiants clients' }
                  ].map((rec, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        rec.priority === 'high' ? 'bg-red-500' : 
                        rec.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-500'
                      )} />
                      <div>
                        <h4 className="text-white font-medium">{rec.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
