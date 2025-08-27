#!/bin/bash

# Validation Script for 9001app-v2 DevOps Setup
# This script validates the complete DevOps configuration

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$(dirname "${SCRIPT_DIR}")")")"
DEPLOYMENT_CONFIG_DIR="${PROJECT_ROOT}/deployment-configs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WARNINGS=0

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
    ((WARNINGS++))
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Function to check file existence
check_file() {
    local file="$1"
    local description="$2"
    
    if [[ -f "${file}" ]]; then
        success "${description} - ${file}"
    else
        error "${description} - ${file} (NOT FOUND)"
    fi
}

# Function to check directory existence
check_directory() {
    local dir="$1"
    local description="$2"
    
    if [[ -d "${dir}" ]]; then
        success "${description} - ${dir}"
    else
        error "${description} - ${dir} (NOT FOUND)"
    fi
}

# Function to check executable permissions
check_executable() {
    local file="$1"
    local description="$2"
    
    if [[ -f "${file}" && -x "${file}" ]]; then
        success "${description} - ${file} (executable)"
    elif [[ -f "${file}" ]]; then
        warning "${description} - ${file} (not executable)"
    else
        error "${description} - ${file} (NOT FOUND)"
    fi
}

# Function to validate Docker configuration
validate_docker() {
    info "Validating Docker configuration..."
    
    check_file "${DEPLOYMENT_CONFIG_DIR}/docker/Dockerfile.backend" "Backend Dockerfile"
    check_file "${DEPLOYMENT_CONFIG_DIR}/docker/Dockerfile.frontend" "Frontend Dockerfile"
    check_file "${DEPLOYMENT_CONFIG_DIR}/docker/docker-compose.yml" "Docker Compose (dev)"
    check_file "${DEPLOYMENT_CONFIG_DIR}/docker/docker-compose.prod.yml" "Docker Compose (prod)"
    
    # Check if Docker is available
    if command -v docker &> /dev/null; then
        success "Docker is installed"
    else
        error "Docker is not installed"
    fi
    
    # Check if Docker Compose is available
    if command -v docker-compose &> /dev/null; then
        success "Docker Compose is installed"
    else
        error "Docker Compose is not installed"
    fi
}

# Function to validate Kubernetes configuration
validate_kubernetes() {
    info "Validating Kubernetes configuration..."
    
    check_file "${DEPLOYMENT_CONFIG_DIR}/kubernetes/backend/deployment.yaml" "Backend deployment"
    check_file "${DEPLOYMENT_CONFIG_DIR}/kubernetes/frontend/deployment.yaml" "Frontend deployment"
    check_file "${DEPLOYMENT_CONFIG_DIR}/kubernetes/backend/service.yaml" "Backend service"
    check_file "${DEPLOYMENT_CONFIG_DIR}/kubernetes/frontend/service.yaml" "Frontend service"
    
    # Check if kubectl is available
    if command -v kubectl &> /dev/null; then
        success "kubectl is installed"
    else
        warning "kubectl is not installed (Kubernetes deployments will be skipped)"
    fi
}

# Function to validate CI/CD configuration
validate_cicd() {
    info "Validating CI/CD configuration..."
    
    check_file "${DEPLOYMENT_CONFIG_DIR}/ci-cd/github-actions/ci.yml" "GitHub Actions CI"
    check_file "${DEPLOYMENT_CONFIG_DIR}/ci-cd/github-actions/cd-production.yml" "GitHub Actions CD"
    
    # Check if .github directory exists
    if [[ -d "${PROJECT_ROOT}/.github" ]]; then
        success "GitHub directory exists"
    else
        warning "GitHub directory not found (CI/CD workflows may not work)"
    fi
}

# Function to validate monitoring configuration
validate_monitoring() {
    info "Validating monitoring configuration..."
    
    check_file "${DEPLOYMENT_CONFIG_DIR}/monitoring/prometheus/prometheus.yml" "Prometheus configuration"
    check_file "${DEPLOYMENT_CONFIG_DIR}/monitoring/prometheus/rules/app-rules.yml" "Prometheus rules"
    
    # Check if monitoring directories exist
    check_directory "${DEPLOYMENT_CONFIG_DIR}/monitoring/grafana" "Grafana directory"
    check_directory "${DEPLOYMENT_CONFIG_DIR}/monitoring/logging" "Logging directory"
    check_directory "${DEPLOYMENT_CONFIG_DIR}/monitoring/alerting" "Alerting directory"
}

