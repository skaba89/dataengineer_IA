"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  MessageSquare, Send, Bot, User, Loader2, Sparkles, Database,
  GitBranch, BarChart3, Settings, Zap, Clock, ThumbsUp, ThumbsDown,
  Copy, RefreshCw, Paperclip, Mic, MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  helpful?: boolean | null
  sources?: string[]
}

interface SuggestedQuestion {
  icon: React.ReactNode
  text: string
  category: string
}

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  {
    icon: <Database className="w-4 h-4" />,
    text: "Comment structurer mon data warehouse ?",
    category: "Architecture"
  },
  {
    icon: <GitBranch className="w-4 h-4" />,
    text: "Quelle est la différence entre dbt et Airflow ?",
    category: "Outils"
  },
  {
    icon: <BarChart3 className="w-4 h-4" />,
    text: "Comment mesurer la qualité de mes données ?",
    category: "Qualité"
  },
  {
    icon: <Zap className="w-4 h-4" />,
    text: "Comment optimiser les performances de mes pipelines ?",
    category: "Performance"
  },
  {
    icon: <Settings className="w-4 h-4" />,
    text: "Quelles sont les bonnes pratiques de modélisation ?",
    category: "Best Practices"
  },
  {
    icon: <Clock className="w-4 h-4" />,
    text: "Comment mettre en place un scheduling efficace ?",
    category: "Orchestration"
  }
]

const EXPERTISE_AREAS = [
  { name: "Architecture Data", level: 95 },
  { name: "dbt & Transformations", level: 92 },
  { name: "Airflow & Orchestration", level: 90 },
  { name: "Cloud (AWS/GCP/Azure)", level: 88 },
  { name: "Data Quality", level: 85 },
  { name: "Performance Optimization", level: 87 }
]

export default function AIConsultantPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour ! Je suis votre consultant AI en Data Engineering. Je suis ici pour vous aider avec toutes vos questions concernant l'architecture data, les pipelines ETL/ELT, dbt, Airflow, et bien plus.

**Je peux vous aider avec :**
- 🏗️ Architecture de data warehouse/lakehouse
- 🔄 Conception de pipelines ETL/ELT
- 📊 Modélisation de données (Kimball, Data Vault)
- 🛠️ Choix et configuration d'outils (dbt, Airflow, Dagster)
- ⚡ Optimisation des performances
- 📈 Data quality et governance

