#!/bin/bash

# ============================================
# DataSphere Innovation - Team Setup Script
# Configuration complète pour nouveau développeur
# ============================================

set -e

echo "🚀 Configuration de l'environnement DataSphere Innovation"
echo "========================================================"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérification des prérequis
echo -e "${BLUE}📋 Vérification des prérequis...${NC}"

# Bun
if ! command -v bun &> /dev/null; then
    echo -e "${YELLOW}⚠️  Bun non installé. Installation...${NC}"
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
else
    echo -e "${GREEN}✓ Bun installé: $(bun --version)${NC}"
fi

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js non installé${NC}"
    echo "Installez Node.js 20+ depuis https://nodejs.org"
    exit 1
else
    echo -e "${GREEN}✓ Node.js installé: $(node --version)${NC}"
fi

# Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚠️  Git non installé${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Git installé: $(git --version)${NC}"
fi

# Configuration Git
echo -e "\n${BLUE}🔧 Configuration Git...${NC}"
read -p "Votre nom pour Git: " git_name
read -p "Votre email pour Git: " git_email

git config --global user.name "$git_name"
git config --global user.email "$git_email"
git config --global init.defaultBranch main
git config --global pull.rebase false

echo -e "${GREEN}✓ Git configuré${NC}"

# Hooks pre-commit
echo -e "\n${BLUE}🪝 Configuration des hooks Git...${NC}"

cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Exécution des vérifications pre-commit..."

# Lint
echo "Running lint..."
bun run lint

# Type check
echo "Running type check..."
bun run typecheck

# Tests rapides
echo "Running quick tests..."
bun run test --run --reporter=dot

echo "✅ Pre-commit checks passed"
EOF

chmod +x .git/hooks/pre-commit
echo -e "${GREEN}✓ Hook pre-commit configuré${NC}"

# Installation des dépendances
echo -e "\n${BLUE}📦 Installation des dépendances...${NC}"
bun install

# Copie du fichier d'environnement
echo -e "\n${BLUE}⚙️  Configuration de l'environnement...${NC}"
if [ ! -f .env.local ]; then
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✓ .env.local créé depuis .env.example${NC}"
    else
        cat > .env.local << 'EOF'
# Base de données
DATABASE_URL="file:./dev.db"

# Authentification
AUTH_SECRET="dev-secret-change-in-production-32chars"
NEXTAUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="DataSphere Innovation"

# Stripe (optionnel - clés test)
# STRIPE_SECRET_KEY="sk_test_..."
# STRIPE_WEBHOOK_SECRET="whsec_..."
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Monitoring (optionnel)
# SENTRY_DSN="https://..."
EOF
        echo -e "${GREEN}✓ .env.local créé avec valeurs par défaut${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.local existe déjà${NC}"
fi

# Base de données
echo -e "\n${BLUE}🗄️  Initialisation de la base de données...${NC}"
bun run db:generate
bun run db:push
bun run db:seed

# Build de vérification
echo -e "\n${BLUE}🏗️  Vérification du build...${NC}"
bun run build

# Tests
echo -e "\n${BLUE}🧪 Exécution des tests...${NC}"
bun run test --run

# VS Code
echo -e "\n${BLUE}📝 Configuration VS Code...${NC}"
mkdir -p .vscode

cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
EOF

cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-playwright.playwright"
  ]
}
EOF

echo -e "${GREEN}✓ VS Code configuré${NC}"

# Résumé
echo -e "\n${GREEN}✅ Configuration terminée avec succès !${NC}"
echo ""
echo "📚 Prochaines étapes :"
echo "  1. Éditer .env.local avec vos configurations"
echo "  2. Lancer 'bun run dev' pour démarrer le serveur"
echo "  3. Ouvrir http://localhost:3000"
echo "  4. Lire CONTRIBUTING.md pour les conventions"
echo ""
echo "🔗 Liens utiles :"
echo "  - Documentation : ./docs/README.md"
echo "  - API Docs : http://localhost:3000/api/docs"
echo "  - Slack : #dev-datasphere"
echo ""
echo "Happy coding! 🚀"
