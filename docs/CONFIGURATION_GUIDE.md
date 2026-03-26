# Guide de Configuration - DataSphere Innovation

## Table des matières

1. [Configuration Stripe](#configuration-stripe)
2. [Configuration SSO Enterprise](#configuration-sso-enterprise)
3. [Configuration Multi-langue](#configuration-multi-langue)
4. [Déploiement](#déploiement)

---

## Configuration Stripe

### 1. Créer un compte Stripe

1. Rendez-vous sur [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Créez un compte et complétez la vérification
3. Activez le mode test pour le développement

### 2. Récupérer les clés API

1. Dans le Dashboard Stripe, allez à **Developers > API Keys**
2. Copiez les clés suivantes dans votre `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_xxx (clé secrète)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx (clé publique)
   ```

### 3. Créer les produits et prix

Exécutez ce script pour créer les produits automatiquement :

```bash
# Créer les produits Stripe via l'API
curl https://api.stripe.com/v1/products \
  -u sk_test_xxx: \
  -d name="Starter" \
  -d description="Pour les startups et TPE"

curl https://api.stripe.com/v1/prices \
  -u sk_test_xxx: \
  -d product=prod_xxx \
  -d unit_amount=49900 \
  -d currency=eur \
  -d "recurring[interval]"=month
```

Ou créez-les manuellement dans le Dashboard Stripe :

#### Plan Starter - 499€/mois
- **Produit**: Starter
- **Prix mensuel**: 499€ (price_starter_monthly)
- **Prix annuel**: 4784€ (price_starter_yearly) - 20% de réduction

#### Plan Professional - 1499€/mois
- **Produit**: Professional
- **Prix mensuel**: 1499€ (price_professional_monthly)
- **Prix annuel**: 14390€ (price_professional_yearly)

#### Plan Enterprise - 4999€/mois
- **Produit**: Enterprise
- **Prix mensuel**: 4999€ (price_enterprise_monthly)
- **Prix annuel**: 47990€ (price_enterprise_yearly)

#### Plan Agency - 2999€/mois
- **Produit**: Agency
- **Prix mensuel**: 2999€ (price_agency_monthly)
- **Prix annuel**: 28790€ (price_agency_yearly)

### 4. Configurer les webhooks

1. Dans Stripe Dashboard, allez à **Developers > Webhooks**
2. Cliquez sur **Add endpoint**
3. Entrez l'URL: `https://votre-domaine.com/api/billing/webhook`
4. Sélectionnez les événements suivants :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** dans `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

### 5. Tester avec Stripe CLI

```bash
# Installer Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git && scoop install stripe

# Se connecter
stripe login

# Forward webhooks en local
stripe listen --forward-to localhost:3000/api/billing/webhook

# Tester un paiement
stripe trigger checkout.session.completed
```

### 6. Configurer le portal client

1. Dans Stripe Dashboard, allez à **Settings > Billing > Customer portal**
2. Activez le portal
3. Configurez les fonctionnalités autorisées :
   - Annulation d'abonnement
   - Mise à jour de méthode de paiement
   - Historique des factures

---

## Configuration SSO Enterprise

### Microsoft Azure AD / Entra ID

#### 1. Créer l'application dans Azure

1. Connectez-vous au [portail Azure](https://portal.azure.com)
2. Allez à **Azure Active Directory > App registrations**
3. Cliquez sur **New registration**
4. Remplissez :
   - **Name**: DataSphere Innovation
   - **Supported account types**: Multitenant
   - **Redirect URI**: `https://votre-domaine.com/api/auth/callback/azure-ad`
5. Cliquez sur **Register**

#### 2. Récupérer les identifiants

1. Dans **Overview**, copiez :
   - **Application (client) ID** → `AZURE_AD_CLIENT_ID`
   - **Directory (tenant) ID** → `AZURE_AD_TENANT_ID`

2. Allez à **Certificates & secrets > New client secret**
3. Créez un secret et copiez la valeur → `AZURE_AD_CLIENT_SECRET`

#### 3. Configurer les permissions

1. Allez à **API permissions > Add a permission**
2. Sélectionnez **Microsoft Graph**
3. Ajoutez :
   - `User.Read`
   - `email`
   - `profile`
   - `openid`

#### 4. Configurer les variables d'environnement

```env
AZURE_AD_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_AD_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AZURE_AD_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

### Okta

#### 1. Créer l'application dans Okta

1. Connectez-vous à votre [console Okta](https://admin.okta.com)
2. Allez à **Applications > Applications**
3. Cliquez sur **Create App Integration**
4. Sélectionnez **OIDC - OpenID Connect** et **Web Application**
5. Configurez :
   - **App integration name**: DataSphere Innovation
   - **Grant type**: Authorization Code
   - **Sign-in redirect URIs**: `https://votre-domaine.com/api/auth/callback/okta`
   - **Sign-out redirect URIs**: `https://votre-domaine.com`
   - **Assignments**: Selon vos besoins

#### 2. Récupérer les identifiants

Dans l'application créée :
- **Client ID** → `OKTA_CLIENT_ID`
- **Client secret** → `OKTA_CLIENT_SECRET`
- **Okta domain** → `OKTA_DOMAIN` (ex: `dev-12345678.okta.com`)

#### 3. Variables d'environnement

```env
OKTA_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
OKTA_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OKTA_DOMAIN=dev-12345678.okta.com
```

---

### Google Workspace

#### 1. Créer le projet Google Cloud

1. Allez à [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet
3. Allez à **APIs & Services > Credentials**
4. Cliquez sur **Create Credentials > OAuth client ID**
5. Sélectionnez **Web application**
6. Configurez :
   - **Name**: DataSphere Innovation
   - **Authorized redirect URIs**: `https://votre-domaine.com/api/auth/callback/google`

#### 2. Récupérer les identifiants

- **Client ID** → `GOOGLE_CLIENT_ID`
- **Client secret** → `GOOGLE_CLIENT_SECRET`

#### 3. Configurer OAuth Consent Screen

1. Allez à **OAuth consent screen**
2. Configurez les informations de l'application
3. Ajoutez les scopes :
   - `openid`
   - `email`
   - `profile`

#### 4. Variables d'environnement

```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

---

### Auth0

#### 1. Créer l'application dans Auth0

1. Connectez-vous à [Auth0 Dashboard](https://manage.auth0.com)
2. Allez à **Applications > Applications**
3. Cliquez sur **Create Application**
4. Sélectionnez **Regular Web Application**
5. Dans **Settings**, configurez :
   - **Allowed Callback URLs**: `https://votre-domaine.com/api/auth/callback/auth0`
   - **Allowed Logout URLs**: `https://votre-domaine.com`
   - **Allowed Web Origins**: `https://votre-domaine.com`

#### 2. Récupérer les identifiants

- **Domain** → `AUTH0_DOMAIN`
- **Client ID** → `AUTH0_CLIENT_ID`
- **Client Secret** → `AUTH0_CLIENT_SECRET`

#### 3. Variables d'environnement

```env
AUTH0_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH0_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH0_DOMAIN=dev-xxxxx.auth0.com
```

---

## Configuration Multi-langue

Le projet supporte 4 langues : Français, Anglais, Allemand, Espagnol.

### Structure des fichiers de traduction

```
messages/
├── fr.json    # Français (défaut)
├── en.json    # Anglais
├── de.json    # Allemand
└── es.json    # Espagnol
```

### Personnaliser les traductions

1. Modifiez les fichiers JSON dans `/messages/`
2. Ajoutez de nouvelles clés selon le format :
```json
{
  "namespace": {
    "key": "Valeur traduite"
  }
}
```

### Ajouter une nouvelle langue

1. Créez un nouveau fichier (ex: `messages/it.json`)
2. Copiez la structure depuis `fr.json`
3. Traduisez toutes les valeurs
4. Ajoutez la langue dans `src/i18n/request.ts` :
```typescript
export const locales = ['fr', 'en', 'de', 'es', 'it'] as const
```

---

## Déploiement

### Variables d'environnement de production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/datasphere
NEXTAUTH_URL=https://votre-domaine.com
NEXTAUTH_SECRET=production-secret-32-chars-min

STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SSO providers (optionnel)
AZURE_AD_CLIENT_ID=xxx
AZURE_AD_CLIENT_SECRET=xxx
AZURE_AD_TENANT_ID=xxx
```

### Commandes de déploiement

```bash
# Générer le client Prisma
npx prisma generate

# Pousser le schéma de base de données
npx prisma db push

# Construire l'application
npm run build

# Démarrer en production
npm run start
```

### Déploiement sur Vercel

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez !

### Déploiement avec Docker

```bash
# Construire l'image
docker build -t datasphere-innovation .

# Lancer le conteneur
docker run -p 3000:3000 --env-file .env datasphere-innovation
```

---

## Support

Pour toute question ou problème :
- Documentation : `/docs`
- GitHub Issues : https://github.com/skaba89/dataengineer_IA/issues
