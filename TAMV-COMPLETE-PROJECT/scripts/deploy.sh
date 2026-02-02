#!/bin/bash

# TAMV Production Deployment Script
# Developed by Edwin Oswaldo Castillo Trejo (Anubis Villaseñor)
# 
# Complete deployment automation for TAMV production environment

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${ENVIRONMENT:-production}"
NAMESPACE="tamv-${ENVIRONMENT}"
REGION="${AWS_REGION:-us-west-2}"
CLUSTER_NAME="tamv-${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Error handling
error_exit() {
    log_error "$1"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check required tools
    local tools=("kubectl" "terraform" "helm" "docker" "aws" "jq")
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error_exit "$tool is required but not installed"
        fi
    done
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error_exit "AWS credentials not configured"
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error_exit "Docker daemon is not running"
    fi
    
    log_success "Prerequisites check passed"
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    local images=(
        "tamv-core-api"
        "tamv-xr-renderer"
        "tamv-quantum-processor"
        "tamv-isabella-ai"
        "tamv-blockchain-service"
        "tamv-tenochtitlan-security"
    )
    
    # Get ECR registry URL
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local registry="${account_id}.dkr.ecr.${REGION}.amazonaws.com"
    
    # Login to ECR
    aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$registry"
    
    for image in "${images[@]}"; do
        log_info "Building $image..."
        
        # Build image
        docker build -t "$image:latest" -f "docker/$image/Dockerfile" .
        
        # Tag for ECR
        docker tag "$image:latest" "$registry/$image:latest"
        docker tag "$image:latest" "$registry/$image:$(git rev-parse --short HEAD)"
        
        # Push to ECR
        docker push "$registry/$image:latest"
        docker push "$registry/$image:$(git rev-parse --short HEAD)"
        
        log_success "Built and pushed $image"
    done
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    log_info "Deploying infrastructure with Terraform..."
    
    cd "$PROJECT_ROOT/infrastructure/terraform"
    
    # Initialize Terraform
    terraform init -backend-config="bucket=tamv-terraform-state-${REGION}" \
                   -backend-config="key=tamv/${ENVIRONMENT}/terraform.tfstate" \
                   -backend-config="region=${REGION}"
    
    # Plan deployment
    terraform plan -var="environment=${ENVIRONMENT}" \
                   -var="aws_region=${REGION}" \
                   -var="cluster_name=${CLUSTER_NAME}" \
                   -out=tfplan
    
    # Apply deployment
    terraform apply tfplan
    
    # Get outputs
    local cluster_endpoint=$(terraform output -raw cluster_endpoint)
    local cluster_name=$(terraform output -raw cluster_name)
    
    # Update kubeconfig
    aws eks update-kubeconfig --region "$REGION" --name "$cluster_name"
    
    log_success "Infrastructure deployed successfully"
    cd "$PROJECT_ROOT"
}

# Install Istio service mesh
install_istio() {
    log_info "Installing Istio service mesh..."
    
    # Download and install Istio
    if ! command -v istioctl &> /dev/null; then
        curl -L https://istio.io/downloadIstio | sh -
        export PATH="$PWD/istio-*/bin:$PATH"
    fi
    
    # Install Istio
    istioctl install --set values.defaultRevision=default -y
    
    # Label namespace for injection
    kubectl label namespace "$NAMESPACE" istio-injection=enabled --overwrite
    
    # Apply Istio configuration
    kubectl apply -f "$PROJECT_ROOT/infrastructure/istio/tamv-service-mesh.yaml"
    
    log_success "Istio service mesh installed"
}

# Deploy monitoring stack
deploy_monitoring() {
    log_info "Deploying monitoring stack..."
    
    # Add Helm repositories
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo add grafana https://grafana.github.io/helm-charts
    helm repo update
    
    # Create monitoring namespace
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
    
    # Install Prometheus
    helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
        --namespace monitoring \
        --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
        --set prometheus.prometheusSpec.retention=30d \
        --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=100Gi \
        --set grafana.adminPassword=tamv-admin-2026 \
        --wait
    
    # Import TAMV dashboards
    kubectl create configmap tamv-dashboards \
        --from-file="$PROJECT_ROOT/monitoring/grafana/tamv-dashboards.json" \
        --namespace monitoring \
        --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Monitoring stack deployed"
}

