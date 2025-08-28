# ===============================================
# 🚀 SCRIPT AVANZADO DE INICIO - SISTEMA SGC
# ===============================================
# Descripción: Script completo para gestionar el sistema 9001app2
# Autor: Sistema de Coordinación de Agentes
# Fecha: 19 de Agosto, 2025
# ===============================================

param(
    [string]$Accion = "iniciar",
    [switch]$InstalarDeps,
    [switch]$Detener,
    [switch]$Ayuda
)

# Colores para output
$Colores = @{
    Info = "Cyan"
    Exito = "Green"
    Error = "Red"
    Advertencia = "Yellow"
    Blanco = "White"
}

function Escribir-Mensaje {
    param([string]$Mensaje, [string]$Color = "White")
    Write-Host $Mensaje -ForegroundColor $Colores[$Color]
}

function Verificar-NodeJS {
    try {
        $version = node --version
        Escribir-Mensaje "✅ Node.js encontrado: $version" "Exito"
        return $true
    }
    catch {
        Escribir-Mensaje "❌ Node.js no está instalado" "Error"
        Escribir-Mensaje "   Instala desde: https://nodejs.org/" "Error"
        return $false
    }
}

function Verificar-Puerto {
    param([int]$Puerto)
    $conexion = Get-NetTCPConnection -LocalPort $Puerto -ErrorAction SilentlyContinue
    return $conexion -ne $null
}

function Matar-ProcesoPuerto {
    param([int]$Puerto)
    try {
        $proceso = Get-NetTCPConnection -LocalPort $Puerto -ErrorAction SilentlyContinue
        if ($proceso) {
            Stop-Process -Id $proceso.OwningProcess -Force
            Escribir-Mensaje "✅ Proceso en puerto $Puerto terminado" "Exito"
        }
    }
    catch {
        Escribir-Mensaje "⚠️ No se pudo terminar proceso en puerto $Puerto" "Advertencia"
    }
}

function Instalar-Dependencias {
    Escribir-Mensaje "📦 Instalando dependencias..." "Info"
    
    # Backend
    if (Test-Path "backend/package.json") {
        Set-Location "backend"
        Escribir-Mensaje "   Instalando dependencias del Backend..." "Advertencia"
        npm install
        Set-Location ".."
    }
    
    # Frontend
    if (Test-Path "frontend/package.json") {
        Set-Location "frontend"
        Escribir-Mensaje "   Instalando dependencias del Frontend..." "Advertencia"
        npm install
        Set-Location ".."
    }
    
    Escribir-Mensaje "✅ Dependencias instaladas" "Exito"
}

function Iniciar-Backend {
    Escribir-Mensaje "🔧 Iniciando Backend..." "Advertencia"
    
    if (Verificar-Puerto 5000) {
        Escribir-Mensaje "⚠️ Puerto 5000 en uso, terminando proceso..." "Advertencia"
        Matar-ProcesoPuerto 5000
        Start-Sleep -Seconds 2
    }
    
    Set-Location "backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Set-Location ".."
    
    Escribir-Mensaje "✅ Backend iniciado en puerto 5000" "Exito"
}

function Iniciar-Frontend {
    Escribir-Mensaje "🎨 Iniciando Frontend..." "Advertencia"
    
    if (Verificar-Puerto 3000) {
        Escribir-Mensaje "⚠️ Puerto 3000 en uso, terminando proceso..." "Advertencia"
        Matar-ProcesoPuerto 3000
        Start-Sleep -Seconds 2
    }
    
    Set-Location "frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Set-Location ".."
    
    Escribir-Mensaje "✅ Frontend iniciado en puerto 3000" "Exito"
}

function Detener-Servicios {
    Escribir-Mensaje "🛑 Deteniendo servicios..." "Advertencia"
    Matar-ProcesoPuerto 3000
    Matar-ProcesoPuerto 5000
    Escribir-Mensaje "✅ Servicios detenidos" "Exito"
}

function Mostrar-Estado {
    Escribir-Mensaje "📊 Estado de los servicios:" "Info"
    
    if (Verificar-Puerto 3000) {
        Escribir-Mensaje "✅ Frontend: http://localhost:3000" "Exito"
    } else {
        Escribir-Mensaje "❌ Frontend: No está ejecutándose" "Error"
    }
    
    if (Verificar-Puerto 5000) {
        Escribir-Mensaje "✅ Backend: http://localhost:5000" "Exito"
    } else {
        Escribir-Mensaje "❌ Backend: No está ejecutándose" "Error"
    }
}

function Mostrar-Ayuda {
    Escribir-Mensaje "📖 AYUDA - SCRIPT DE INICIO SGC" "Info"
    Escribir-Mensaje "===============================" "Info"
    Escribir-Mensaje ""
    Escribir-Mensaje "Uso: .\iniciar-sistema-avanzado.ps1 [opciones]" "Blanco"
    Escribir-Mensaje ""
    Escribir-Mensaje "Opciones:" "Advertencia"
    Escribir-Mensaje "  -Accion <tipo>     - iniciar, detener, estado" "Blanco"
    Escribir-Mensaje "  -InstalarDeps      - Instala dependencias" "Blanco"
    Escribir-Mensaje "  -Detener           - Detiene todos los servicios" "Blanco"
    Escribir-Mensaje "  -Ayuda             - Muestra esta ayuda" "Blanco"
    Escribir-Mensaje ""
    Escribir-Mensaje "Ejemplos:" "Advertencia"
    Escribir-Mensaje "  .\iniciar-sistema-avanzado.ps1" "Blanco"
    Escribir-Mensaje "  .\iniciar-sistema-avanzado.ps1 -InstalarDeps" "Blanco"
    Escribir-Mensaje "  .\iniciar-sistema-avanzado.ps1 -Accion estado" "Blanco"
    Escribir-Mensaje "  .\iniciar-sistema-avanzado.ps1 -Detener" "Blanco"
    Escribir-Mensaje ""
}

# ===============================================
# 🎯 LÓGICA PRINCIPAL
# ===============================================

Escribir-Mensaje "🎯 SISTEMA SGC - 9001APP2" "Info"
Escribir-Mensaje "===============================================" "Info"
Escribir-Mensaje ""

if ($Ayuda) {
    Mostrar-Ayuda
    exit 0
}

if (-not (Verificar-NodeJS)) {
    exit 1
}

switch ($Accion.ToLower()) {
    "iniciar" {
        if ($InstalarDeps) {
            Instalar-Dependencias
        }
        
        Iniciar-Backend
        Start-Sleep -Seconds 3
        Iniciar-Frontend
        
        Escribir-Mensaje ""
        Escribir-Mensaje "🎉 ¡SISTEMA SGC INICIADO!" "Exito"
        Escribir-Mensaje "🌐 Frontend: http://localhost:3000" "Blanco"
        Escribir-Mensaje "🔧 Backend: http://localhost:5000" "Blanco"
        Escribir-Mensaje "🛠️ Super Admin: http://localhost:3000/super-admin" "Blanco"
    }
    
    "detener" {
        Detener-Servicios
    }
    
    "estado" {
        Mostrar-Estado
    }
    
    default {
        Escribir-Mensaje "❌ Acción desconocida: $Accion" "Error"
        Escribir-Mensaje "Usa -Ayuda para ver las opciones disponibles" "Advertencia"
        exit 1
    }
}

Escribir-Mensaje ""
Escribir-Mensaje "✅ Script completado" "Exito"