# Function to validate backup configuration
validate_backup() {
    info "Validating backup configuration..."
    
    check_executable "${DEPLOYMENT_CONFIG_DIR}/backup/mongodb/backup-script.sh" "MongoDB backup script"
    check_directory "${DEPLOYMENT_CONFIG_DIR}/backup/application" "Application backup directory"
    check_directory "${DEPLOYMENT_CONFIG_DIR}/backup/disaster-recovery" "Disaster recovery directory"
}

# Function to validate security configuration
validate_security() {
    info "Validating security configuration..."
    
    check_executable "${DEPLOYMENT_CONFIG_DIR}/security/firewall/iptables-rules" "Firewall rules"
    check_directory "${DEPLOYMENT_CONFIG_DIR}/security/ssl" "SSL certificates directory"
    check_directory "${DEPLOYMENT_CONFIG_DIR}/security/secrets" "Secrets directory"
}

# Function to validate scripts
validate_scripts() {
    info "Validating scripts..."
    
    check_executable "${DEPLOYMENT_CONFIG_DIR}/scripts/deployment/deploy.sh" "Deployment script"
    check_directory "${DEPLOYMENT_CONFIG_DIR}/scripts/monitoring" "Monitoring scripts"
    check_directory "${DEPLOYMENT_CONFIG_DIR}/scripts/maintenance" "Maintenance scripts"
}

# Function to validate documentation
validate_documentation() {
    info "Validating documentation..."
    
    check_file "${DEPLOYMENT_CONFIG_DIR}/README.md" "DevOps README"
    check_file "${DEPLOYMENT_CONFIG_DIR}/documentation/deployment-guide.md" "Deployment guide"
    check_directory "${DEPLOYMENT_CONFIG_DIR}/documentation" "Documentation directory"
}

# Function to validate environment variables
validate_environment() {
    info "Validating environment variables..."
    
    local required_vars=("MONGODB_URI" "JWT_SECRET" "AGENT_API_KEY")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -eq 0 ]]; then
        success "All required environment variables are set"
    else
        error "Missing environment variables: ${missing_vars[*]}"
    fi
}

# Function to validate package.json scripts
validate_package_scripts() {
    info "Validating package.json scripts..."
    
    local required_scripts=(
        "deploy"
        "deploy:dev"
        "deploy:staging"
        "deploy:prod"
        "backup"
        "monitor"
        "security:scan"
    )
    
    for script in "${required_scripts[@]}"; do
        if npm run --silent "$script" --help &> /dev/null; then
            success "Script '$script' is available"
        else
            error "Script '$script' is not available"
        fi
    done
}

# Function to validate project structure
validate_project_structure() {
    info "Validating project structure..."
    
    local required_dirs=(
        "backend"
        "frontend"
        "deployment-configs"
        "deployment-configs/docker"
        "deployment-configs/kubernetes"
        "deployment-configs/ci-cd"
        "deployment-configs/monitoring"
        "deployment-configs/backup"
        "deployment-configs/security"
        "deployment-configs/scripts"
        "deployment-configs/documentation"
    )
    
    for dir in "${required_dirs[@]}"; do
        check_directory "${PROJECT_ROOT}/${dir}" "Project directory: ${dir}"
    done
}

# Function to validate dependencies
validate_dependencies() {
    info "Validating dependencies..."
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        success "Node.js is installed: ${node_version}"
        
        # Check if version is >= 18
        local major_version=$(echo "$node_version" | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $major_version -ge 18 ]]; then
            success "Node.js version is compatible (>= 18)"
        else
            error "Node.js version is too old (< 18)"
        fi
    else
        error "Node.js is not installed"
    fi
    
    # Check npm version
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        success "npm is installed: ${npm_version}"
    else
        error "npm is not installed"
    fi
    
    # Check if dependencies are installed
    if [[ -d "${PROJECT_ROOT}/node_modules" ]]; then
        success "Node.js dependencies are installed"
    else
        warning "Node.js dependencies are not installed (run 'npm install')"
    fi
}

