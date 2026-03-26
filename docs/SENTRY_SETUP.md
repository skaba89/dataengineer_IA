# Sentry Integration Guide - DataSphere Innovation

Ce guide explique comment configurer et utiliser l'intégration Sentry pour le monitoring d'erreurs et de performances dans DataSphere Innovation.

## Table des matières

1. [Configuration initiale](#configuration-initiale)
2. [Variables d'environnement](#variables-denvironnement)
3. [Architecture](#architecture)
4. [Utilisation](#utilisation)
5. [Fonctionnalités](#fonctionnalités)
6. [Bonnes pratiques](#bonnes-pratiques)
7. [Dépannage](#dépannage)

---

## Configuration initiale

### 1. Créer un compte Sentry

1. Rendez-vous sur [sentry.io](https://sentry.io)
2. Créez un compte ou connectez-vous
3. Créez une nouvelle organisation si nécessaire
4. Créez un nouveau projet de type **Next.js**

### 2. Récupérer les identifiants

Après la création du projet, récupérez les informations suivantes :

- **DSN** : URL d'ingestion des événements (format: `https://xxxxxxxx@o1234567.ingest.sentry.io/1234567`)
- **Organization Slug** : Identifiant de votre organisation
- **Project Slug** : Identifiant de votre projet
- **Auth Token** : Token d'authentification pour le CLI (à générer dans Settings > Auth Tokens)

### 3. Configurer les variables d'environnement

Créez ou modifiez le fichier `.env` à la racine du projet :

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o1234567.ingest.sentry.io/1234567
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=your-project-slug
```

---

## Variables d'environnement

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SENTRY_DSN` | ✅ Oui | URL DSN pour l'envoi des événements |
| `SENTRY_AUTH_TOKEN` | ✅ Pour build | Token pour l'upload des source maps |
| `SENTRY_ORG` | ✅ Pour build | Slug de l'organisation Sentry |
| `SENTRY_PROJECT` | ✅ Pour build | Slug du projet Sentry |
| `SENTRY_RELEASE` | ⚪ Non | Version personnalisée (défaut: package.json version) |

---

## Architecture

### Fichiers de configuration

```
├── sentry.client.config.ts    # Configuration client (navigateur)
├── sentry.server.config.ts    # Configuration serveur (Node.js)
├── sentry.edge.config.ts      # Configuration edge (middleware)
├── next.config.ts             # Webpack plugin Sentry
├── src/
│   ├── lib/monitoring/
│   │   └── sentry.ts          # Utilitaires Sentry
│   ├── components/providers/
│   │   └── sentry-provider.tsx # Provider React
│   └── app/api/monitoring/sentry/
│       └── route.ts           # Tunnel API pour ad-blockers
```

### Flux des données

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│   Tunnel     │────▶│   Sentry    │
│  (Browser)  │     │  /api/...    │     │   Cloud     │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                         ▲
       │ Direct (si tunnel désactivé)           │
       └─────────────────────────────────────────┘
```

---

## Utilisation

### Provider React

Enveloppez votre application avec le `SentryProvider` :

```tsx
// src/app/layout.tsx
import { SentryProvider } from '@/components/providers/sentry-provider'
import { SentryErrorBoundary } from '@/components/providers/sentry-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SentryProvider>
          <SentryErrorBoundary>
            {children}
          </SentryErrorBoundary>
        </SentryProvider>
      </body>
    </html>
  )
}
```

### Capturer des erreurs manuellement

```tsx
import { captureError, captureMessage } from '@/lib/monitoring/sentry'

// Capturer une erreur
try {
  // ... code risqué
} catch (error) {
  captureError(error, {
    level: 'error',
    tags: { feature: 'billing' },
    extra: { orderId: '12345' }
  })
}

// Capturer un message
captureMessage('Something notable happened', { level: 'warning' })
```

### Contexte utilisateur

```tsx
import { setUserContext, clearUserContext } from '@/lib/monitoring/sentry'

// Après connexion
setUserContext({
  id: 'user-123',
  email: 'user@example.com',
  username: 'john_doe',
  organizationId: 'org-456',
  role: 'admin'
})

// Après déconnexion
clearUserContext()
```

### Breadcrumbs

```tsx
import { 
  addBreadcrumb, 
  addNavigationBreadcrumb, 
  addHttpBreadcrumb 
} from '@/lib/monitoring/sentry'

// Navigation
addNavigationBreadcrumb('/dashboard', '/settings')

// API call
addHttpBreadcrumb('GET', '/api/users', 200)

// Action utilisateur
addBreadcrumb('Clicked export button', 'user', 'info', { format: 'pdf' })
```

### Performance monitoring

```tsx
import { startSpanAsync } from '@/lib/monitoring/sentry'

// Mesurer une opération async
const result = await startSpanAsync(
  'fetch-user-data',
  'http.client',
  async () => {
    const response = await fetch('/api/user')
    return response.json()
  }
)
```

### Hooks React

```tsx
import { 
  useSentryUser, 
  useSentryError, 
  useSentryPerformance 
} from '@/components/providers/sentry-provider'

function MyComponent() {
  const { setUser } = useSentryUser()
  const { captureError, addBreadcrumb } = useSentryError()
  const { measureApiCall } = useSentryPerformance()

  const handleAction = async () => {
    try {
      await measureApiCall('save-settings', () => 
        fetch('/api/settings', { method: 'POST', body: JSON.stringify(data) })
      )
    } catch (error) {
      captureError(error, { tags: { feature: 'settings' } })
    }
  }

  return <button onClick={handleAction}>Save</button>
}
```

---

## Fonctionnalités

### 1. Error Tracking

- Capture automatique des erreurs non gérées
- Filtrage intelligent du bruit (extensions navigateur, erreurs réseau transitoires)
- Stack traces avec source maps pour le debugging
- Contexte enrichi (navigateur, OS, URL, tags)

### 2. Performance Monitoring

- Traces de navigation automatiques
- Mesure des appels API
- Métriques Web Vitals
- Sampling configurable par environnement

### 3. Session Replay

- Enregistrement des sessions utilisateur (prod uniquement)
- Masquage automatique des données sensibles
- Déclenchement sur erreur

### 4. Error Boundary

- Capture des erreurs React
- UI de fallback élégante
- Feedback utilisateur intégré

### 5. Tunnel API

- Contourne les ad-blockers
- Protection de la vie privée
- Configuration automatique via Next.js rewrite

---

## Bonnes pratiques

### 1. Structurer les erreurs

```tsx
// ❌ Mauvais
captureError('Something failed')

// ✅ Bon
captureError(error, {
  level: 'error',
  tags: { 
    feature: 'authentication',
    operation: 'login' 
  },
  extra: {
    attemptCount: 3,
    provider: 'google'
  },
  fingerprint: ['auth-login-failed'] // Groupement personnalisé
})
```

### 2. Utiliser les tags pertinents

```tsx
setTag('feature', 'billing')
setTag('version', '2.1.0')
setTag('customer_tier', 'enterprise')
```

### 3. Enrichir avec du contexte

```tsx
setContext('order', {
  id: 'ord-123',
  total: 99.99,
  items: 3,
  currency: 'EUR'
})
```

### 4. Gérer les erreurs spécifiques

```tsx
import { 
  trackDatabaseError, 
  trackApiError, 
  trackAuthError, 
  trackBillingError 
} from '@/lib/monitoring/sentry'

// Erreur base de données
trackDatabaseError('SELECT users', error, { query: 'users' })

// Erreur API
trackApiError('/api/orders', 'POST', error, 500)

// Erreur authentification
trackAuthError('oauth_callback', error, 'google')

// Erreur paiement
trackBillingError('subscription_create', error, customerId)
```

### 5. Sampling adaptatif

Les taux de sampling sont configurés par environnement :

| Environnement | Traces | Profiles | Replays |
|---------------|--------|----------|---------|
| Development | 100% | 100% | 0% |
| Staging | 50% | 10% | 10% |
| Production | 10% | 10% | 10% |

---

## Dépannage

### Les erreurs n'apparaissent pas dans Sentry

1. Vérifiez que `NEXT_PUBLIC_SENTRY_DSN` est configuré
2. Vérifiez la console pour les erreurs de configuration
3. Assurez-vous que l'erreur n'est pas filtrée par `ignoreErrors`

### Les source maps ne sont pas uploadés

1. Vérifiez que `SENTRY_AUTH_TOKEN` est configuré
2. Vérifiez que le token a les permissions `project:write`
3. Lancez `npm run build` pour voir les logs d'upload

### Le tunnel ne fonctionne pas

1. Vérifiez que l'endpoint `/api/monitoring/sentry` est accessible
2. Vérifiez les logs du serveur pour les erreurs
3. Essayez de désactiver le tunnel dans `next.config.ts`

### Trop de bruit dans les alertes

1. Ajoutez des patterns à `ignoreErrors` dans les fichiers de config
2. Utilisez `beforeSend` pour filtrer les événements
3. Configurez des règles d'alerte dans Sentry

---

## Ressources

- [Documentation Sentry Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/)

---

## Support

Pour toute question sur l'intégration Sentry dans DataSphere Innovation :

1. Consultez la documentation interne
2. Contactez l'équipe DevOps
3. Ouvrez un ticket sur le repository

---

*Dernière mise à jour : Janvier 2025*
