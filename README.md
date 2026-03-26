# 🚀 DataSphere Innovation

**Plateforme Data Engineering pilotée par Intelligence Artificielle**

Une plateforme multi-agents autonome pour l'ingénierie de données avec support multi-langue, facturation Stripe et SSO Enterprise.

## 🌍 Multi-langue / Multi-language

L'application supporte 4 langues :
- 🇫🇷 **Français** (par défaut)
- 🇬🇧 **English**
- 🇩🇪 **Deutsch**
- 🇪🇸 **Español**

Le sélecteur de langue est disponible dans l'en-tête de l'application.

---

## 🤖 Les 10 Agents IA Autonomes

| Agent | Rôle |
|-------|------|
| **Business Agent** | Analyse business & stratégie |
| **Sales Agent** | Qualification & propositions commerciales |
| **Discovery Agent** | Découverte des sources de données |
| **Architecture Agent** | Design d'architecture data |
| **Pipeline Agent** | Génération DAGs Airflow / dbt models |
| **Transformation Agent** | SQL & transformations de données |
| **BI Agent** | Dashboards & KPIs |
| **Conversational Agent** | Requêtes en langage naturel |
| **Pricing Agent** | Propositions tarifaires |
| **Productization Agent** | Templates réutilisables |

---

## 💳 Facturation Stripe

### Plans disponibles

| Plan | Prix | Caractéristiques |
|------|------|------------------|
| **Starter** | 499€/mois | 1 projet, 3 sources, 50 exécutions/mois |
| **Professional** | 1499€/mois | 5 projets, 10 sources, 500 exécutions/mois |
| **Enterprise** | 4999€/mois | Illimité + SSO + SLA 99.9% |
| **Agency** | 2999€/mois | Multi-clients + White-label |

### Configuration Stripe

1. Créer un compte [Stripe](https://stripe.com)
2. Récupérer les clés API dans Dashboard > Developers > API Keys
3. Configurer les webhooks pour `/api/billing/webhook`
4. Exécuter `npx tsx scripts/init-stripe-products.ts` pour créer les produits

Voir [docs/CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md) pour plus de détails.

---

## 🔐 SSO Enterprise

L'application supporte les fournisseurs SSO suivants :

| Provider | Type | Configuration |
|----------|------|---------------|
| **Microsoft Entra ID** | OIDC | Azure AD > App registrations |
| **Okta** | OIDC | Okta Admin > Applications |
| **Google Workspace** | OAuth 2.0 | Google Cloud Console > Credentials |
| **Auth0** | OIDC | Auth0 Dashboard > Applications |
| **OneLogin** | SAML 2.0 | OneLogin Admin > Applications |
| **ADFS** | SAML 2.0 | Active Directory Federation Services |

### Fonctionnalités SSO

- ✅ Just-In-Time (JIT) Provisioning
- ✅ SCIM User Provisioning (Okta, Azure AD)
- ✅ Mapping des attributs personnalisés
- ✅ Synchronisation des groupes
- ✅ Audit logs SSO

Voir [docs/CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md) pour la configuration détaillée.

---

## 🛠 Installation

### Prérequis

- Node.js 18+
- npm ou bun

### Installation rapide

```bash
# 1. Cloner le repo
git clone https://github.com/skaba89/dataengineer_IA.git
cd dataengineer_IA

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec vos valeurs

# 4. Générer le client Prisma et initialiser la base
npx prisma generate
npx prisma db push

# 5. (Optionnel) Seed de données de démo
npx tsx prisma/seed.ts

# 6. Lancer le serveur de développement
npm run dev
```

---

## 🚀 Utilisation

1. Ouvrir http://localhost:3000
2. Se connecter avec un compte démo :
   - **Admin**: admin@demo.com / demo123
   - **Manager**: manager@demo.com / demo123
   - **Analyst**: analyst@demo.com / demo123
   - **Demo**: demo@ai-data-engineering.com / demo123
3. Créer un projet
4. Cliquer "Run Workflow"
5. Les agents IA s'exécutent automatiquement !

---

## ⚙️ Configuration

### Variables d'environnement essentielles

```env
# Base de données
DATABASE_URL=file:./db/custom.db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars

# Stripe (Billing)
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SSO (Optionnel)
AZURE_AD_CLIENT_ID=xxx
AZURE_AD_CLIENT_SECRET=xxx
AZURE_AD_TENANT_ID=xxx
```

### Configuration complète

Voir [docs/CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md) pour :
- Configuration détaillée de Stripe
- Configuration de chaque fournisseur SSO
- Déploiement en production
- Variables d'environnement complètes

---

## 📦 APIs Disponibles

| Endpoint | Description |
|----------|-------------|
| `GET/POST /api/projects` | Gestion des projets |
| `POST /api/workflow` | Exécution du workflow complet |
| `POST /api/agents` | Exécution d'agents individuels |
| `GET/POST /api/scheduler` | Planification de workflows |
| `GET/POST /api/billing/*` | Facturation Stripe |
| `GET/POST /api/sso/*` | SSO & Identity Providers |
| `GET/POST /api/security/*` | Sécurité & Audit |
| `GET /api/health` | Health check |

---

## 🏗 Architecture

```
src/
├── app/
│   ├── api/           # API Routes (47+ endpoints)
│   ├── (dashboard)/   # Pages du dashboard
│   └── page.tsx       # Page principale
├── components/
│   ├── ui/            # shadcn/ui components (30+)
│   └── charts/        # Graphiques
├── lib/
│   ├── agents/        # Système multi-agents (10 agents)
│   ├── billing/       # Stripe integration
│   ├── connectors/    # 35+ connecteurs data
│   ├── i18n/          # Multi-langue
│   ├── monitoring/    # Observabilité
│   ├── security/      # WAF, audit, compliance
│   └── sso/           # Enterprise SSO
├── messages/          # Fichiers de traduction
│   ├── fr.json
│   ├── en.json
│   ├── de.json
│   └── es.json
└── prisma/
    └── schema.prisma  # Modèle de données
```

---

## 📊 Workflow Autonome

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Business   │───▶│  Discovery  │───▶│ Architecture│
│   Agent     │    │   Agent     │    │   Agent     │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                            ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│     BI      │◀───│Transforma-  │◀───│  Pipeline   │
│   Agent     │    │ tion Agent  │    │   Agent     │
└─────────────┘    └─────────────┘    └─────────────┘
```

Chaque agent passe son contexte au suivant pour une exécution autonome et cohérente.

---

## 🔧 Tech Stack

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Backend** | Next.js API Routes |
| **Database** | Prisma ORM, SQLite/PostgreSQL |
| **Auth** | NextAuth.js, SSO Enterprise |
| **AI** | z-ai-web-dev-sdk |
| **Billing** | Stripe |
| **Monitoring** | Prometheus, Grafana |

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📈 Statistiques du projet

- **201+ fichiers** source
- **47+ endpoints API**
- **24+ pages** frontend
- **60+ composants** UI
- **10 agents** IA autonomes
- **35+ connecteurs** de données
- **4 langues** supportées

---

## 📄 License

MIT

---

## 👥 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Configuration**: [docs/CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/skaba89/dataengineer_IA/issues)
