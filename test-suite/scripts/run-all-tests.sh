#!/bin/bash

# Script para ejecutar todos los tests de la suite
# Autor: Tester de Calidad Senior
# Fecha: $(date)

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para mostrar el banner
show_banner() {
    echo "=================================================="
    echo "           SUITE DE TESTS COMPLETA"
    echo "          9001app-v2 - MongoDB Migration"
    echo "=================================================="
    echo ""
}

# Función para verificar dependencias
check_dependencies() {
    print_message "Verificando dependencias..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    # Verificar Jest
    if ! npx jest --version &> /dev/null; then
        print_warning "Jest no está instalado, instalando..."
        npm install --save-dev jest
    fi
    
    # Verificar Playwright
    if ! npx playwright --version &> /dev/null; then
        print_warning "Playwright no está instalado, instalando..."
        npm install --save-dev @playwright/test
        npx playwright install
    fi
    
    # Verificar k6
    if ! command -v k6 &> /dev/null; then
        print_warning "k6 no está instalado, instalando..."
        # Instalar k6 (dependiendo del sistema operativo)
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get install k6
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install k6
        else
            print_warning "Por favor instale k6 manualmente desde https://k6.io/docs/getting-started/installation/"
        fi
    fi
    
    print_success "Dependencias verificadas"
}

# Función para configurar el entorno
setup_environment() {
    print_message "Configurando entorno de testing..."
    
    # Crear directorio de reportes si no existe
    mkdir -p test-suite/reports/test-results
    mkdir -p test-suite/reports/coverage-reports
    mkdir -p test-suite/reports/performance-reports
    mkdir -p test-suite/reports/security-reports
    
    # Configurar variables de entorno para testing
    export NODE_ENV=test
    export TEST_DATABASE_URL=mongodb://localhost:27017/9001app-v2-test
    export TEST_API_URL=http://localhost:5000/api
    export TEST_TIMEOUT=30000
    export COVERAGE_THRESHOLD=90
    
    print_success "Entorno configurado"
}

# Función para ejecutar tests unitarios
run_unit_tests() {
    print_message "Ejecutando tests unitarios..."
    
    start_time=$(date +%s)
    
    # Tests unitarios del backend
    print_message "  - Tests unitarios del backend..."
    npx jest test-suite/unit/backend --coverage --json --outputFile=test-suite/reports/test-results/unit-backend-results.json || {
        print_error "Tests unitarios del backend fallaron"
        return 1
    }
    
    # Tests unitarios del frontend
    print_message "  - Tests unitarios del frontend..."
    npx jest test-suite/unit/frontend --coverage --json --outputFile=test-suite/reports/test-results/unit-frontend-results.json || {
        print_error "Tests unitarios del frontend fallaron"
        return 1
    }
    
    # Tests unitarios compartidos
    print_message "  - Tests unitarios compartidos..."
    npx jest test-suite/unit/shared --coverage --json --outputFile=test-suite/reports/test-results/unit-shared-results.json || {
        print_error "Tests unitarios compartidos fallaron"
        return 1
    }
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    print_success "Tests unitarios completados en ${duration} segundos"
}

# Función para ejecutar tests de integración
run_integration_tests() {
    print_message "Ejecutando tests de integración..."
    
    start_time=$(date +%s)
    
    # Tests de integración de API
    print_message "  - Tests de integración de API..."
    npx jest test-suite/integration/api --json --outputFile=test-suite/reports/test-results/integration-api-results.json || {
        print_error "Tests de integración de API fallaron"
        return 1
    }
    
    # Tests de integración de base de datos
    print_message "  - Tests de integración de base de datos..."
    npx jest test-suite/integration/database --json --outputFile=test-suite/reports/test-results/integration-database-results.json || {
        print_error "Tests de integración de base de datos fallaron"
        return 1
    }
    
    # Tests de integración frontend-backend
    print_message "  - Tests de integración frontend-backend..."
    npx jest test-suite/integration/frontend-backend --json --outputFile=test-suite/reports/test-results/integration-frontend-backend-results.json || {
        print_error "Tests de integración frontend-backend fallaron"
        return 1
    }
    
    # Tests de integración de agentes
    print_message "  - Tests de integración de agentes..."
    npx jest test-suite/integration/agents --json --outputFile=test-suite/reports/test-results/integration-agents-results.json || {
        print_error "Tests de integración de agentes fallaron"
        return 1
    }
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    print_success "Tests de integración completados en ${duration} segundos"
}

