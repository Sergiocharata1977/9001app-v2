# Script para activar GitHub Codespaces desde Cursor
# Ejecutar: .\activate-codespaces.ps1

Write-Host "🚀 Activando GitHub Codespaces para desarrollo directo..." -ForegroundColor Green

# Verificar si GitHub CLI está instalado
function Test-GitHubCLI {
    try {
        $null = Get-Command gh -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

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
        # Extraer usuario y repositorio de la URL
        if ($remoteUrl -match "github\.com[:/]([^/]+)/([^/]+)\.git") {
            return @{
                User = $matches[1]
                Repo = $matches[2]
            }
        }
    }
    return $null
}

# Función principal
function Main {
    Write-Host "🔍 Verificando configuración..." -ForegroundColor Blue
    
    # Verificar GitHub CLI
    if (-not (Test-GitHubCLI)) {
        Write-Host "❌ GitHub CLI no está instalado" -ForegroundColor Red
        Write-Host "💡 Instala GitHub CLI desde: https://cli.github.com/" -ForegroundColor Yellow
        return
    }
    
    Write-Host "✅ GitHub CLI encontrado" -ForegroundColor Green
    
    # Verificar repositorio Git
    if (-not (Test-GitRepository)) {
        Write-Host "❌ No estás en un repositorio Git" -ForegroundColor Red
        Write-Host "💡 Navega a tu repositorio del proyecto" -ForegroundColor Yellow
        return
    }
    
    Write-Host "✅ Repositorio Git encontrado" -ForegroundColor Green
    
    # Obtener información del repositorio
    $repoInfo = Get-RepositoryInfo
    if (-not $repoInfo) {
        Write-Host "❌ No se pudo obtener información del repositorio" -ForegroundColor Red
        return
    }
    
    Write-Host "📦 Repositorio: $($repoInfo.User)/$($repoInfo.Repo)" -ForegroundColor Cyan
    
    # Verificar autenticación de GitHub
    try {
        $authStatus = gh auth status 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ No estás autenticado en GitHub" -ForegroundColor Red
            Write-Host "🔐 Ejecutando autenticación..." -ForegroundColor Yellow
            gh auth login
        } else {
            Write-Host "✅ Autenticado en GitHub" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "❌ Error verificando autenticación" -ForegroundColor Red
        return
    }
    
    # Crear codespace
    Write-Host "`n🚀 Creando codespace..." -ForegroundColor Cyan
    
    try {
        $codespace = gh codespace create --repo "$($repoInfo.User)/$($repoInfo.Repo)" --branch main
        Write-Host "✅ Codespace creado: $codespace" -ForegroundColor Green
        
        # Abrir codespace en Cursor/VS Code
        Write-Host "🔗 Abriendo codespace en Cursor..." -ForegroundColor Yellow
        gh codespace code --codespace $codespace
        
        Write-Host "`n🎉 ¡Codespace activado exitosamente!" -ForegroundColor Green
        Write-Host "💡 Ahora puedes desarrollar directamente en el servidor" -ForegroundColor Blue
        Write-Host "📊 Acceso: https://github.com/codespaces" -ForegroundColor Blue
        
    }
    catch {
        Write-Host "❌ Error creando codespace: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Intenta crear el codespace manualmente desde GitHub" -ForegroundColor Yellow
    }
}

# Ejecutar script
Main
