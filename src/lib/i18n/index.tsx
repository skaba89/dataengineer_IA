'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Types
type Locale = 'fr' | 'en' | 'de' | 'es'

interface LocaleConfig {
  code: Locale
  name: string
  flag: string
}

const locales: LocaleConfig[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
]

// Context for i18n
interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Translations
const translations: Record<Locale, Record<string, any>> = {
  fr: {
    common: {
      appName: 'DataSphere Innovation',
      loading: 'Chargement...',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      create: 'Créer',
      search: 'Rechercher',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      login: 'Connexion',
      dashboard: 'Tableau de bord',
      projects: 'Projets',
      agents: 'Agents IA',
      monitoring: 'Monitoring',
      security: 'Sécurité',
    },
    dashboard: {
      welcome: 'Bienvenue sur DataSphere Innovation',
      quickActions: 'Actions rapides',
      newProject: 'Nouveau projet',
      recentProjects: 'Projets récents',
    },
    projects: {
      title: 'Projets',
      createProject: 'Créer un projet',
      noProjects: 'Aucun projet',
    },
    agents: {
      title: 'Agents IA',
      run: 'Exécuter',
      running: 'En cours',
    },
    monitoring: {
      title: 'Monitoring',
      systemHealth: 'Santé système',
    },
    settings: {
      title: 'Paramètres',
      profile: 'Profil',
      organization: 'Organisation',
      security: 'Sécurité',
      notifications: 'Notifications',
      api: 'API',
      billing: 'Facturation',
      language: 'Langue',
    },
  },
  en: {
    common: {
      appName: 'DataSphere Innovation',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      settings: 'Settings',
      logout: 'Logout',
      login: 'Login',
      dashboard: 'Dashboard',
      projects: 'Projects',
      agents: 'AI Agents',
      monitoring: 'Monitoring',
      security: 'Security',
    },
    dashboard: {
      welcome: 'Welcome to DataSphere Innovation',
      quickActions: 'Quick Actions',
      newProject: 'New Project',
      recentProjects: 'Recent Projects',
    },
    projects: {
      title: 'Projects',
      createProject: 'Create Project',
      noProjects: 'No projects',
    },
    agents: {
      title: 'AI Agents',
      run: 'Run',
      running: 'Running',
    },
    monitoring: {
      title: 'Monitoring',
      systemHealth: 'System Health',
    },
    settings: {
      title: 'Settings',
      profile: 'Profile',
      organization: 'Organization',
      security: 'Security',
      notifications: 'Notifications',
      api: 'API',
      billing: 'Billing',
      language: 'Language',
    },
  },
  de: {
    common: {
      appName: 'DataSphere Innovation',
      loading: 'Laden...',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      create: 'Erstellen',
      search: 'Suchen',
      settings: 'Einstellungen',
      logout: 'Abmelden',
      login: 'Anmelden',
      dashboard: 'Dashboard',
      projects: 'Projekte',
      agents: 'KI-Agenten',
      monitoring: 'Überwachung',
      security: 'Sicherheit',
    },
    dashboard: {
      welcome: 'Willkommen bei DataSphere Innovation',
      quickActions: 'Schnellaktionen',
      newProject: 'Neues Projekt',
      recentProjects: 'Aktuelle Projekte',
    },
    projects: {
      title: 'Projekte',
      createProject: 'Projekt erstellen',
      noProjects: 'Keine Projekte',
    },
    agents: {
      title: 'KI-Agenten',
      run: 'Ausführen',
      running: 'Läuft',
    },
    monitoring: {
      title: 'Überwachung',
      systemHealth: 'Systemzustand',
    },
    settings: {
      title: 'Einstellungen',
      profile: 'Profil',
      organization: 'Organisation',
      security: 'Sicherheit',
      notifications: 'Benachrichtigungen',
      api: 'API',
      billing: 'Abrechnung',
      language: 'Sprache',
    },
  },
  es: {
    common: {
      appName: 'DataSphere Innovation',
      loading: 'Cargando...',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      create: 'Crear',
      search: 'Buscar',
      settings: 'Configuración',
      logout: 'Cerrar sesión',
      login: 'Iniciar sesión',
      dashboard: 'Panel',
      projects: 'Proyectos',
      agents: 'Agentes IA',
      monitoring: 'Monitoreo',
      security: 'Seguridad',
    },
    dashboard: {
      welcome: 'Bienvenido a DataSphere Innovation',
      quickActions: 'Acciones rápidas',
      newProject: 'Nuevo proyecto',
      recentProjects: 'Proyectos recientes',
    },
    projects: {
      title: 'Proyectos',
      createProject: 'Crear proyecto',
      noProjects: 'Sin proyectos',
    },
    agents: {
      title: 'Agentes de IA',
      run: 'Ejecutar',
      running: 'Ejecutando',
    },
    monitoring: {
      title: 'Monitoreo',
      systemHealth: 'Estado del sistema',
    },
    settings: {
      title: 'Configuración',
      profile: 'Perfil',
      organization: 'Organización',
      security: 'Seguridad',
      notifications: 'Notificaciones',
      api: 'API',
      billing: 'Facturación',
      language: 'Idioma',
    },
  },
}

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && locales.some(l => l.code === savedLocale)) {
      setLocaleState(savedLocale)
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as Locale
      if (locales.some(l => l.code === browserLang)) {
        setLocaleState(browserLang)
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    document.documentElement.lang = newLocale
  }

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[locale]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key
      }
    }
    
    return typeof value === 'string' ? value : key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Language Switcher Component
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  const currentLocale = locales.find(l => l.code === locale) || locales[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLocale.flag}</span>
          <span className="hidden md:inline">{currentLocale.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.code}
            onClick={() => setLocale(loc.code)}
            className={`gap-2 ${locale === loc.code ? 'bg-muted' : ''}`}
          >
            <span>{loc.flag}</span>
            <span>{loc.name}</span>
            {locale === loc.code && (
              <span className="ml-auto text-green-600">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { locales }
export type { Locale, LocaleConfig }