# Función para ejecutar tests E2E
run_e2e_tests() {
    print_message "Ejecutando tests E2E..."
    
    start_time=$(date +%s)
    
    # Tests E2E de flujos de usuario
    print_message "  - Tests E2E de flujos de usuario..."
    npx playwright test test-suite/e2e/user-flows/ --reporter=json --output=test-suite/reports/test-results/e2e-user-flows-results.json || {
        print_error "Tests E2E de flujos de usuario fallaron"
        return 1
    }
    
    # Tests E2E de performance
    print_message "  - Tests E2E de performance..."
    npx playwright test test-suite/e2e/performance/ --reporter=json --output=test-suite/reports/test-results/e2e-performance-results.json || {
        print_error "Tests E2E de performance fallaron"
        return 1
    }
    
    # Tests E2E de seguridad
    print_message "  - Tests E2E de seguridad..."
    npx playwright test test-suite/e2e/security/ --reporter=json --output=test-suite/reports/test-results/e2e-security-results.json || {
        print_error "Tests E2E de seguridad fallaron"
        return 1
    }
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    print_success "Tests E2E completados en ${duration} segundos"
}

# Función para ejecutar tests de performance
run_performance_tests() {
    print_message "Ejecutando tests de performance..."
    
    start_time=$(date +%s)
    
    # Tests de carga
    print_message "  - Tests de carga..."
    k6 run test-suite/performance/load/concurrent-users.test.js --out json=test-suite/reports/performance-reports/load-test-results.json || {
        print_error "Tests de carga fallaron"
        return 1
    }
    
    # Tests de estrés
    print_message "  - Tests de estrés..."
    k6 run test-suite/performance/stress/extreme-load.test.js --out json=test-suite/reports/performance-reports/stress-test-results.json || {
        print_error "Tests de estrés fallaron"
        return 1
    }
    
    # Tests de memoria
    print_message "  - Tests de memoria..."
    k6 run test-suite/performance/stress/memory-leak.test.js --out json=test-suite/reports/performance-reports/memory-test-results.json || {
        print_error "Tests de memoria fallaron"
        return 1
    }
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    print_success "Tests de performance completados en ${duration} segundos"
}

# Función para ejecutar tests de seguridad
run_security_tests() {
    print_message "Ejecutando tests de seguridad..."
    
    start_time=$(date +%s)
    
    # Tests de autenticación
    print_message "  - Tests de seguridad de autenticación..."
    npx jest test-suite/security/authentication/ --json --outputFile=test-suite/reports/security-reports/auth-security-results.json || {
        print_error "Tests de seguridad de autenticación fallaron"
        return 1
    }
    
    # Tests de autorización
    print_message "  - Tests de seguridad de autorización..."
    npx jest test-suite/security/authorization/ --json --outputFile=test-suite/reports/security-reports/authorization-results.json || {
        print_error "Tests de seguridad de autorización fallaron"
        return 1
    }
    
    # Tests de protección de datos
    print_message "  - Tests de protección de datos..."
    npx jest test-suite/security/data-protection/ --json --outputFile=test-suite/reports/security-reports/data-protection-results.json || {
        print_error "Tests de protección de datos fallaron"
        return 1
    }
    
    # Tests de seguridad de API
    print_message "  - Tests de seguridad de API..."
    npx jest test-suite/security/api-security/ --json --outputFile=test-suite/reports/security-reports/api-security-results.json || {
        print_error "Tests de seguridad de API fallaron"
        return 1
    }
    
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    print_success "Tests de seguridad completados en ${duration} segundos"
}

# Función para generar reportes
generate_reports() {
    print_message "Generando reportes..."
    
    # Generar reporte de cobertura
    print_message "  - Generando reporte de cobertura..."
    npx jest --coverage --coverageReporters=html --coverageDirectory=test-suite/reports/coverage-reports
    
    # Generar reporte de performance
    print_message "  - Generando reporte de performance..."
    node test-suite/scripts/generate-performance-report.js
    
    # Generar reporte de seguridad
    print_message "  - Generando reporte de seguridad..."
    node test-suite/scripts/generate-security-report.js
    
    # Generar reporte consolidado
    print_message "  - Generando reporte consolidado..."
    node test-suite/scripts/generate-consolidated-report.js
    
    print_success "Reportes generados"
}