# Function to run integration tests
run_integration_tests() {
    info "Running integration tests..."
    
    # Test Docker build
    if command -v docker &> /dev/null; then
        info "Testing Docker build..."
        cd "${PROJECT_ROOT}"
        if docker build -f "${DEPLOYMENT_CONFIG_DIR}/docker/Dockerfile.backend" -t test-backend . &> /dev/null; then
            success "Backend Docker build test passed"
            docker rmi test-backend &> /dev/null
        else
            error "Backend Docker build test failed"
        fi
    fi
    
    # Test Docker Compose syntax
    if command -v docker-compose &> /dev/null; then
        info "Testing Docker Compose syntax..."
        cd "${DEPLOYMENT_CONFIG_DIR}/docker"
        if docker-compose -f docker-compose.yml config &> /dev/null; then
            success "Docker Compose syntax test passed"
        else
            error "Docker Compose syntax test failed"
        fi
    fi
}

# Function to generate validation report
generate_report() {
    info "Generating validation report..."
    
    local report_file="${PROJECT_ROOT}/devops-validation-report.txt"
    
    cat > "${report_file}" << EOF
9001app-v2 DevOps Validation Report
Generated: $(date)
Project: ${PROJECT_ROOT}

SUMMARY:
- Total Tests: ${TOTAL_TESTS}
- Passed: ${PASSED_TESTS}
- Failed: ${FAILED_TESTS}
- Warnings: ${WARNINGS}
- Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))% (if TOTAL_TESTS > 0)

DETAILED RESULTS:
EOF
    
    if [[ ${FAILED_TESTS} -eq 0 ]]; then
        echo "✅ All critical tests passed!" >> "${report_file}"
    else
        echo "❌ ${FAILED_TESTS} critical tests failed!" >> "${report_file}"
    fi
    
    if [[ ${WARNINGS} -gt 0 ]]; then
        echo "⚠️  ${WARNINGS} warnings found" >> "${report_file}"
    fi
    
    echo "" >> "${report_file}"
    echo "RECOMMENDATIONS:" >> "${report_file}"
    
    if [[ ${FAILED_TESTS} -gt 0 ]]; then
        echo "- Fix all failed tests before deployment" >> "${report_file}"
    fi
    
    if [[ ${WARNINGS} -gt 0 ]]; then
        echo "- Review warnings and address as needed" >> "${report_file}"
    fi
    
    echo "- Run 'npm run deploy:dev' to test deployment" >> "${report_file}"
    echo "- Run 'npm run monitor' to verify monitoring" >> "${report_file}"
    echo "- Run 'npm run backup' to test backup system" >> "${report_file}"
    
    success "Validation report generated: ${report_file}"
}

# Main validation function
main() {
    log "Starting DevOps validation for 9001app-v2..."
    
    # Validate project structure
    validate_project_structure
    
    # Validate dependencies
    validate_dependencies
    
    # Validate Docker configuration
    validate_docker
    
    # Validate Kubernetes configuration
    validate_kubernetes
    
    # Validate CI/CD configuration
    validate_cicd
    
    # Validate monitoring configuration
    validate_monitoring
    
    # Validate backup configuration
    validate_backup
    
    # Validate security configuration
    validate_security
    
    # Validate scripts
    validate_scripts
    
    # Validate documentation
    validate_documentation
    
    # Validate environment variables
    validate_environment
    
    # Validate package.json scripts
    validate_package_scripts
    
    # Run integration tests
    run_integration_tests
    
    # Generate report
    generate_report
    
    # Final summary
    echo ""
    log "Validation completed!"
    echo "📊 Results:"
    echo "  ✅ Passed: ${PASSED_TESTS}"
    echo "  ❌ Failed: ${FAILED_TESTS}"
    echo "  ⚠️  Warnings: ${WARNINGS}"
    echo "  📈 Success Rate: $(( (PASSED_TESTS * 100) / TOTAL_TESTS ))%"
    
    if [[ ${FAILED_TESTS} -eq 0 ]]; then
        success "🎉 DevOps setup is ready for deployment!"
        exit 0
    else
        error "🔧 Please fix the failed tests before proceeding"
        exit 1
    fi
}

# Execute main function
main