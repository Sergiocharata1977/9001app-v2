# Script de control continuo para SGC
param([int]$Intervalo = 300)

function Escribir-Mensaje {
    param([string]$Mensaje, [string]$Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Mensaje" -ForegroundColor $Color
}

function Verificar-Sistema {
    Escribir-Mensaje "Verificando sistema..." "Cyan"
    
    # Backend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5
        Escribir-Mensaje "Backend: OK" "Green"
    } catch {
        Escribir-Mensaje "Backend: ERROR" "Red"
    }
    
    # Frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
        Escribir-Mensaje "Frontend: OK" "Green"
    } catch {
        Escribir-Mensaje "Frontend: ERROR" "Red"
    }
}

function Actualizar-Agentes {
    Escribir-Mensaje "Actualizando agentes..." "Yellow"
    if (Test-Path "scripts/agent-monitor.js") {
        node scripts/agent-monitor.js --update-only
        Escribir-Mensaje "Agentes actualizados" "Green"
    }
}

# Monitoreo continuo
Escribir-Mensaje "Control continuo iniciado - Intervalo: $Intervalo segundos" "Cyan"

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Escribir-Mensaje "=== Verificacion: $timestamp ===" "Cyan"
    
    Verificar-Sistema
    Actualizar-Agentes
    
    Escribir-Mensaje "Esperando $Intervalo segundos..." "Yellow"
    Start-Sleep -Seconds $Intervalo
}
