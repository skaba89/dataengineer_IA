"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText, Calculator, TrendingUp, DollarSign, Clock, Users, Target,
  CheckCircle, AlertCircle, Download, Loader2, ArrowRight, ArrowLeft,
  Building2, BarChart3, Zap, Shield, Briefcase, PieChart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface BusinessCaseData {
  // Company Info
  companyName: string
  industry: string
  companySize: string
  currentChallenge: string
  
  // Project Scope
  projectName: string
  projectType: string
  dataSources: number
  pipelinesNeeded: number
  dashboardCount: number
  
  // Financials
  currentDataTeamSize: number
  averageDataRequestTime: number
  dataQualityIssues: number
  manualProcesses: number
  estimatedBudget: number
  
  // Goals
  primaryGoal: string
  successMetrics: string[]
  timeline: string
}

const STEPS = [
  { id: 1, name: "Entreprise", icon: Building2 },
  { id: 2, name: "Projet", icon: Target },
  { id: 3, name: "Situation actuelle", icon: BarChart3 },
  { id: 4, name: "Objectifs", icon: TrendingUp },
  { id: 5, name: "Résultats", icon: FileText }
]

const INDUSTRIES = [
  "Retail & E-commerce",
  "Finance & Banking",
  "Healthcare",
  "SaaS & Technology",
  "Manufacturing",
  "Logistics & Supply Chain",
  "Media & Entertainment",
  "Energy & Utilities"
]

const PROJECT_TYPES = [
  "Data Warehouse Implementation",
  "ETL/ELT Pipeline Development",
  "Business Intelligence & Analytics",
  "Data Quality & Governance",
  "Real-time Data Processing",
  "Data Migration",
  "Full Data Platform"
]