# Función para limpiar datos de test
cleanup_test_data() {
    print_message "Limpiando datos de test..."
    
    # Limpiar base de datos de test
    if command -v mongosh &> /dev/null; then
        mongosh --eval "use 9001app-v2-test; db.dropDatabase();" || {
            print_warning "No se pudo limpiar la base de datos de test"
        }
    fi
    
    # Limpiar archivos temporales
    rm -rf test-suite/reports/temp/*
    
    print_success "Datos de test limpiados"
}

# Función para mostrar resumen
show_summary() {
    print_message "Generando resumen de resultados..."
    
    echo ""
    echo "=================================================="
    echo "                RESUMEN DE TESTS"
    echo "=================================================="
    echo ""
    
    # Contar tests ejecutados
    total_tests=$(find test-suite/reports/test-results -name "*.json" -exec jq '.numTotalTests' {} + | awk '{sum+=$1} END {print sum}')
    passed_tests=$(find test-suite/reports/test-results -name "*.json" -exec jq '.numPassedTests' {} + | awk '{sum+=$1} END {print sum}')
    failed_tests=$(find test-suite/reports/test-results -name "*.json" -exec jq '.numFailedTests' {} + | awk '{sum+=$1} END {print sum}')
    
    echo "Tests Totales: $total_tests"
    echo "Tests Exitosos: $passed_tests"
    echo "Tests Fallidos: $failed_tests"
    echo ""
    
    # Calcular porcentaje de éxito
    if [ "$total_tests" -gt 0 ]; then
        success_rate=$(echo "scale=2; $passed_tests * 100 / $total_tests" | bc)
        echo "Tasa de Éxito: ${success_rate}%"
    fi
    
    echo ""
    echo "Reportes generados en: test-suite/reports/"
    echo "=================================================="
}

# Función principal
main() {
    show_banner
    
    # Verificar argumentos
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        echo "Uso: $0 [opciones]"
        echo ""
        echo "Opciones:"
        echo "  --unit-only      Ejecutar solo tests unitarios"
        echo "  --integration-only Ejecutar solo tests de integración"
        echo "  --e2e-only       Ejecutar solo tests E2E"
        echo "  --performance-only Ejecutar solo tests de performance"
        echo "  --security-only  Ejecutar solo tests de seguridad"
        echo "  --no-cleanup     No limpiar datos de test"
        echo "  --help, -h       Mostrar esta ayuda"
        echo ""
        exit 0
    fi
    
    # Variables de control
    RUN_UNIT=true
    RUN_INTEGRATION=true
    RUN_E2E=true
    RUN_PERFORMANCE=true
    RUN_SECURITY=true
    CLEANUP=true
    
    # Procesar argumentos
    for arg in "$@"; do
        case $arg in
            --unit-only)
                RUN_INTEGRATION=false
                RUN_E2E=false
                RUN_PERFORMANCE=false
                RUN_SECURITY=false
                ;;
            --integration-only)
                RUN_UNIT=false
                RUN_E2E=false
                RUN_PERFORMANCE=false
                RUN_SECURITY=false
                ;;
            --e2e-only)
                RUN_UNIT=false
                RUN_INTEGRATION=false
                RUN_PERFORMANCE=false
                RUN_SECURITY=false
                ;;
            --performance-only)
                RUN_UNIT=false
                RUN_INTEGRATION=false
                RUN_E2E=false
                RUN_SECURITY=false
                ;;
            --security-only)
                RUN_UNIT=false
                RUN_INTEGRATION=false
                RUN_E2E=false
                RUN_PERFORMANCE=false
                ;;
            --no-cleanup)
                CLEANUP=false
                ;;
        esac
    done
    
    # Ejecutar tests
    check_dependencies
    setup_environment
    
    if [ "$CLEANUP" = true ]; then
        cleanup_test_data
    fi
    
    if [ "$RUN_UNIT" = true ]; then
        run_unit_tests
    fi
    
    if [ "$RUN_INTEGRATION" = true ]; then
        run_integration_tests
    fi
    
    if [ "$RUN_E2E" = true ]; then
        run_e2e_tests
    fi
    
    if [ "$RUN_PERFORMANCE" = true ]; then
        run_performance_tests
    fi
    
    if [ "$RUN_SECURITY" = true ]; then
        run_security_tests
    fi
    
    generate_reports
    show_summary
    
    print_success "Suite de tests completada exitosamente"
}

# Ejecutar función principal
main "$@"