# Deploy TAMV applications
deploy_applications() {
    log_info "Deploying TAMV applications..."
    
    # Create namespace
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kubernetes manifests
    kubectl apply -f "$PROJECT_ROOT/infrastructure/kubernetes/tamv-core-deployment.yaml"
    
    # Wait for deployments to be ready
    local deployments=(
        "tamv-core-api"
        "tamv-xr-renderer"
        "tamv-quantum-processor"
        "tamv-isabella-ai"
        "tamv-blockchain-service"
        "tamv-tenochtitlan-security"
    )
    
    for deployment in "${deployments[@]}"; do
        log_info "Waiting for $deployment to be ready..."
        kubectl rollout status deployment/"$deployment" -n "$NAMESPACE" --timeout=600s
        log_success "$deployment is ready"
    done
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Check pod status
    local failed_pods=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running --no-headers | wc -l)
    if [ "$failed_pods" -gt 0 ]; then
        log_warning "$failed_pods pods are not running"
        kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running
    fi
    
    # Check service endpoints
    local services=(
        "tamv-core-api-service"
        "tamv-xr-renderer-service"
        "tamv-quantum-processor-service"
        "tamv-isabella-ai-service"
        "tamv-blockchain-service"
        "tamv-tenochtitlan-security-service"
    )
    
    for service in "${services[@]}"; do
        local endpoints=$(kubectl get endpoints "$service" -n "$NAMESPACE" -o jsonpath='{.subsets[*].addresses[*].ip}' | wc -w)
        if [ "$endpoints" -eq 0 ]; then
            log_warning "Service $service has no endpoints"
        else
            log_success "Service $service has $endpoints endpoints"
        fi
    done
    
    # Test API endpoints
    local gateway_ip=$(kubectl get svc istio-ingressgateway -n istio-system -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ -n "$gateway_ip" ]; then
        log_info "Testing API endpoints at $gateway_ip..."
        
        # Test core API health
        if curl -f -s "http://$gateway_ip/health" > /dev/null; then
            log_success "Core API health check passed"
        else
            log_warning "Core API health check failed"
        fi
    else
        log_warning "Gateway IP not available yet"
    fi
}

# Setup SSL certificates
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    # Install cert-manager
    kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.13.0/cert-manager.yaml
    
    # Wait for cert-manager to be ready
    kubectl wait --for=condition=available --timeout=300s deployment/cert-manager -n cert-manager
    kubectl wait --for=condition=available --timeout=300s deployment/cert-manager-cainjector -n cert-manager
    kubectl wait --for=condition=available --timeout=300s deployment/cert-manager-webhook -n cert-manager
    
    # Create ClusterIssuer for Let's Encrypt
    cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@tamv.org
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: istio
EOF
    
    # Create certificate
    cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: tamv-tls-cert
  namespace: tamv-production
spec:
  secretName: tamv-tls-secret
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - tamv.org
  - api.tamv.org
  - xr.tamv.org
  - quantum.tamv.org
  - ai.tamv.org
  - blockchain.tamv.org
EOF
    
    log_success "SSL certificates configured"
}

# Backup current deployment
backup_deployment() {
    log_info "Creating deployment backup..."
    
    local backup_dir="$PROJECT_ROOT/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup Kubernetes resources
    kubectl get all -n "$NAMESPACE" -o yaml > "$backup_dir/kubernetes-resources.yaml"
    
    # Backup ConfigMaps and Secrets
    kubectl get configmaps -n "$NAMESPACE" -o yaml > "$backup_dir/configmaps.yaml"
    kubectl get secrets -n "$NAMESPACE" -o yaml > "$backup_dir/secrets.yaml"
    
    # Backup Terraform state
    if [ -f "$PROJECT_ROOT/infrastructure/terraform/terraform.tfstate" ]; then
        cp "$PROJECT_ROOT/infrastructure/terraform/terraform.tfstate" "$backup_dir/"
    fi
    
    log_success "Backup created at $backup_dir"
}

# Rollback deployment
rollback_deployment() {
    log_info "Rolling back deployment..."
    
    local deployments=(
        "tamv-core-api"
        "tamv-xr-renderer"
        "tamv-quantum-processor"
        "tamv-isabella-ai"
        "tamv-blockchain-service"
        "tamv-tenochtitlan-security"
    )
    
    for deployment in "${deployments[@]}"; do
        kubectl rollout undo deployment/"$deployment" -n "$NAMESPACE"
        kubectl rollout status deployment/"$deployment" -n "$NAMESPACE" --timeout=300s
    done
    
    log_success "Rollback completed"
}

# Cleanup resources
cleanup() {
    log_info "Cleaning up resources..."
    
    # Remove old Docker images
    docker image prune -f
    
    # Clean up old ReplicaSets
    kubectl delete replicaset -n "$NAMESPACE" --field-selector=status.replicas=0
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    local action="${1:-deploy}"
    
    case "$action" in
        "deploy")
            log_info "Starting TAMV production deployment..."
            check_prerequisites
            backup_deployment
            build_and_push_images
            deploy_infrastructure
            install_istio
            deploy_monitoring
            setup_ssl
            deploy_applications
            run_health_checks
            cleanup
            log_success "TAMV deployment completed successfully!"
            ;;
        "rollback")
            log_info "Starting rollback..."
            check_prerequisites
            rollback_deployment
            log_success "Rollback completed!"
            ;;
        "health-check")
            log_info "Running health checks..."
            run_health_checks
            ;;
        "cleanup")
            log_info "Running cleanup..."
            cleanup
            ;;
        "build")
            log_info "Building and pushing images..."
            check_prerequisites
            build_and_push_images
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health-check|cleanup|build}"
            echo ""
            echo "Commands:"
            echo "  deploy      - Full deployment (default)"
            echo "  rollback    - Rollback to previous version"
            echo "  health-check - Run health checks only"
            echo "  cleanup     - Clean up resources"
            echo "  build       - Build and push images only"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"