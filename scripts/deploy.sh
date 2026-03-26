#!/bin/bash

# ============================================
# DataSphere Innovation - Deployment Script
# Automated deployment to Kubernetes
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="dataspheir"
NAMESPACE="dataspheir-production"
REGISTRY="ghcr.io"
REPO="skaba89/dataengineer_IA"
VERSION="${1:-latest}"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    # Check helm
    if ! command -v helm &> /dev/null; then
        log_error "helm is not installed"
        exit 1
    fi
    
    # Check docker
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed"
        exit 1
    fi
    
    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "All prerequisites met"
}

build_and_push_image() {
    log_info "Building Docker image..."
    
    # Build image
    docker build \
        -t ${REGISTRY}/${REPO}:${VERSION} \
        -t ${REGISTRY}/${REPO}:latest \
        --build-arg NODE_ENV=production \
        .
    
    log_success "Docker image built"
    
    # Push image
    log_info "Pushing to registry..."
    docker push ${REGISTRY}/${REPO}:${VERSION}
    docker push ${REGISTRY}/${REPO}:latest
    
    log_success "Image pushed to registry"
}

create_namespace() {
    log_info "Creating namespace..."
    
    kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Namespace ready"
}

create_secrets() {
    log_info "Checking secrets..."
    
    # Check if secrets exist
    if kubectl get secret dataspheir-secrets -n ${NAMESPACE} &> /dev/null; then
        log_warning "Secrets already exist. Delete and recreate? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            kubectl delete secret dataspheir-secrets -n ${NAMESPACE}
        else
            log_info "Using existing secrets"
            return
        fi
    fi
    
    # Create secrets from .env.production
    if [ -f ".env.production" ]; then
        kubectl create secret generic dataspheir-secrets \
            --from-env-file=.env.production \
            -n ${NAMESPACE}
        log_success "Secrets created from .env.production"
    else
        log_error ".env.production not found"
        exit 1
    fi
}

install_helm_charts() {
    log_info "Installing Helm charts..."
    
    # Add repos
    helm repo add jetstack https://charts.jetstack.io
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    
    # Install cert-manager
    if ! helm status cert-manager -n cert-manager &> /dev/null; then
        log_info "Installing cert-manager..."
        helm install cert-manager jetstack/cert-manager \
            --namespace cert-manager \
            --create-namespace \
            --set installCRDs=true
    fi
    
    # Install prometheus stack
    if ! helm status prometheus -n monitoring &> /dev/null; then
        log_info "Installing Prometheus stack..."
        helm install prometheus prometheus-community/kube-prometheus-stack \
            --namespace monitoring \
            --create-namespace
    fi
    
    log_success "Helm charts installed"
}

deploy_database() {
    log_info "Deploying PostgreSQL..."
    
    kubectl apply -f kubernetes/postgresql-statefulset.yaml
    
    # Wait for PostgreSQL to be ready
    kubectl rollout status statefulset/postgresql -n ${NAMESPACE} --timeout=300s
    
    log_success "PostgreSQL deployed"
}

deploy_redis() {
    log_info "Deploying Redis..."
    
    kubectl apply -f kubernetes/redis-deployment.yaml
    
    # Wait for Redis to be ready
    kubectl rollout status deployment/redis -n ${NAMESPACE} --timeout=180s
    
    log_success "Redis deployed"
}

run_migrations() {
    log_info "Running database migrations..."
    
    # Create migration job
    cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration-${VERSION}
  namespace: ${NAMESPACE}
spec:
  template:
    spec:
      containers:
      - name: migration
        image: ${REGISTRY}/${REPO}:${VERSION}
        command: ["npx", "prisma", "migrate", "deploy"]
        envFrom:
        - secretRef:
            name: dataspheir-secrets
      restartPolicy: OnFailure
EOF
    
    # Wait for migration to complete
    kubectl wait --for=condition=complete job/db-migration-${VERSION} -n ${NAMESPACE} --timeout=300s
    
    log_success "Migrations completed"
}

deploy_application() {
    log_info "Deploying application..."
    
    # Update image in deployment
    kubectl set image deployment/dataspheir-app \
        dataspheir=${REGISTRY}/${REPO}:${VERSION} \
        -n ${NAMESPACE}
    
    # Wait for rollout
    kubectl rollout status deployment/dataspheir-app -n ${NAMESPACE} --timeout=300s
    
    log_success "Application deployed"
}

configure_ingress() {
    log_info "Configuring Ingress..."
    
    kubectl apply -f kubernetes/ingress.yaml
    
    # Wait for TLS certificate
    kubectl wait --for=condition=Ready certificate/dataspheir-tls -n ${NAMESPACE} --timeout=300s
    
    log_success "Ingress configured"
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check pods
    PODS=$(kubectl get pods -n ${NAMESPACE} -l app=dataspheir -o jsonpath='{.items[*].status.phase}')
    
    for POD in $PODS; do
        if [ "$POD" != "Running" ]; then
            log_error "Pod not running: $POD"
            exit 1
        fi
    done
    
    # Health check
    log_info "Running health check..."
    
    # Get the ingress IP
    INGRESS_IP=$(kubectl get ingress dataspheir-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    
    if [ -z "$INGRESS_IP" ]; then
        INGRESS_IP=$(kubectl get ingress dataspheir-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    fi
    
    if [ -n "$INGRESS_IP" ]; then
        HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${INGRESS_IP}/api/health)
        
        if [ "$HEALTH_STATUS" == "200" ]; then
            log_success "Health check passed"
        else
            log_warning "Health check returned status: $HEALTH_STATUS"
        fi
    else
        log_warning "Could not determine ingress IP for health check"
    fi
    
    log_success "Deployment verified!"
}

show_status() {
    echo ""
    echo "========================================"
    echo "Deployment Status"
    echo "========================================"
    echo ""
    
    kubectl get pods -n ${NAMESPACE}
    echo ""
    
    kubectl get services -n ${NAMESPACE}
    echo ""
    
    kubectl get ingress -n ${NAMESPACE}
    echo ""
    
    echo "Application URL: https://app.dataspheir.io"
    echo ""
    echo "Monitor with: kubectl logs -f deployment/dataspheir-app -n ${NAMESPACE}"
    echo ""
}

# Main execution
main() {
    echo ""
    echo "========================================"
    echo "DataSphere Innovation - Deploy Script"
    echo "Version: ${VERSION}"
    echo "========================================"
    echo ""
    
    check_prerequisites
    build_and_push_image
    create_namespace
    create_secrets
    install_helm_charts
    deploy_database
    deploy_redis
    run_migrations
    deploy_application
    configure_ingress
    verify_deployment
    show_status
    
    log_success "Deployment completed successfully!"
}

# Run main function
main
