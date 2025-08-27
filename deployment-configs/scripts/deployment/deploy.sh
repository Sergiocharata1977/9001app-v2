#!/bin/bash

# Deployment Script for 9001app-v2
# This script handles the complete deployment process

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$(dirname "${SCRIPT_DIR}")")")"
DEPLOYMENT_CONFIG_DIR="${PROJECT_ROOT}/deployment-configs"
ENVIRONMENT="${1:-production}"
ACTION="${2:-deploy}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check if kubectl is available (for Kubernetes deployments)
    if ! command -v kubectl &> /dev/null; then
        warning "kubectl is not installed. Kubernetes deployments will be skipped."
    fi
    
    # Check if required environment variables are set
    if [[ -z "${MONGODB_URI:-}" ]]; then
        error "MONGODB_URI environment variable is not set"
    fi
    
    if [[ -z "${JWT_SECRET:-}" ]]; then
        error "JWT_SECRET environment variable is not set"
    fi
    
    log "Prerequisites check completed"
}

# Function to build Docker images
build_images() {
    log "Building Docker images..."
    
    cd "${PROJECT_ROOT}"
    
    # Build backend image
    log "Building backend image..."
    docker build \
        -f "${DEPLOYMENT_CONFIG_DIR}/docker/Dockerfile.backend" \
        -t 9001app/backend:latest \
        -t 9001app/backend:$(git rev-parse --short HEAD) \
        .
    
    # Build frontend image
    log "Building frontend image..."
    docker build \
        -f "${DEPLOYMENT_CONFIG_DIR}/docker/Dockerfile.frontend" \
        -t 9001app/frontend:latest \
        -t 9001app/frontend:$(git rev-parse --short HEAD) \
        .
    
    log "Docker images built successfully"
}

# Function to run tests
run_tests() {
    log "Running tests..."
    
    cd "${PROJECT_ROOT}"
    
    # Run backend tests
    log "Running backend tests..."
    cd backend
    npm test || error "Backend tests failed"
    cd ..
    
    # Run frontend tests
    log "Running frontend tests..."
    cd frontend
    npm test || error "Frontend tests failed"
    cd ..
    
    log "All tests passed"
}

# Function to deploy with Docker Compose
deploy_docker_compose() {
    log "Deploying with Docker Compose..."
    
    cd "${DEPLOYMENT_CONFIG_DIR}/docker"
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f docker-compose.${ENVIRONMENT}.yml down || true
    
    # Start containers
    log "Starting containers..."
    docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_service_health
    
    log "Docker Compose deployment completed"
}

# Function to deploy with Kubernetes
deploy_kubernetes() {
    log "Deploying with Kubernetes..."
    
    if ! command -v kubectl &> /dev/null; then
        error "kubectl is not available"
    fi
    
    cd "${DEPLOYMENT_CONFIG_DIR}/kubernetes"
    
    # Create namespace if it doesn't exist
    kubectl create namespace 9001app --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply secrets
    log "Applying secrets..."
    kubectl apply -f backend/secret.yaml -n 9001app
    
    # Apply configmaps
    log "Applying configmaps..."
    kubectl apply -f backend/configmap.yaml -n 9001app
    kubectl apply -f frontend/configmap.yaml -n 9001app
    
    # Apply persistent volume claims
    log "Applying persistent volume claims..."
    kubectl apply -f backend/pvc.yaml -n 9001app
    
    # Apply deployments
    log "Applying deployments..."
    kubectl apply -f backend/deployment.yaml -n 9001app
    kubectl apply -f frontend/deployment.yaml -n 9001app
    
    # Apply services
    log "Applying services..."
    kubectl apply -f backend/service.yaml -n 9001app
    kubectl apply -f frontend/service.yaml -n 9001app
    
    # Apply ingress
    log "Applying ingress..."
    kubectl apply -f ingress/nginx-ingress.yaml -n 9001app
    
    # Wait for deployments to be ready
    log "Waiting for deployments to be ready..."
    kubectl rollout status deployment/9001app-backend -n 9001app --timeout=300s
    kubectl rollout status deployment/9001app-frontend -n 9001app --timeout=300s
    
    log "Kubernetes deployment completed"
}

