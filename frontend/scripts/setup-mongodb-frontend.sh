#!/bin/bash

# MongoDB Frontend Setup Script
# Script para configurar el frontend para MongoDB

echo "🚀 Configurando Frontend para MongoDB..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
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

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Ejecuta este script desde el directorio frontend/"
    exit 1
fi

print_status "Iniciando configuración del frontend para MongoDB..."

# 1. Instalar dependencias
print_status "Instalando dependencias..."
npm install --ignore-scripts

if [ $? -eq 0 ]; then
    print_success "Dependencias instaladas correctamente"
else
    print_error "Error al instalar dependencias"
    exit 1
fi

# 2. Verificar archivos críticos
print_status "Verificando archivos críticos..."

critical_files=(
    "src/types/mongodb-types.ts"
    "src/services/api/mongodb-client.ts"
    "src/components/views/CardView.tsx"
    "src/components/views/ListView.tsx"
    "src/hooks/useViewMode.ts"
)

missing_files=()
for file in "${critical_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_error "Archivos críticos faltantes:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
else
    print_success "Todos los archivos críticos están presentes"
fi

# 3. Verificar variables de entorno
print_status "Verificando variables de entorno..."

if [ ! -f ".env" ]; then
    print_warning "Archivo .env no encontrado, creando..."
    cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=9001app-v2
VITE_ENABLE_ANALYTICS=false
VITE_THEME=light
EOF
    print_success "Archivo .env creado"
else
    print_success "Archivo .env encontrado"
fi

# 4. Verificar configuración de TypeScript
print_status "Verificando configuración de TypeScript..."

if [ -f "tsconfig.json" ]; then
    print_success "Configuración TypeScript encontrada"
else
    print_warning "tsconfig.json no encontrado"
fi

# 5. Verificar configuración de Vite
print_status "Verificando configuración de Vite..."

if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
    print_success "Configuración Vite encontrada"
else
    print_warning "vite.config no encontrado"
fi

# 6. Ejecutar type checking
print_status "Ejecutando verificación de tipos..."
npm run type-check 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Verificación de tipos exitosa"
else
    print_warning "Algunos errores de tipos encontrados (puedes continuar)"
fi

# 7. Ejecutar linting
print_status "Ejecutando linting..."
npm run lint 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Linting exitoso"
else
    print_warning "Algunos problemas de linting encontrados"
fi

# 8. Crear directorios faltantes
print_status "Creando directorios faltantes..."

directories=(
    "src/components/views"
    "src/components/common"
    "src/components/ui"
    "src/services/api"
    "src/hooks"
    "src/utils"
    "src/store"
    "src/types"
    "tests/components"
    "tests/hooks"
    "tests/pages"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_status "Directorio creado: $dir"
    fi
done

# 9. Verificar estructura del proyecto
print_status "Verificando estructura del proyecto..."

project_structure="src/
├── components/
│   ├── views/
│   │   ├── CardView.tsx
│   │   ├── ListView.tsx
│   │   └── ViewSelector.tsx
│   ├── ui/
│   │   └── Card.tsx
│   └── common/
│       └── EmptyState.tsx
├── services/
│   └── api/
│       ├── mongodb-client.ts
│       ├── departmentsService.ts
│       └── personnelService.ts
├── hooks/
│   └── useViewMode.ts
├── types/
│   ├── mongodb-types.ts
│   └── view-types.ts
└── pages/
    └── Departamentos.tsx"

echo "Estructura esperada del proyecto:"
echo "$project_structure"

# 10. Información final
echo ""
print_success "✅ Configuración del frontend MongoDB completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ejecutar: npm run dev"
echo "2. Verificar que el servidor backend esté corriendo en localhost:5000"
echo "3. Revisar la documentación en FRONTEND_MONGODB_MIGRATION.md"
echo ""
echo "🔧 Comandos útiles:"
echo "  npm run dev          # Ejecutar en desarrollo"
echo "  npm run build        # Build para producción"
echo "  npm run test         # Ejecutar tests"
echo "  npm run lint         # Linting"
echo "  npm run type-check   # Verificación de tipos"
echo ""
print_success "¡El frontend está listo para trabajar con MongoDB! 🎉"