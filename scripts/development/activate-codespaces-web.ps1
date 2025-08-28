# Script para activar Codespaces desde web
# Ejecutar: .\activate-codespaces-web.ps1

Write-Host "🚀 Activando GitHub Codespaces desde web..." -ForegroundColor Green

# Verificar si estamos en un repositorio Git
function Test-GitRepository {
    try {
        $null = git rev-parse --git-dir 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Obtener información del repositorio
function Get-RepositoryInfo {
    $remoteUrl = git remote get-url origin 2>$null
    if ($remoteUrl) {
        if ($remoteUrl -match "github\.com[:/]([^/]+)/([^/]+)\.git") {
            return @{
                User = $matches[1]
                Repo = $matches[2]
                Url = "https://github.com/$($matches[1])/$($matches[2])"
            }
        }
    }
    return $null
}

# Función principal
function Main {
    Write-Host "🔍 Verificando repositorio..." -ForegroundColor Blue
    
    if (-not (Test-GitRepository)) {
        Write-Host "❌ No estás en un repositorio Git" -ForegroundColor Red
        return
    }
    
    $repoInfo = Get-RepositoryInfo
    if (-not $repoInfo) {
        Write-Host "❌ No se pudo obtener información del repositorio" -ForegroundColor Red
        return
    }
    
    Write-Host "✅ Repositorio: $($repoInfo.User)/$($repoInfo.Repo)" -ForegroundColor Green
    
    # Abrir GitHub en el navegador
    $codespaceUrl = "$($repoInfo.Url)/codespaces"
    Write-Host "🌐 Abriendo GitHub Codespaces en el navegador..." -ForegroundColor Yellow
    Start-Process $codespaceUrl
    
    Write-Host "`n📋 Pasos para crear Codespace:" -ForegroundColor Cyan
    Write-Host "1. En GitHub, click en 'Create codespace on main'" -ForegroundColor White
    Write-Host "2. Espera a que se configure el entorno" -ForegroundColor White
    Write-Host "3. Se abrirá VS Code en el navegador" -ForegroundColor White
    Write-Host "4. Para abrir en Cursor, click en 'Open in VS Code Desktop'" -ForegroundColor White
    
    Write-Host "`n💡 Alternativa desde Cursor:" -ForegroundColor Yellow
    Write-Host "1. Instalar extensión: GitHub Codespaces" -ForegroundColor White
    Write-Host "2. Ctrl+Shift+P → 'Codespaces: Create New Codespace'" -ForegroundColor White
    Write-Host "3. Seleccionar tu repositorio" -ForegroundColor White
}

# Ejecutar script
Main

