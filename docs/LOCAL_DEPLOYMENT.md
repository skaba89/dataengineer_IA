# Guide de Déploiement Local - DataSphere Innovation

Ce guide explique comment déployer DataSphere Innovation sur un serveur local.

## 📋 Prérequis

### Matériel minimum
- CPU: 4 cœurs
- RAM: 8 Go
- Stockage: 50 Go SSD

### Logiciels requis
- Docker 24.0+
- Docker Compose 2.20+
- Git

### Vérification des prérequis
```bash
# Vérifier Docker
docker --version
# Docker version 24.0.0 ou supérieur

# Vérifier Docker Compose
docker-compose --version
# Docker Compose version 2.20.0 ou supérieur
```

## 🚀 Installation Rapide

### 1. Cloner le repository
```bash
git clone https://github.com/skaba89/dataengineer_IA.git
cd dataengineer_IA
```

### 2. Configurer l'environnement
```bash
# Copier le fichier de configuration
cp .env.production.local .env.production.local

# Éditer les variables sensibles
nano .env.production.local
```

**Variables obligatoires à modifier:**
```env
# Sécurité
NEXTAUTH_SECRET=votre-cle-secrete-tres-longue-et-complexe

# Stripe (clés de production)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# IA
ZAI_API_KEY=votre-cle-api-zai

# Email
RESEND_API_KEY=re_xxx
```

### 3. Lancer le déploiement
```bash
# Rendre le script exécutable
chmod +x scripts/deploy-local.sh

# Déployer
./scripts/deploy-local.sh start
```

### 4. Vérifier le déploiement
```bash
# Vérifier le statut
./scripts/deploy-local.sh status

# Voir les logs
./scripts/deploy-local.sh logs
```

## 🔧 Commandes de Gestion

| Commande | Description |
|----------|-------------|
| `./scripts/deploy-local.sh start` | Démarrer les services |
| `./scripts/deploy-local.sh stop` | Arrêter les services |
| `./scripts/deploy-local.sh restart` | Redémarrer les services |
| `./scripts/deploy-local.sh status` | Afficher le statut |
| `./scripts/deploy-local.sh logs` | Voir les logs |
| `./scripts/deploy-local.sh logs app` | Logs de l'application |
| `./scripts/deploy-local.sh logs postgres` | Logs PostgreSQL |
| `./scripts/deploy-local.sh backup` | Créer une sauvegarde |
| `./scripts/deploy-local.sh restore <file>` | Restaurer une sauvegarde |
| `./scripts/deploy-local.sh update` | Mettre à jour l'application |
| `./scripts/deploy-local.sh clean` | Supprimer tout (⚠️ destructif) |

## 🌐 Accès aux Services

| Service | URL | Description |
|---------|-----|-------------|
| **Application** | http://localhost:3000 | Interface principale |
| **PostgreSQL** | localhost:5432 | Base de données |
| **Redis** | localhost:6379 | Cache |

### Services optionnels (avec profil monitoring)
```bash
# Démarrer avec monitoring
docker-compose -f docker-compose.local.yml --profile monitoring up -d
```

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3001 | admin / datasphere2024 |

## 🔒 Sécurité

### 1. Changer les mots de passe par défaut
```env
# Dans .env.production.local
DATABASE_PASSWORD=VotreMotDePasseComplexe!
NEXTAUTH_SECRET=VotreCleSecreteTresLongue!
GRAFANA_PASSWORD=VotreMotDePasseGrafana!
```

### 2. Configurer le pare-feu
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Optionnel, si accès direct
sudo ufw enable
```

### 3. Activer HTTPS (Production)
1. Obtenir un certificat SSL (Let's Encrypt recommandé)
2. Modifier `nginx/nginx.conf` pour activer le bloc HTTPS
3. Placer les certificats dans `nginx/ssl/`

## 📊 Monitoring

### Métriques disponibles
- **Application**: http://localhost:3000/api/metrics
- **Santé**: http://localhost:3000/api/health

### Dashboards Grafana
Importez les dashboards suivants:
- Node Exporter Full (ID: 1860)
- PostgreSQL Database (ID: 9628)
- Redis Dashboard (ID: 11835)

## 💾 Sauvegardes

### Sauvegarde automatique
Les sauvegardes sont automatiquement créées si le service backup est activé:
```bash
docker-compose -f docker-compose.local.yml --profile backup up -d backup
```

### Sauvegarde manuelle
```bash
./scripts/deploy-local.sh backup
```

### Restauration
```bash
# Lister les sauvegardes
ls -la backups/

# Restaurer
./scripts/deploy-local.sh restore backups/datasphere_20240326_120000.sql.gz
```

## 🔄 Mise à Jour

```bash
# Mettre à jour l'application
./scripts/deploy-local.sh update
```

Ou manuellement:
```bash
git pull origin master
./scripts/deploy-local.sh restart
```

## 🐛 Dépannage

### L'application ne démarre pas
```bash
# Vérifier les logs
./scripts/deploy-local.sh logs app

# Vérifier la base de données
docker-compose -f docker-compose.local.yml exec postgres pg_isready
```

### Erreur de connexion base de données
```bash
# Vérifier que PostgreSQL est en cours d'exécution
docker-compose -f docker-compose.local.yml ps postgres

# Redémarrer PostgreSQL
docker-compose -f docker-compose.local.yml restart postgres
```

### Problème de mémoire
```bash
# Vérifier l'utilisation des ressources
docker stats

# Augmenter la mémoire Docker si nécessaire
# Docker Desktop > Settings > Resources
```

### Réinitialiser complètement
```bash
# ⚠️ ATTENTION: Cela supprime toutes les données!
./scripts/deploy-local.sh clean
./scripts/deploy-local.sh start
```

## 📁 Structure des Fichiers

```
datasphere-innovation/
├── docker-compose.local.yml    # Configuration Docker
├── .env.production.local       # Variables d'environnement
├── nginx/
│   ├── nginx.conf             # Configuration Nginx
│   └── ssl/                   # Certificats SSL
├── monitoring/
│   ├── prometheus.yml         # Configuration Prometheus
│   └── grafana/               # Dashboards Grafana
├── backups/                    # Sauvegardes database
└── scripts/
    ├── deploy-local.sh        # Script de déploiement
    └── init-db.sql            # Initialisation database
```

## 🆘 Support

- **Documentation**: `/docs`
- **Issues**: https://github.com/skaba89/dataengineer_IA/issues
- **Email**: support@datasphere-innovation.fr
