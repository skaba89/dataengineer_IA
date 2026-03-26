# 🚀 Guide de Démarrage Rapide - DataSphere Innovation

## 📋 Table des Matières

1. [Installation](#installation)
2. [Configuration Stripe](#configuration-stripe)
3. [Configuration SSO](#configuration-sso)
4. [Premiers Pas](#premiers-pas)
5. [Dépannage](#dépannage)

---

## 🛠 Installation

### Prérequis

- Node.js 18+ 
- npm ou bun
- Git

### Étapes d'installation

```bash
# 1. Cloner le repository
git clone https://github.com/skaba89/dataengineer_IA.git
cd dataengineer_IA

# 2. Installer les dépendances
npm install

# 3. Copier le fichier de configuration
cp .env.example .env

# 4. Générer le client Prisma
npx prisma generate

# 5. Initialiser la base de données
npx prisma db push

# 6. (Optionnel) Seed de données de démo
npx prisma db seed

# 7. Lancer le serveur
npm run dev
```

### Accès à l'application

- **URL**: http://localhost:3000
- **Email démo**: demo@example.com
- **Password démo**: demo123

---

## 💳 Configuration Stripe

### Étape 1 : Créer un compte Stripe

1. Allez sur https://dashboard.stripe.com/register
2. Créez votre compteStripe
3. Vérifiez votre email

### Étape 2 : Obtenir les clés API

1. Connectez-vous au Dashboard Stripe
2. Allez dans **Developers** → **API Keys**
3. Copiez les clés suivantes :
   - **Publishable key** (commence par `pk_test_`)
   - **Secret key** (commence par `sk_test_`)

### Étape 3 : Configurer le Webhook

1. Allez dans **Developers** → **Webhooks**
2. Cliquez sur **Add endpoint**
3. Entrez l'URL : `https://votre-domaine.com/api/billing/webhook`
4. Sélectionnez les événements :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** (commence par `whsec_`)

### Étape 4 : Ajouter les variables d'environnement

Ajoutez dans votre fichier `.env` :

```env
# Stripe - Mode Test
STRIPE_SECRET_KEY=sk_test_votre-cle-secrete
STRIPE_PUBLISHABLE_KEY=pk_test_votre-cle-publique
STRIPE_WEBHOOK_SECRET=whsec_votre-webhook-secret

# Stripe - Mode Production (à utiliser plus tard)
# STRIPE_SECRET_KEY=sk_live_xxx
# STRIPE_PUBLISHABLE_KEY=pk_live_xxx
# STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Étape 5 : Créer les produits et prix

Dans le Dashboard Stripe :

1. Allez dans **Products**
2. Créez 4 produits correspondant aux plans :

| Plan | Prix | ID Price |
|------|------|----------|
| Starter | 29€/mois | `price_starter_monthly` |
| Pro | 99€/mois | `price_pro_monthly` |
| Enterprise | Sur devis | `price_enterprise` |
| Agency | 199€/mois | `price_agency_monthly` |

---

## 🔐 Configuration SSO

### Microsoft Azure AD / Entra ID

#### Étape 1 : Enregistrer l'application

1. Connectez-vous au [Portail Azure](https://portal.azure.com)
2. Allez dans **Azure Active Directory** → **App registrations**
3. Cliquez sur **New registration**
4. Entrez les informations :
   - **Name**: DataSphere Innovation
   - **Redirect URI**: `https://votre-domaine.com/api/auth/callback/azure-ad`
5. Cliquez sur **Register**

#### Étape 2 : Configurer les permissions

1. Dans l'application, allez dans **API permissions**
2. Ajoutez les permissions :
   - `openid`
   - `profile`
   - `email`
   - `User.Read`

#### Étape 3 : Créer un secret client

1. Allez dans **Certificates & secrets**
2. Cliquez sur **New client secret**
3. Copiez la valeur du secret

#### Étape 4 : Ajouter les variables d'environnement

```env
AZURE_CLIENT_ID=votre-client-id
AZURE_CLIENT_SECRET=votre-client-secret
AZURE_TENANT_ID=votre-tenant-id
```

---

### Okta

#### Étape 1 : Créer l'application

1. Connectez-vous à votre compte Okta
2. Allez dans **Applications** → **Create App Integration**
3. Sélectionnez **OIDC - OpenID Connect**
4. Sélectionnez **Web Application**
5. Configurez :
   - **Redirect URI**: `https://votre-domaine.com/api/auth/callback/okta`
   - **Logout URI**: `https://votre-domaine.com/`

#### Étape 2 : Obtenir les identifiants

1. Copiez le **Client ID** et **Client Secret**
2. Notez votre **Okta domain** (ex: `dev-123456.okta.com`)

#### Étape 3 : Variables d'environnement

```env
OKTA_CLIENT_ID=votre-client-id
OKTA_CLIENT_SECRET=votre-client-secret
OKTA_ISSUER=https://dev-123456.okta.com
```

---

### Google Workspace

#### Étape 1 : Créer le projet

1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un nouveau projet
3. Activez l'API **Google+ API**

#### Étape 2 : Configurer OAuth

1. Allez dans **APIs & Services** → **Credentials**
2. Cliquez sur **Create Credentials** → **OAuth client ID**
3. Sélectionnez **Web application**
4. Ajoutez l'URI de redirection : `https://votre-domaine.com/api/auth/callback/google`

#### Étape 3 : Variables d'environnement

```env
GOOGLE_CLIENT_ID=votre-client-id
GOOGLE_CLIENT_SECRET=votre-client-secret
```

---

## 🎯 Premiers Pas

### 1. Créer un compte

1. Allez sur http://localhost:3000
2. Cliquez sur **Créer un compte**
3. Entrez vos informations

### 2. Créer un projet

1. Depuis le dashboard, cliquez sur **Nouveau Projet**
2. Entrez le nom et l'industrie
3. Cliquez sur **Créer**

### 3. Exécuter un Workflow

1. Sélectionnez votre projet
2. Cliquez sur **Run Workflow**
3. Les agents IA s'exécutent automatiquement

### 4. Consulter les résultats

1. Allez dans l'onglet **History**
2. Visualisez les résultats de chaque agent
3. Téléchargez les artefacts générés

---

## ❓ Dépannage

### Erreur : Prisma Client not initialized

```bash
npx prisma generate
npx prisma db push
```

### Erreur : Module not found

```bash
rm -rf node_modules
npm install
```

### Erreur : Port 3000 déjà utilisé

```bash
# Sur Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Sur Mac/Linux
lsof -i :3000
kill -9 <pid>
```

### Erreur : Database locked

```bash
rm -rf prisma/dev.db
npx prisma db push
```

---

## 📞 Support

- **Documentation**: `/docs`
- **GitHub Issues**: https://github.com/skaba89/dataengineer_IA/issues
- **Email**: support@datasphere-innovation.com

---

## 🔄 Mise à jour

```bash
git pull origin master
npm install
npx prisma generate
npx prisma db push
npm run dev
```