export default function BusinessCaseGenerator() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [generatedCase, setGeneratedCase] = useState<any>(null)
  
  const [formData, setFormData] = useState<BusinessCaseData>({
    companyName: '',
    industry: '',
    companySize: '',
    currentChallenge: '',
    projectName: '',
    projectType: '',
    dataSources: 5,
    pipelinesNeeded: 10,
    dashboardCount: 5,
    currentDataTeamSize: 3,
    averageDataRequestTime: 5,
    dataQualityIssues: 20,
    manualProcesses: 15,
    estimatedBudget: 100000,
    primaryGoal: '',
    successMetrics: [],
    timeline: '3-6 months'
  })

  const updateForm = (updates: Partial<BusinessCaseData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const calculateROI = () => {
    // Calculate time savings
    const weeklyDataRequests = formData.currentDataTeamSize * 10
    const timeSavedPerRequest = formData.averageDataRequestTime * 0.7 // 70% reduction
    const weeklyHoursSaved = weeklyDataRequests * timeSavedPerRequest
    
    // Calculate cost savings
    const avgHourlyRate = 75 // €/hour
    const annualTimeSavings = weeklyHoursSaved * 52 * avgHourlyRate
    
    // Quality improvements
    const qualitySavings = formData.dataQualityIssues * 1000 * 12 // €1000 per issue per month
    
    // Manual process automation
    const processSavings = formData.manualProcesses * 500 * 12 // €500 per process per month
    
    const totalAnnualSavings = annualTimeSavings + qualitySavings + processSavings
    const roi = ((totalAnnualSavings - formData.estimatedBudget) / formData.estimatedBudget) * 100
    const paybackMonths = Math.round(formData.estimatedBudget / (totalAnnualSavings / 12))

    return {
      annualTimeSavings,
      qualitySavings,
      processSavings,
      totalAnnualSavings,
      roi,
      paybackMonths,
      weeklyHoursSaved
    }
  }

  const generateBusinessCase = async () => {
    setGenerating(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const roi = calculateROI()
      
      setGeneratedCase({
        ...formData,
        roi,
        generatedAt: new Date(),
        sections: {
          executiveSummary: generateExecutiveSummary(formData, roi),
          currentSituation: generateCurrentSituation(formData),
          proposedSolution: generateProposedSolution(formData),
          financialAnalysis: generateFinancialAnalysis(formData, roi),
          riskAnalysis: generateRiskAnalysis(formData),
          recommendations: generateRecommendations(formData, roi)
        }
      })
      
      setCurrentStep(5)
      
      toast({
        title: "Business Case généré",
        description: "Votre business case est prêt à être consulté"
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le business case",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  const generateExecutiveSummary = (data: BusinessCaseData, roi: any) => {
    return `Ce business case présente l'opportunité pour ${data.companyName} de transformer ses capacités data à travers un projet de ${data.projectType}.

**Points clés :**
- Investissement proposé : ${data.estimatedBudget.toLocaleString()}€
- Économies annuelles estimées : ${roi.totalAnnualSavings.toLocaleString()}€
- ROI projeté : ${roi.roi.toFixed(0)}%
- Période de retour : ${roi.paybackMonths} mois

Ce projet permettra à ${data.companyName} de réduire de 70% le temps de traitement des demandes data, d'améliorer significativement la qualité des données, et d'automatiser les processus manuels répétitifs.`
  }

  const generateCurrentSituation = (data: BusinessCaseData) => {
    return `**Analyse de l'état actuel**

${data.companyName} fait face à plusieurs défis data majeurs :

**1. Ressources limitées**
- Équipe data actuelle : ${data.currentDataTeamSize} personnes
- Temps moyen de traitement d'une demande data : ${data.averageDataRequestTime} jours
- Volume de demandes : ~${data.currentDataTeamSize * 10} demandes/semaine

**2. Problèmes de qualité**
- ${data.dataQualityIssues}% des données présentent des problèmes de qualité
- Impact sur les décisions métier et la confiance des utilisateurs

**3. Processus manuels**
- ${data.manualProcesses} processus data manuels identifiés
- Risque d'erreurs et perte de productivité

**Challenge principal :** ${data.currentChallenge || "Manque d'infrastructure data moderne pour supporter la croissance"}`
  }

  const generateProposedSolution = (data: BusinessCaseData) => {
    return `**Solution proposée : ${data.projectType}**

**Architecture cible :**
- Intégration de ${data.dataSources} sources de données
- Développement de ${data.pipelinesNeeded} pipelines ETL/ELT
- Création de ${data.dashboardCount} tableaux de bord analytiques

**Technologies recommandées :**
- Data Warehouse : Snowflake / BigQuery
- Transformation : dbt
- Orchestration : Airflow / Dagster
- BI : Looker / Tableau / Power BI

**Phases du projet :**
1. **Discovery (2-3 semaines)** : Audit des sources, architecture détaillée
2. **Foundation (4-6 semaines)** : Infrastructure, premiers pipelines
3. **Development (6-10 semaines)** : Transformations, dashboards
4. **Deployment (2-4 semaines)** : Tests, formation, mise en production

**Durée totale estimée :** ${data.timeline}`
  }

  const generateFinancialAnalysis = (data: BusinessCaseData, roi: any) => {
    return `**Analyse financière détaillée**

### Investissement initial
| Catégorie | Montant |
|-----------|---------|
| Infrastructure cloud (1 an) | ${(data.estimatedBudget * 0.15).toLocaleString()}€ |
| Licences & outils | ${(data.estimatedBudget * 0.10).toLocaleString()}€ |
| Développement & intégration | ${(data.estimatedBudget * 0.50).toLocaleString()}€ |
| Formation & change management | ${(data.estimatedBudget * 0.15).toLocaleString()}€ |
| Buffer & imprévus (10%) | ${(data.estimatedBudget * 0.10).toLocaleString()}€ |
| **Total** | **${data.estimatedBudget.toLocaleString()}€** |

### Économies annuelles projetées
| Source d'économie | Montant annuel |
|-------------------|----------------|
| Gain de productivité équipe | ${roi.annualTimeSavings.toLocaleString()}€ |
| Réduction erreurs qualité | ${roi.qualitySavings.toLocaleString()}€ |
| Automatisation processus | ${roi.processSavings.toLocaleString()}€ |
| **Total** | **${roi.totalAnnualSavings.toLocaleString()}€** |

### Indicateurs clés
- **ROI** : ${roi.roi.toFixed(0)}%
- **Payback** : ${roi.paybackMonths} mois
- **NPV (5 ans)** : ${((roi.totalAnnualSavings * 5) - data.estimatedBudget).toLocaleString()}€`
  }

  const generateRiskAnalysis = (data: BusinessCaseData) => {
    return `**Analyse des risques et mitigation**

### Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Résistance au changement | Moyenne | Élevé | Formation, communication, champions |
| Qualité des données sources | Élevée | Moyen | Phase de cleansing, tests automatisés |
| Retard de livraison | Moyenne | Moyen | Approche agile, MVP first |
| Budget dépassé | Faible | Élevé | Buffer 10%, gouvernance projet |
| Turnover équipe | Moyenne | Moyen | Documentation, knowledge transfer |

### Facteurs de succès critiques
1. Soutien explicite de la direction
2. Équipe projet dédiée et compétente
3. Communication régulière avec les stakeholders
4. Approche itérative avec livraisons fréquentes`
  }

  const generateRecommendations = (data: BusinessCaseData, roi: any) => {
    return `**Recommandations**

### Recommandation principale
✅ **Le projet est recommandé** avec un ROI de ${roi.roi.toFixed(0)}% et un payback de ${roi.paybackMonths} mois.

### Prochaines étapes proposées

1. **Semaine 1-2** : Validation du business case par le comité de direction
2. **Semaine 3-4** : Sélection des partenaires technologiques
3. **Mois 2** : Kick-off projet et démarrage phase Discovery
4. **Mois 3-6** : Développement et déploiement progressif

### Alternatives considérées

| Option | Investissement | ROI | Recommandation |
|--------|----------------|-----|----------------|
| Solution complète | ${data.estimatedBudget.toLocaleString()}€ | ${roi.roi.toFixed(0)}% | ✅ Recommandée |
| Solution allégée | ${(data.estimatedBudget * 0.6).toLocaleString()}€ | ${(roi.roi * 0.7).toFixed(0)}% | Alternative |
| Status quo | 0€ | 0% | ❌ Non recommandée |

### Conclusion
Le projet présente un fort potentiel de retour sur investissement et permettra à ${data.companyName} de se doter d'une infrastructure data moderne et scalable. La recommandation est de procéder avec la solution complète pour maximiser les bénéfices à long terme.`
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.industry && formData.companySize
      case 2:
        return formData.projectName && formData.projectType
      case 3:
        return formData.currentDataTeamSize > 0
      case 4:
        return formData.primaryGoal
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      generateBusinessCase()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Business Case Generator</h1>
          <p className="text-slate-400">Générez un business case professionnel pour votre projet data en quelques minutes</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id || (currentStep === 5 && step.id < 5)
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-xl transition-all
                    ${isActive ? 'bg-violet-600 text-white' : ''}
                    ${isCompleted ? 'bg-emerald-600 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-slate-700 text-slate-400' : ''}
                  `}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:block ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                  {index < STEPS.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-emerald-600' : 'bg-slate-700'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Form Steps */}
        {currentStep < 5 && (
          <Card className="max-w-3xl mx-auto bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">{STEPS[currentStep - 1].name}</CardTitle>
              <CardDescription className="text-slate-400">
                Étape {currentStep} sur 4
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Nom de l'entreprise</Label>
                      <Input
                        className="mt-1 bg-slate-900 border-slate-600"
                        placeholder="Ex: Acme Corp"
                        value={formData.companyName}
                        onChange={(e) => updateForm({ companyName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Taille de l'entreprise</Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(v) => updateForm({ companySize: v })}
                      >
                        <SelectTrigger className="mt-1 bg-slate-900 border-slate-600">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="startup">Startup (&lt;50 employés)</SelectItem>
                          <SelectItem value="sme">PME (50-250)</SelectItem>
                          <SelectItem value="midmarket">Mid-Market (250-1000)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Secteur d'activité</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(v) => updateForm({ industry: v })}
                    >
                      <SelectTrigger className="mt-1 bg-slate-900 border-slate-600">
                        <SelectValue placeholder="Sélectionner un secteur" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300">Défi data principal</Label>
                    <Textarea
                      className="mt-1 bg-slate-900 border-slate-600"
                      placeholder="Décrivez le principal défi data que vous rencontrez..."
                      value={formData.currentChallenge}
                      onChange={(e) => updateForm({ currentChallenge: e.target.value })}
                      rows={3}
                    />
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Nom du projet</Label>
                      <Input
                        className="mt-1 bg-slate-900 border-slate-600"
                        placeholder="Ex: Data Platform Modernization"
                        value={formData.projectName}
                        onChange={(e) => updateForm({ projectName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Type de projet</Label>
                      <Select
                        value={formData.projectType}
                        onValueChange={(v) => updateForm({ projectType: v })}
                      >
                        <SelectTrigger className="mt-1 bg-slate-900 border-slate-600">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {PROJECT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-slate-300">Sources de données</Label>
                      <Input
                        type="number"
                        className="mt-1 bg-slate-900 border-slate-600"
                        value={formData.dataSources}
                        onChange={(e) => updateForm({ dataSources: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Pipelines nécessaires</Label>
                      <Input
                        type="number"
                        className="mt-1 bg-slate-900 border-slate-600"
                        value={formData.pipelinesNeeded}
                        onChange={(e) => updateForm({ pipelinesNeeded: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Dashboards</Label>
                      <Input
                        type="number"
                        className="mt-1 bg-slate-900 border-slate-600"
                        value={formData.dashboardCount}
                        onChange={(e) => updateForm({ dashboardCount: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Timeline souhaitée</Label>
                    <Select
                      value={formData.timeline}
                      onValueChange={(v) => updateForm({ timeline: v })}
                    >
                      <SelectTrigger className="mt-1 bg-slate-900 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="1-3 months">1-3 mois</SelectItem>
                        <SelectItem value="3-6 months">3-6 mois</SelectItem>
                        <SelectItem value="6-12 months">6-12 mois</SelectItem>
                        <SelectItem value="12+ months">12+ mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Taille équipe data actuelle</Label>
                      <Input
                        type="number"
                        className="mt-1 bg-slate-900 border-slate-600"
                        value={formData.currentDataTeamSize}
                        onChange={(e) => updateForm({ currentDataTeamSize: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Temps moyen par demande data (jours)</Label>
                      <Input
                        type="number"
                        className="mt-1 bg-slate-900 border-slate-600"
                        value={formData.averageDataRequestTime}
                        onChange={(e) => updateForm({ averageDataRequestTime: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300">Problèmes qualité données (%)</Label>
                      <Input
                        type="number"
                        className="mt-1 bg-slate-900 border-slate-600"
                        value={formData.dataQualityIssues}
                        onChange={(e) => updateForm({ dataQualityIssues: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Processus manuels</Label>
                      <Input
                        type="number"
                        className="mt-1 bg-slate-900 border-slate-600"
                        value={formData.manualProcesses}
                        onChange={(e) => updateForm({ manualProcesses: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Budget estimé (€)</Label>
                    <Input
                      type="number"
                      className="mt-1 bg-slate-900 border-slate-600"
                      value={formData.estimatedBudget}
                      onChange={(e) => updateForm({ estimatedBudget: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <div>
                    <Label className="text-slate-300">Objectif principal</Label>
                    <Select
                      value={formData.primaryGoal}
                      onValueChange={(v) => updateForm({ primaryGoal: v })}
                    >
                      <SelectTrigger className="mt-1 bg-slate-900 border-slate-600">
                        <SelectValue placeholder="Sélectionner l'objectif principal" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="reduce_costs">Réduire les coûts opérationnels</SelectItem>
                        <SelectItem value="improve_quality">Améliorer la qualité des données</SelectItem>
                        <SelectItem value="accelerate_insights">Accélérer l'accès aux insights</SelectItem>
                        <SelectItem value="enable_self_service">Permettre le self-service BI</SelectItem>
                        <SelectItem value="scale_data">Scalabilité de la plateforme data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* ROI Preview */}
                  <div className="bg-slate-900/50 rounded-xl p-6 mt-6">
                    <h4 className="text-white font-medium mb-4">Aperçu du ROI estimé</h4>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {(() => {
                        const roi = calculateROI()
                        return (
                          <>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-emerald-400">{roi.roi.toFixed(0)}%</div>
                              <div className="text-sm text-slate-400">ROI</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-violet-400">{roi.paybackMonths}</div>
                              <div className="text-sm text-slate-400">Mois payback</div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold text-cyan-400">
                                {(roi.totalAnnualSavings / 1000).toFixed(0)}K€
                              </div>
                              <div className="text-sm text-slate-400">Économies/an</div>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                </>
              )}

              <Separator className="bg-slate-700" />

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 1}
                  className="text-slate-400"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || generating}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Génération...
                    </>
                  ) : currentStep === 4 ? (
                    <>
                      Générer le Business Case
                      <FileText className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Suivant
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Business Case */}
        {currentStep === 5 && generatedCase && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl">Business Case - {generatedCase.projectName}</CardTitle>
                    <CardDescription className="text-slate-400">
                      Généré pour {generatedCase.companyName} • {new Date().toLocaleDateString('fr-FR')}
                    </CardDescription>
                  </div>
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="summary" className="space-y-4">
              <TabsList className="bg-slate-800">
                <TabsTrigger value="summary">Résumé</TabsTrigger>
                <TabsTrigger value="financial">Analyse financière</TabsTrigger>
                <TabsTrigger value="solution">Solution</TabsTrigger>
                <TabsTrigger value="risks">Risques</TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Résumé exécutif</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-slate-300">
                      {generatedCase.sections.executiveSummary}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid sm:grid-cols-4 gap-4 mt-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6 text-center">
                      <DollarSign className="w-8 h-8 mx-auto text-violet-400 mb-2" />
                      <div className="text-2xl font-bold text-white">{generatedCase.estimatedBudget.toLocaleString()}€</div>
                      <div className="text-sm text-slate-400">Investissement</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6 text-center">
                      <TrendingUp className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                      <div className="text-2xl font-bold text-white">{generatedCase.roi.roi.toFixed(0)}%</div>
                      <div className="text-sm text-slate-400">ROI</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6 text-center">
                      <Clock className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
                      <div className="text-2xl font-bold text-white">{generatedCase.roi.paybackMonths}</div>
                      <div className="text-sm text-slate-400">Mois payback</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6 text-center">
                      <BarChart3 className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                      <div className="text-2xl font-bold text-white">{(generatedCase.roi.totalAnnualSavings / 1000).toFixed(0)}K€</div>
                      <div className="text-sm text-slate-400">Économies/an</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="financial">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Analyse financière</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-slate-300">
                      {generatedCase.sections.financialAnalysis}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="solution">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Solution proposée</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-slate-300">
                      {generatedCase.sections.proposedSolution}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="risks">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Analyse des risques</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-slate-300">
                      {generatedCase.sections.riskAnalysis}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 mt-4">
                  <CardHeader>
                    <CardTitle className="text-white">Recommandations</CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-slate-300">
                      {generatedCase.sections.recommendations}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
