// Dashboard Page
"use client"

import { useSession } from "next-auth/react"
import { AuthGuard } from "@/components/auth-guard"
import { UserDropdown } from "@/components/user-dropdown"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Zap, 
  Database, 
  GitBranch, 
  BarChart3, 
  FileCode,
  ArrowRight,
  Plus,
  Activity,
  Globe
} from "lucide-react"
import { useI18n, LanguageSwitcher } from "@/lib/i18n"

function DashboardContent() {
  const { data: session } = useSession()
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('common.appName')}</h1>
              <p className="text-xs text-purple-300">{t('dashboard.welcomeSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {t('dashboard.welcome')}, {session?.user?.name || "Utilisateur"} !
          </h2>
          <p className="text-purple-200">
            {t('dashboard.welcomeSubtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-violet-400" />
              </div>
              <CardTitle className="text-white">{t('dashboard.newProject')}</CardTitle>
              <CardDescription className="text-purple-200">
                {t('projects.startNew')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-violet-600 hover:bg-violet-700">
                {t('common.create')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-white">{t('agents.discovery')}</CardTitle>
              <CardDescription className="text-purple-200">
                {t('dashboard.runAgent')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                {t('agents.run')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
                <GitBranch className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-white">{t('agents.pipeline')}</CardTitle>
              <CardDescription className="text-purple-200">
                {t('agents.run')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                {t('agents.run')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                <BarChart3 className="w-6 h-6 text-orange-400" />
              </div>
              <CardTitle className="text-white">{t('agents.bi')}</CardTitle>
              <CardDescription className="text-purple-200">
                {t('common.create')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                {t('common.create')} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <FileCode className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-sm text-purple-200">{t('projects.title')} {t('common.analytics').toLowerCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">0</p>
                  <p className="text-sm text-purple-200">{t('agents.completed')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">10</p>
                  <p className="text-sm text-purple-200">{t('agents.title')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">{t('dashboard.recentActivity')}</CardTitle>
            <CardDescription className="text-purple-200">
              {t('dashboard.welcomeSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-purple-300">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('projects.noProjects')}</p>
              <p className="text-sm text-purple-400 mt-1">
                {t('projects.startNew')}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
