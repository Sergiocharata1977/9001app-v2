#!/bin/bash
echo "🚀 Iniciando Sistema de Coordinación 9001app-v2"
echo "═══════════════════════════════════════════════════"

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm no está instalado"
    exit 1
fi

# Instalar dependencias si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Construir el proyecto
echo "🔨 Construyendo proyecto..."
npm run build

# Iniciar coordinación
echo "🎯 Iniciando coordinación..."
npm run coordinate

echo "✅ Sistema de coordinación iniciado"
