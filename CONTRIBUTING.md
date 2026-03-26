# Guide de Contribution - DataSphere Innovation

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** >= 20.x
- **Bun** >= 1.3.x
- **PostgreSQL** >= 15.x (optionnel pour dev local avec SQLite)

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-org/datasphere-innovation.git
cd datasphere-innovation

# Installer les dépendances
bun install

# Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos configurations

# Initialiser la base de données
bun run db:generate
bun run db:push
bun run db:seed

# Lancer en développement
bun run dev
```

### Commandes Utiles

```bash
# Développement
bun run dev              # Serveur de développement
bun run lint             # Vérification lint
bun run typecheck        # Vérification TypeScript

# Tests
bun run test             # Tests unitaires
bun run test:watch       # Tests en mode watch
bun run test:coverage    # Tests avec coverage
bun run test:e2e         # Tests E2E Playwright

# Base de données
bun run db:push          # Synchroniser le schéma
bun run db:migrate       # Créer une migration
bun run db:seed          # Peupler les données de test
bun run db:reset         # Réinitialiser la base

# Build
bun run build            # Build production
bun run start            # Serveur production
```

---

## 📋 Workflow Git

### Branches

| Branche | Description |
|---------|-------------|
| `main` | Production - code stable et déployé |
| `develop` | Staging - intégration des features |
| `feature/*` | Nouvelles fonctionnalités |
| `fix/*` | Corrections de bugs |
| `refactor/*` | Refactoring |
| `docs/*` | Documentation |

### Convention de Nommage

```
feature/DSI-123-add-connector-hubspot
fix/DSI-456-billing-webhook-error
refactor/DSI-789-optimize-lineage-queries
docs/DSI-101-update-api-documentation
```

### Processus de Développement

```bash
# 1. Créer une branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/DSI-123-ma-feature

# 2. Développer avec des commits atomiques
git add .
git commit -m "feat(billing): add subscription upgrade flow"

# 3. Pousser et créer une Pull Request
git push origin feature/DSI-123-ma-feature
# Créer la PR sur GitHub vers develop

# 4. Après validation, merger vers develop
# La CI déploie automatiquement en staging

# 5. Release: merger develop vers main
# La CI déploie automatiquement en production
```

---

## 📝 Convention de Commits

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(connectors): add Shopify connector` |
| `fix` | Correction de bug | `fix(billing): resolve webhook timeout` |
| `refactor` | Refactoring sans changement de comportement | `refactor(lineage): optimize graph traversal` |
| `perf` | Amélioration de performance | `perf(api): add Redis caching for metrics` |
| `test` | Ajout/modification de tests | `test(security): add encryption service tests` |
| `docs` | Documentation | `docs(api): update OpenAPI specification` |
| `chore` | Tâches de maintenance | `chore(deps): update dependencies` |
| `ci` | Configuration CI/CD | `ci: add PostgreSQL service container` |

### Scopes Principaux

- `security` - Module de sécurité
- `billing` - Facturation Stripe
- `lineage` - Data Lineage
- `connectors` - Connecteurs de données
- `api` - API routes
- `ui` - Interface utilisateur
- `auth` - Authentification SSO
- `monitoring` - Monitoring et observabilité

---

## 🧪 Standards de Tests

### Couverture Requise

| Module | Couverture Minimum |
|--------|-------------------|
| Security | 85% |
| Billing | 85% |
| Lineage | 80% |
| Connectors | 75% |
| API Routes | 70% |
| UI Components | 60% |

### Structure des Tests

```
src/__tests__/
├── lib/
│   ├── security.test.ts
│   ├── billing.test.ts
│   └── lineage.test.ts
├── app/
│   └── api/
│       ├── health.test.ts
│       └── projects.test.ts
└── e2e/
    ├── auth.spec.ts
    └── pipeline.spec.ts
```

### Exemple de Test Unitaires

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { EncryptionService } from '@/lib/security'

describe('EncryptionService', () => {
  beforeEach(() => {
    EncryptionService.initialize()
  })

  it('should encrypt and decrypt correctly', () => {
    const plaintext = 'secret message'
    const encrypted = EncryptionService.encrypt(plaintext)
    
    expect(encrypted.encrypted).toBeDefined()
    
    const decrypted = EncryptionService.decrypt(
      encrypted.encrypted,
      encrypted.iv,
      encrypted.authTag
    )
    
    expect(decrypted).toBe(plaintext)
  })
})
```

---

## 🏗️ Architecture du Projet

```
src/
├── app/                    # Next.js App Router
│   ├── (marketing)/        # Pages publiques
│   ├── (dashboard)/        # Pages authentifiées
│   └── api/                # API Routes
├── lib/                    # Logique métier
│   ├── security/           # Moteur de sécurité
│   ├── billing/            # Facturation Stripe
│   ├── lineage/            # Data Lineage
│   ├── connectors/         # Connecteurs de données
│   ├── monitoring/         # Monitoring
│   └── error-handler/      # Gestion d'erreurs
├── components/             # Composants React
│   └── ui/                 # shadcn/ui components
└── __tests__/              # Tests
```

---

## 🔒 Règles de Sécurité

### Avant de Committer

- [ ] Pas de secrets en dur dans le code
- [ ] Variables d'environnement documentées
- [ ] Pas de logs de données sensibles
- [ ] Input validation sur tous les endpoints
- [ ] Authorization checks sur les ressources

### Variables d'Environnement

```env
# Obligatoires
DATABASE_URL="postgresql://..."
AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="https://..."

# Optionnelles
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
SENTRY_DSN="https://..."
```

---

## 📊 Code Review Checklist

### Pour l'Auteur

- [ ] Code testé localement
- [ ] Tests unitaires passent
- [ ] Lint sans erreurs
- [ ] TypeScript sans erreurs
- [ ] Documentation mise à jour
- [ ] PR liée à un ticket

### Pour le Reviewer

- [ ] Code lisible et maintenable
- [ ] Respecte les conventions
- [ ] Tests pertinents et complets
- [ ] Pas de problèmes de sécurité
- [ ] Performance acceptable
- [ ] Gestion d'erreurs appropriée

---

## 🆘 Support

### Canaux de Communication

| Canal | Usage |
|-------|-------|
| **Slack #dev-datasphere** | Discussions quotidiennes |
| **GitHub Issues** | Bugs et features |
| **GitHub Discussions** | Questions techniques |
| **Notion** | Documentation équipe |

### Contacts

- **Tech Lead** : @techlead
- **Security Champion** : @security
- **DevOps** : @devops

---

## 📚 Ressources

- [Documentation Technique](./docs/README.md)
- [API Documentation](./docs/API.md)
- [Architecture Decision Records](./docs/ADR/)
- [Runbook Operations](./docs/runbook/)

---

*Merci de contribuer à DataSphere Innovation ! 🚀*