# Function to check service health
check_service_health() {
    log "Checking service health..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        log "Health check attempt $attempt/$max_attempts"
        
        # Check backend health
        if curl -f http://localhost:3000/health &> /dev/null; then
            log "Backend is healthy"
        else
            warning "Backend health check failed"
        fi
        
        # Check frontend health
        if curl -f http://localhost:3001/health &> /dev/null; then
            log "Frontend is healthy"
        else
            warning "Frontend health check failed"
        fi
        
        # If both services are healthy, break
        if curl -f http://localhost:3000/health &> /dev/null && \
           curl -f http://localhost:3001/health &> /dev/null; then
            log "All services are healthy"
            break
        fi
        
        sleep 10
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "Health checks failed after $max_attempts attempts"
    fi
}

# Function to run smoke tests
run_smoke_tests() {
    log "Running smoke tests..."
    
    cd "${PROJECT_ROOT}"
    
    # Run basic API tests
    log "Testing API endpoints..."
    
    # Test backend health
    if curl -f http://localhost:3000/health; then
        log "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    # Test frontend health
    if curl -f http://localhost:3001/health; then
        log "Frontend health check passed"
    else
        error "Frontend health check failed"
    fi
    
    # Test API endpoints
    if curl -f http://localhost:3000/api/status; then
        log "API status check passed"
    else
        warning "API status check failed"
    fi
    
    log "Smoke tests completed"
}

# Function to rollback deployment
rollback() {
    log "Rolling back deployment..."
    
    if [[ "${ENVIRONMENT}" == "production" ]]; then
        # Rollback Kubernetes deployment
        if command -v kubectl &> /dev/null; then
            kubectl rollout undo deployment/9001app-backend -n 9001app
            kubectl rollout undo deployment/9001app-frontend -n 9001app
            log "Kubernetes rollback completed"
        fi
    else
        # Rollback Docker Compose deployment
        cd "${DEPLOYMENT_CONFIG_DIR}/docker"
        docker-compose -f docker-compose.${ENVIRONMENT}.yml down
        docker-compose -f docker-compose.${ENVIRONMENT}.yml up -d
        log "Docker Compose rollback completed"
    fi
}

# Function to show deployment status
show_status() {
    log "Deployment status:"
    
    if [[ "${ENVIRONMENT}" == "production" ]]; then
        if command -v kubectl &> /dev/null; then
            kubectl get pods -n 9001app
            kubectl get services -n 9001app
            kubectl get ingress -n 9001app
        fi
    else
        cd "${DEPLOYMENT_CONFIG_DIR}/docker"
        docker-compose -f docker-compose.${ENVIRONMENT}.yml ps
    fi
}

# Function to show help
show_help() {
    echo "Usage: $0 [ENVIRONMENT] [ACTION]"
    echo ""
    echo "Environments:"
    echo "  development  - Deploy to development environment"
    echo "  staging      - Deploy to staging environment"
    echo "  production   - Deploy to production environment (default)"
    echo ""
    echo "Actions:"
    echo "  deploy       - Deploy the application (default)"
    echo "  rollback     - Rollback to previous version"
    echo "  status       - Show deployment status"
    echo "  test         - Run tests only"
    echo "  build        - Build Docker images only"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 production deploy"
    echo "  $0 staging rollback"
    echo "  $0 development status"
}

# Main execution
main() {
    case "${ACTION}" in
        deploy)
            check_prerequisites
            run_tests
            build_images
            if [[ "${ENVIRONMENT}" == "production" ]]; then
                deploy_kubernetes
            else
                deploy_docker_compose
            fi
            run_smoke_tests
            show_status
            log "Deployment completed successfully"
            ;;
        rollback)
            rollback
            show_status
            log "Rollback completed"
            ;;
        status)
            show_status
            ;;
        test)
            run_tests
            ;;
        build)
            build_images
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown action: ${ACTION}"
            show_help
            ;;
    esac
}

# Execute main function
main