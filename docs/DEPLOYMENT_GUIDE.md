# DataSphere Innovation - Guide de Déploiement Production

## Table des Matières

1. [Prérequis](#prérequis)
2. [Architecture de Production](#architecture-de-production)
3. [Configuration de l'Environnement](#configuration-de-lenvironnement)
4. [Déploiement Kubernetes](#déploiement-kubernetes)
5. [Configuration SSL/TLS](#configuration-ssltls)
6. [Monitoring et Alerting](#monitoring-et-alerting)
7. [Backup et Disaster Recovery](#backup-et-disaster-recovery)
8. [Sécurité](#sécurité)
9. [Troubleshooting](#troubleshooting)

---

## 1. Prérequis

### Infrastructure Requise

| Composant | Minimum | Recommandé |
|-----------|---------|------------|
| CPU | 4 cores | 8+ cores |
| RAM | 8 GB | 16+ GB |
| Stockage | 100 GB SSD | 500+ GB SSD |
| Nodes Kubernetes | 3 | 5+ |

### Outils Requis

```bash
# Kubernetes CLI
kubectl version --client

# Helm (package manager)
helm version

# Docker
docker --version

# Node.js
node --version  # v20+

# CLI Tools
npm install -g prisma stripe-cli
```

### Accès Cloud

- **AWS/GCP/Azure**: Credentials configurés
- **Domaine**: DNS configuré
- **Certificats SSL**: Let's Encrypt ou certificats personnalisés

---

## 2. Architecture de Production

```
                                    ┌─────────────────────────────────────────┐
                                    │            Load Balancer                │
                                    │         (nginx-ingress/ALB)             │
                                    └─────────────────┬───────────────────────┘
                                                      │
                                    ┌─────────────────▼───────────────────────┐
                                    │           Ingress Controller            │
                                    │         (TLS Termination)               │
                                    └─────────────────┬───────────────────────┘
                                                      │
                    ┌─────────────────────────────────┼─────────────────────────────────┐
                    │                                 │                                 │
     ┌──────────────▼──────────────┐   ┌──────────────▼──────────────┐   ┌──────────────▼──────────────┐
     │     DataSphere App          │   │     DataSphere App          │   │     DataSphere App          │
     │         (Pod 1)             │   │         (Pod 2)             │   │         (Pod 3)             │
     │   Next.js + Prisma          │   │   Next.js + Prisma          │   │   Next.js + Prisma          │
     └──────────────┬──────────────┘   └──────────────┬──────────────┘   └──────────────┬──────────────┘
                    │                                 │                                 │
                    └─────────────────────────────────┼─────────────────────────────────┘
                                                      │
                    ┌─────────────────────────────────┼─────────────────────────────────┐
                    │                                 │                                 │
     ┌──────────────▼──────────────┐   ┌──────────────▼──────────────┐   ┌──────────────▼──────────────┐
     │        PostgreSQL           │   │           Redis             │   │        Prometheus           │
     │      (Primary + Replica)    │   │     (Cache + Sessions)      │   │       (Monitoring)          │
     │     StatefulSet (3 nodes)   │   │      Deployment (3 pods)    │   │      + Grafana Dashboard    │
     └─────────────────────────────┘   └─────────────────────────────┘   └─────────────────────────────┘
```

---

## 3. Configuration de l'Environnement

### 3.1 Variables d'Environnement

Créez le fichier `.env.production`:

```bash
# ==========================================
# APPLICATION
# ==========================================
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_URL=https://app.dataspheir.io
NEXT_PUBLIC_APP_NAME="DataSphere Innovation"

# ==========================================
# DATABASE (PostgreSQL)
# ==========================================
DATABASE_URL="postgresql://dataspheir:${DB_PASSWORD}@postgres-primary:5432/dataspheir?schema=public&sslmode=require"

# ==========================================
# AUTHENTICATION
# ==========================================
NEXTAUTH_URL=https://app.dataspheir.io
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# ==========================================
# STRIPE
# ==========================================
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}"
STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY}"
STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}"

# ==========================================
# AI SDK
# ==========================================
ZAI_API_KEY="${ZAI_API_KEY}"

# ==========================================
# REDIS
# ==========================================
REDIS_URL="redis://redis-master:6379"

# ==========================================
# EMAIL (SendGrid)
# ==========================================
SENDGRID_API_KEY="${SENDGRID_API_KEY}"
SENDGRID_FROM_EMAIL="noreply@dataspheir.io"

# ==========================================
# MONITORING
# ==========================================
NEXT_PUBLIC_SENTRY_DSN="${SENTRY_DSN}"
SENTRY_AUTH_TOKEN="${SENTRY_AUTH_TOKEN}"
NEXT_PUBLIC_MIXPANEL_TOKEN="${MIXPANEL_TOKEN}"

# ==========================================
# SECURITY
# ==========================================
ENCRYPTION_KEY="${ENCRYPTION_KEY}"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000
```

### 3.2 Secrets Kubernetes

```bash
# Créer le namespace
kubectl create namespace dataspheir-production

# Créer les secrets
kubectl create secret generic dataspheir-secrets \
  --from-literal=DATABASE_URL='postgresql://...' \
  --from-literal=NEXTAUTH_SECRET='$(openssl rand -base64 32)' \
  --from-literal=STRIPE_SECRET_KEY='sk_live_...' \
  --from-literal=ZAI_API_KEY='...' \
  --from-literal=SENDGRID_API_KEY='SG...' \
  --from-literal=ENCRYPTION_KEY='$(openssl rand -hex 32)' \
  -n dataspheir-production

# Créer les secrets Docker pour le registry privé
kubectl create secret docker-registry ghcr-credentials \
  --docker-server=ghcr.io \
  --docker-username=skaba89 \
  --docker-password=${GITHUB_TOKEN} \
  -n dataspheir-production
```

---

## 4. Déploiement Kubernetes

### 4.1 Configuration PostgreSQL

```yaml
# postgresql-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: dataspheir-production
spec:
  serviceName: postgresql
  replicas: 3
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:16-alpine
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: dataspheir
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: dataspheir-secrets
              key: DB_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: dataspheir-secrets
              key: DB_PASSWORD
        resources:
          requests:
            cpu: "1"
            memory: "2Gi"
          limits:
            cpu: "4"
            memory: "8Gi"
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - dataspheir
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - dataspheir
          initialDelaySeconds: 5
          periodSeconds: 5
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: fast-ssd
      resources:
        requests:
          storage: 100Gi
```

### 4.2 Configuration Redis

```yaml
# redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: dataspheir-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command:
        - redis-server
        - --maxmemory
        - "2gb"
        - --maxmemory-policy
        - allkeys-lru
        - --appendonly
        - "yes"
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "2"
            memory: "4Gi"
        livenessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 4.3 Application Deployment

```yaml
# app-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dataspheir-app
  namespace: dataspheir-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dataspheir
  template:
    metadata:
      labels:
        app: dataspheir
    spec:
      imagePullSecrets:
      - name: ghcr-credentials
      containers:
      - name: dataspheir
        image: ghcr.io/skaba89/dataengineer_ia:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: dataspheir-secrets
        env:
        - name: NODE_ENV
          value: production
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "2"
            memory: "4Gi"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: dataspheir-service
  namespace: dataspheir-production
spec:
  selector:
    app: dataspheir
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

### 4.4 Ingress Configuration

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dataspheir-ingress
  namespace: dataspheir-production
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - app.dataspheir.io
    - api.dataspheir.io
    secretName: dataspheir-tls
  rules:
  - host: app.dataspheir.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dataspheir-service
            port:
              number: 80
  - host: api.dataspheir.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dataspheir-service
            port:
              number: 80
```

### 4.5 Horizontal Pod Autoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: dataspheir-hpa
  namespace: dataspheir-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: dataspheir-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 5. Configuration SSL/TLS

### 5.1 Cert-Manager Installation

```bash
# Installer cert-manager
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

# Créer le ClusterIssuer pour Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: security@dataspheir.io
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

---

## 6. Monitoring et Alerting

### 6.1 Prometheus Stack

```bash
# Installer kube-prometheus-stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.ingress.enabled=true \
  --set grafana.ingress.hosts[0]=grafana.dataspheir.io
```

### 6.2 AlertManager Rules

```yaml
# alerting-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: dataspheir-alerts
  namespace: monitoring
spec:
  groups:
  - name: dataspheir-alerts
    rules:
    - alert: HighErrorRate
      expr: |
        sum(rate(http_requests_total{status=~"5.."}[5m])) 
        / sum(rate(http_requests_total[5m])) > 0.05
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value | humanizePercentage }}"
    
    - alert: HighLatency
      expr: |
        histogram_quantile(0.95, 
          sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
        ) > 0.5
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High latency detected"
        description: "P95 latency is {{ $value | humanizeDuration }}"
    
    - alert: DatabaseConnectionPoolExhausted
      expr: |
        pg_stat_activity_count / pg_settings_max_connections > 0.9
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Database connection pool nearly exhausted"
    
    - alert: RedisMemoryHigh
      expr: |
        redis_memory_used_bytes / redis_memory_max_bytes > 0.9
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Redis memory usage is high"
    
    - alert: PodCrashLooping
      expr: |
        rate(kube_pod_container_status_restarts_total[15m]) > 0.1
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod {{ $labels.pod }} is crash looping"
```

### 6.3 Custom Metrics

```yaml
# Ajouter au ConfigMap de Prometheus
# prometheus-additional-scrape-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-additional-config
  namespace: monitoring
data:
  additional-scrape-configs.yaml: |
    - job_name: 'dataspheir-app'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - dataspheir-production
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
```

---

## 7. Backup et Disaster Recovery

### 7.1 PostgreSQL Backup

```yaml
# backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: dataspheir-production
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:16-alpine
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h postgresql -U ${POSTGRES_USER} -d dataspheir \
                | gzip > /backup/dataspheir-$(date +%Y%m%d-%H%M%S).sql.gz
              # Upload to S3
              aws s3 cp /backup/ s3://dataspheir-backups/postgresql/ --recursive
              # Cleanup old backups (keep 30 days)
              find /backup -name "*.sql.gz" -mtime +30 -delete
            env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: dataspheir-secrets
                  key: DB_USER
            - name: PGPASSWORD
              valueFrom:
                secretKeyRef:
                  name: dataspheir-secrets
                  key: DB_PASSWORD
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

### 7.2 Disaster Recovery Plan

| Scenario | RTO | RPO | Action |
|----------|-----|-----|--------|
| Pod failure | < 1 min | 0 | Kubernetes auto-restart |
| Node failure | < 5 min | 0 | Kubernetes reschedule pods |
| DB primary failure | < 15 min | < 1 min | Promote replica |
| Region failure | < 1 hour | < 5 min | Failover to DR region |
| Data corruption | < 4 hours | < 1 hour | Restore from backup |

---

## 8. Sécurité

### 8.1 Network Policies

```yaml
# network-policies.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: dataspheir-network-policy
  namespace: dataspheir-production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  # Allow traffic from ingress controller
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  # Allow monitoring scraping
  - from:
    - namespaceSelector:
        matchLabels:
          name: monitoring
    ports:
    - protocol: TCP
      port: 3000
  egress:
  # Allow DNS
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
  # Allow PostgreSQL
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  # Allow Redis
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  # Allow external HTTPS
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
    ports:
    - protocol: TCP
      port: 443
```

### 8.2 Pod Security Standards

```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: dataspheir-psp
spec:
  privileged: false
  runAsUser:
    rule: MustRunAsNonRoot
  seLinux:
    rule: RunAsAny
  fsGroup:
    rule: RunAsAny
  volumes:
  - 'configMap'
  - 'emptyDir'
  - 'projected'
  - 'secret'
  - 'downwardAPI'
  - 'persistentVolumeClaim'
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
```

---

## 9. Troubleshooting

### 9.1 Commandes de Debug

```bash
# Vérifier le statut des pods
kubectl get pods -n dataspheir-production

# Logs de l'application
kubectl logs -f deployment/dataspheir-app -n dataspheir-production

# Logs d'un pod spécifique
kubectl logs <pod-name> -n dataspheir-production --previous

# Décrire un pod pour voir les événements
kubectl describe pod <pod-name> -n dataspheir-production

# Exécuter une commande dans un pod
kubectl exec -it <pod-name> -n dataspheir-production -- /bin/sh

# Port forward pour debug local
kubectl port-forward svc/dataspheir-service 3000:80 -n dataspheir-production

# Vérifier les ressources
kubectl top pods -n dataspheir-production
kubectl top nodes

# Vérifier les événements
kubectl get events -n dataspheir-production --sort-by='.lastTimestamp'
```

### 9.2 Problèmes Courants

| Problème | Cause | Solution |
|----------|-------|----------|
| Pod CrashLoopBackOff | App crash au démarrage | Vérifier les logs, les variables d'env |
| ImagePullBackOff | Image introuvable | Vérifier le registry, les credentials |
| OOMKilled | Mémoire insuffisante | Augmenter les limits mémoire |
| High CPU | Charge élevée | Scale horizontal, optimiser le code |
| DB connection failed | Mauvaises credentials | Vérifier les secrets, le network policy |
| SSL errors | Certificat expiré | Renouveler avec cert-manager |

### 9.3 Health Check Endpoints

```bash
# Health check basique
curl https://app.dataspheir.io/api/health

# Health check détaillé
curl https://app.dataspheir.io/api/health/detailed

# Métriques Prometheus
curl https://app.dataspheir.io/api/metrics
```

---

## 10. Checklist de Déploiement

### Pre-Deployment
- [ ] Variables d'environnement configurées
- [ ] Secrets créés dans Kubernetes
- [ ] TLS certificates générés
- [ ] Base de données migrée
- [ ] Tests passés en staging

### Deployment
- [ ] Image Docker buildée et poussée
- [ ] Manifests Kubernetes appliqués
- [ ] Pods healthy (3/3 running)
- [ ] Ingress configuré
- [ ] DNS propagé

### Post-Deployment
- [ ] Health check OK
- [ ] SSL fonctionnel
- [ ] Monitoring actif
- [ ] Alertes configurées
- [ ] Backup job actif
- [ ] Load testing validé

---

## Support

Pour toute question ou incident:
- **Email**: devops@dataspheir.io
- **Slack**: #dataspheir-ops
- **Documentation**: https://docs.dataspheir.io