Comment puis-je vous aider aujourd'hui ?`,
      timestamp: new Date(),
      helpful: null
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
          type: 'consultant'
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response || generateFallbackResponse(text),
        timestamp: new Date(),
        helpful: null,
        sources: data.sources
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      // Use fallback response
      const fallbackMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: generateFallbackResponse(text),
        timestamp: new Date(),
        helpful: null
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setLoading(false)
    }
  }

  const generateFallbackResponse = (question: string): string => {
    const responses: Record<string, string> = {
      "warehouse": `**Architecture Data Warehouse Recommandée**

Pour structurer votre data warehouse, je recommande l'approche suivante :

1. **Couche Staging** : Données brutes importées depuis vos sources
2. **Couche Intermediate** : Transformations et nettoyage
3. **Couche Marts** : Modèles dimensionnels pour l'analyse

**Bonnes pratiques :**
- Utilisez dbt pour la transformation
- Implémentez des tests de qualité à chaque couche
- Documentez vos modèles avec descriptions et lineage
- Séparez les environnements (dev, staging, prod)

Voulez-vous que je détaille un aspect spécifique ?`,

      "dbt": `**dbt vs Airflow : Comprendre la différence**

**dbt (Data Build Tool)**
- Focus : Transformation de données SQL
- Idéal pour : Modélisation, tests, documentation
- Exécution : Basée sur des modèles SQL

**Airflow**
- Focus : Orchestration de workflows
- Idéal : Dépendances complexes, scheduling
- Exécution : DAGs Python

**Recommandation :** Utilisez les deux ensemble ! Airflow orchestre l'exécution de vos modèles dbt.

\`\`\`python
# Exemple de DAG Airflow exécutant dbt
dbt_run = BashOperator(
    task_id='dbt_run',
    bash_command='dbt run'
)
\`\`\`

Comment comptez-vous les intégrer ?`,

      "qualité": `**Data Quality Framework**

Pour mesurer et garantir la qualité de vos données, implémentez ces 4 piliers :

**1. Validité**
- Tests de schéma (types, contraintes)
- Tests de règle métier
- Tests de seuils

**2. Complétude**
- Valeurs nulles
- Données manquantes
- Couverture temporelle

**3. Cohérence**
- Intégrité référentielle
- Doublons
- Incohérences cross-systèmes

**4. Actualité**
- Freshness des données
- Latence de pipeline
- Fréquence de mise à jour

**Outils recommandés :**
- dbt tests
- Great Expectations
- Soda Core

Quelle dimension souhaitez-vous approfondir ?`,

      "performance": `**Optimisation des Performances Pipeline**

Voici les leviers d'optimisation prioritaires :

**🚀 Au niveau Source**
- Utilisez des colonnes partitionnées
- Implémentez l'incrémental loading
- Limitez les colonnes extraites

**⚙️ Au niveau Transformation**
- Materialisez les modèles fréquemment utilisés
- Utilisez les CTEs pour la lisibilité
- Évitez les CROSS JOINs

**📊 Au niveau Warehouse**
- Clustering keys
- Partitionnement de tables
- Scaling du warehouse

**Exemple dbt incremental :**
\`\`\`sql
{{
  config(
    materialized='incremental',
    unique_key='id'
  )
}}

SELECT * FROM source
{% if is_incremental() %}
WHERE updated_at > (SELECT MAX(updated_at) FROM this)
{% endif %}
\`\`\`

Quelles sont vos problématiques actuelles ?`
    }

    // Find matching response
    const lowerQuestion = question.toLowerCase()
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        return response
      }
    }

    // Default response
    return `Merci pour votre question concernant "${question}".

**Analyse :**

En tant que consultant Data Engineering, je peux vous apporter des conseils personnalisés basés sur les bonnes pratiques de l'industrie.

**Points clés à considérer :**

1. **Architecture** - Comment structurer votre solution
2. **Technologies** - Quels outils choisir
3. **Implémentation** - Comment déployer efficacement
4. **Maintenance** - Bonnes pratiques opérationnelles

Pourriez-vous préciser votre contexte (volumétrie, contraintes, objectifs) afin que je puisse vous donner des recommandations plus spécifiques ?

Je peux également :
- Générer du code exemple
- Proposer des schémas d'architecture
- Analyser vos besoins spécifiques`
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copié",
      description: "Le message a été copié dans le presse-papier"
    })
  }

  const rateMessage = (messageId: string, helpful: boolean) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, helpful } : m
    ))
  }

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex < 1) return

    const userMessage = messages[messageIndex - 1]
    if (userMessage.role !== 'user') return

    // Remove the assistant message
    setMessages(prev => prev.filter(m => m.id !== messageId))
    
    // Regenerate
    await sendMessage(userMessage.content)
  }

  return (
    <div className="h-screen bg-slate-900 flex">
      {/* Left Sidebar */}
      <div className="w-72 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">AI Consultant</h2>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                En ligne
              </Badge>
            </div>
          </div>
        </div>

        {/* Expertise Areas */}
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
            Domaines d'expertise
          </h3>
          <div className="space-y-2">
            {EXPERTISE_AREAS.map((area) => (
              <div key={area.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{area.name}</span>
                  <span className="text-slate-500">{area.level}%</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                    style={{ width: `${area.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="flex-1 p-4 overflow-auto">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
            Questions suggérées
          </h3>
          <div className="space-y-2">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.text)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-700/50 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                  {q.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-white truncate">{q.text}</div>
                  <div className="text-xs text-slate-500">{q.category}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-t border-slate-700">
          <Button
            variant="outline"
            className="w-full border-slate-600"
            onClick={() => setMessages([messages[0]])}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Nouvelle conversation
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4",
                  message.role === 'user' && "flex-row-reverse"
                )}
              >
                <Avatar className={cn(
                  "w-10 h-10 flex-shrink-0",
                  message.role === 'assistant' && "bg-gradient-to-br from-violet-500 to-purple-600"
                )}>
                  {message.role === 'assistant' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <AvatarFallback className="bg-slate-700">
                      <User className="w-5 h-5 text-slate-400" />
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className={cn(
                  "flex-1 max-w-[80%]",
                  message.role === 'user' && "text-right"
                )}>
                  <Card className={cn(
                    "inline-block",
                    message.role === 'user'
                      ? "bg-violet-600 border-0"
                      : "bg-slate-800 border-slate-700"
                  )}>
                    <CardContent className="p-4">
                      <div className={cn(
                        "prose prose-sm max-w-none",
                        message.role === 'user' ? "text-white" : "text-slate-300"
                      )}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Message Actions */}
                  <div className={cn(
                    "flex items-center gap-2 mt-2",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <span className="text-xs text-slate-500">
                      {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {message.role === 'assistant' && (
                      <>
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-slate-300"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => regenerateResponse(message.id)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-slate-300"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <Separator orientation="vertical" className="h-4 bg-slate-600" />
                        <button
                          onClick={() => rateMessage(message.id, true)}
                          className={cn(
                            "p-1 hover:bg-slate-700 rounded",
                            message.helpful === true ? "text-emerald-500" : "text-slate-500 hover:text-emerald-400"
                          )}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => rateMessage(message.id, false)}
                          className={cn(
                            "p-1 hover:bg-slate-700 rounded",
                            message.helpful === false ? "text-red-500" : "text-slate-500 hover:text-red-400"
                          )}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-4">
                <Avatar className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600">
                  <Bot className="w-5 h-5 text-white" />
                </Avatar>
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyse en cours...
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700 bg-slate-800">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex gap-4"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-slate-300"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Input
                ref={inputRef}
                className="flex-1 bg-slate-900 border-slate-600 text-white placeholder:text-slate-500"
                placeholder="Posez votre question sur le data engineering..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-slate-300"
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700"
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
            <p className="text-xs text-slate-500 text-center mt-2">
              AI Consultant peut faire des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
