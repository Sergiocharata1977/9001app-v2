# Script de configuración inicial para sincronización Cursor Web <-> Local
# Este script configura todo lo necesario para la sincronización automática

param(
    [string]$GitHubToken = "",
    [string]$RepositoryName = "9001app",
    [string]$GitHubUsername = "tu-usuario",
    [string]$LocalProjectPath = "C:\Proyectos\9001app"
)

Write-Host "=== CONFIGURACIÓN DE SINCRONIZACIÓN CURSOR WEB <-> LOCAL ===" -ForegroundColor Cyan
Write-Host ""

# Función para instalar Chocolatey si no está instalado
function Install-Chocolatey {
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "Instalando Chocolatey..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
}

# Función para instalar Git si no está instalado
function Install-Git {
    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "Git no está instalado. Instalando..." -ForegroundColor Yellow
        Install-Chocolatey
        choco install git -y
        refreshenv
    } else {
        Write-Host "Git ya está instalado ✓" -ForegroundColor Green
    }
}

# Función para instalar GitHub CLI si no está instalado
function Install-GitHubCLI {
    if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Host "GitHub CLI no está instalado. Instalando..." -ForegroundColor Yellow
        Install-Chocolatey
        choco install gh -y
        refreshenv
    } else {
        Write-Host "GitHub CLI ya está instalado ✓" -ForegroundColor Green
    }
}

# Función para configurar credenciales de Git
function Configure-GitCredentials {
    Write-Host "`nConfigurando credenciales de Git..." -ForegroundColor Yellow
    
    # Configurar nombre y email si no están configurados
    $gitName = git config --global user.name
    if (!$gitName) {
        $name = Read-Host "Ingresa tu nombre completo para Git"
        git config --global user.name "$name"
    }
    
    $gitEmail = git config --global user.email
    if (!$gitEmail) {
        $email = Read-Host "Ingresa tu email para Git"
        git config --global user.email "$email"
    }
    
    # Configurar credential helper para Windows
    git config --global credential.helper manager-core
    
    Write-Host "Credenciales de Git configuradas ✓" -ForegroundColor Green
}

# Función para crear repositorio en GitHub si no existe
function Create-GitHubRepository {
    param(
        [string]$RepoName,
        [string]$Username
    )
    
    Write-Host "`nVerificando repositorio en GitHub..." -ForegroundColor Yellow
    
    # Autenticar con GitHub CLI
    if ($GitHubToken) {
        Write-Host "Autenticando con token proporcionado..." -ForegroundColor Yellow
        $env:GH_TOKEN = $GitHubToken
    } else {
        Write-Host "Por favor, autentícate con GitHub:" -ForegroundColor Yellow
        gh auth login
    }
    
    # Verificar si el repositorio existe
    $repoExists = gh repo view "$Username/$RepoName" 2>$null
    
    if (!$repoExists) {
        Write-Host "Creando repositorio en GitHub..." -ForegroundColor Yellow
        gh repo create "$Username/$RepoName" --private --description "Sistema de Gestión ISO 9001"
        Write-Host "Repositorio creado exitosamente ✓" -ForegroundColor Green
    } else {
        Write-Host "El repositorio ya existe en GitHub ✓" -ForegroundColor Green
    }
    
    return "https://github.com/$Username/$RepoName.git"
}

# Función para configurar el proyecto local
function Setup-LocalProject {
    param(
        [string]$ProjectPath,
        [string]$RemoteUrl
    )
    
    Write-Host "`nConfigurando proyecto local..." -ForegroundColor Yellow
    
    # Crear directorio si no existe
    if (!(Test-Path $ProjectPath)) {
        Write-Host "Creando directorio del proyecto..." -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $ProjectPath -Force | Out-Null
    }
    
    Set-Location $ProjectPath
    
    # Inicializar Git si no está inicializado
    if (!(Test-Path ".git")) {
        Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
        git init
        git remote add origin $RemoteUrl
        
        # Crear archivo README inicial
        if (!(Test-Path "README.md")) {
            @"
# Sistema de Gestión ISO 9001

Este repositorio contiene el código del sistema de gestión de calidad ISO 9001.

## Sincronización Automática

Este proyecto está configurado con sincronización automática entre Cursor Web y el entorno local.

### Iniciar sincronización
``````powershell
.\sync-cursor-local.ps1
``````

### Configuración
- **Repositorio**: $RemoteUrl
- **Rama principal**: main
- **Intervalo de sincronización**: 30 segundos

## Estructura del Proyecto
- `/frontend` - Aplicación React con TypeScript
- `/backend` - API Node.js con Express y TypeScript
- `/docs` - Documentación del proyecto

"@ | Out-File -FilePath "README.md" -Encoding UTF8
        }
        
        git add .
        git commit -m "Configuración inicial del proyecto"
        git branch -M main
        git push -u origin main
    } else {
        Write-Host "El proyecto ya está inicializado con Git ✓" -ForegroundColor Green
    }
}

# Función para crear tarea programada de Windows
function Create-ScheduledTask {
    param(
        [string]$ProjectPath
    )
    
    Write-Host "`nConfigurando tarea programada para sincronización automática..." -ForegroundColor Yellow
    
    $taskName = "CursorWebSync_$RepositoryName"
    $syncScriptPath = Join-Path $ProjectPath "sync-cursor-local.ps1"
    
    # Verificar si la tarea ya existe
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    
    if ($existingTask) {
        Write-Host "La tarea programada ya existe. ¿Deseas actualizarla? (S/N)" -ForegroundColor Yellow
        $response = Read-Host
        if ($response -ne 'S' -and $response -ne 's') {
            return
        }
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }
    
    # Crear acción para la tarea
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
        -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$syncScriptPath`" -LocalPath `"$ProjectPath`""
    
    # Crear disparador para inicio de sesión
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    
    # Crear configuración
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RestartInterval (New-TimeSpan -Minutes 5) `
        -RestartCount 3
    
    # Registrar la tarea
    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Description "Sincronización automática entre Cursor Web y el proyecto local $RepositoryName" `
        -RunLevel Highest
    
    Write-Host "Tarea programada creada exitosamente ✓" -ForegroundColor Green
    Write-Host "La sincronización se iniciará automáticamente al iniciar sesión" -ForegroundColor Cyan
}

# Función para crear acceso directo en el escritorio
function Create-DesktopShortcut {
    param(
        [string]$ProjectPath
    )
    
    Write-Host "`nCreando acceso directo en el escritorio..." -ForegroundColor Yellow
    
    $desktopPath = [Environment]::GetFolderPath("Desktop")
    $shortcutPath = Join-Path $desktopPath "Sync Cursor Web - $RepositoryName.lnk"
    
    $WshShell = New-Object -ComObject WScript.Shell
    $shortcut = $WshShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$ProjectPath\sync-cursor-local.ps1`" -LocalPath `"$ProjectPath`""
    $shortcut.WorkingDirectory = $ProjectPath
    $shortcut.IconLocation = "shell32.dll,238"
    $shortcut.Description = "Iniciar sincronización Cursor Web <-> Local"
    $shortcut.Save()
    
    Write-Host "Acceso directo creado en el escritorio ✓" -ForegroundColor Green
}

# Función para copiar scripts de sincronización
function Copy-SyncScripts {
    param(
        [string]$ProjectPath
    )
    
    Write-Host "`nCopiando scripts de sincronización al proyecto..." -ForegroundColor Yellow
    
    # Copiar script de PowerShell
    $currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $psScriptSource = Join-Path $currentDir "sync-cursor-local.ps1"
    $psScriptDest = Join-Path $ProjectPath "sync-cursor-local.ps1"
    
    if (Test-Path $psScriptSource) {
        Copy-Item -Path $psScriptSource -Destination $psScriptDest -Force
        Write-Host "Script de PowerShell copiado ✓" -ForegroundColor Green
    }
    
    # Copiar script de Bash
    $shScriptSource = Join-Path $currentDir "sync-cursor-local.sh"
    $shScriptDest = Join-Path $ProjectPath "sync-cursor-local.sh"
    
    if (Test-Path $shScriptSource) {
        Copy-Item -Path $shScriptSource -Destination $shScriptDest -Force
        Write-Host "Script de Bash copiado ✓" -ForegroundColor Green
    }
    
    # Actualizar la URL del repositorio en el script
    if (Test-Path $psScriptDest) {
        $content = Get-Content $psScriptDest -Raw
        $content = $content -replace 'https://github.com/tu-usuario/tu-repo.git', "https://github.com/$GitHubUsername/$RepositoryName.git"
        $content = $content -replace 'C:\\ruta\\a\\tu\\proyecto\\local', $ProjectPath
        Set-Content -Path $psScriptDest -Value $content
    }
}

# Función principal
function Main {
    Write-Host "Este script configurará todo lo necesario para la sincronización automática" -ForegroundColor Cyan
    Write-Host "entre Cursor Web y tu entorno local." -ForegroundColor Cyan
    Write-Host ""
    
    # Paso 1: Instalar dependencias
    Write-Host "PASO 1: Instalando dependencias..." -ForegroundColor Yellow
    Install-Git
    Install-GitHubCLI
    
    # Paso 2: Configurar Git
    Write-Host "`nPASO 2: Configurando Git..." -ForegroundColor Yellow
    Configure-GitCredentials
    
    # Paso 3: Crear/verificar repositorio en GitHub
    Write-Host "`nPASO 3: Configurando repositorio en GitHub..." -ForegroundColor Yellow
    $remoteUrl = Create-GitHubRepository -RepoName $RepositoryName -Username $GitHubUsername
    
    # Paso 4: Configurar proyecto local
    Write-Host "`nPASO 4: Configurando proyecto local..." -ForegroundColor Yellow
    Setup-LocalProject -ProjectPath $LocalProjectPath -RemoteUrl $remoteUrl
    
    # Paso 5: Copiar scripts de sincronización
    Write-Host "`nPASO 5: Instalando scripts de sincronización..." -ForegroundColor Yellow
    Copy-SyncScripts -ProjectPath $LocalProjectPath
    
    # Paso 6: Crear tarea programada
    Write-Host "`nPASO 6: Configurando inicio automático..." -ForegroundColor Yellow
    Create-ScheduledTask -ProjectPath $LocalProjectPath
    
    # Paso 7: Crear acceso directo
    Write-Host "`nPASO 7: Creando acceso directo..." -ForegroundColor Yellow
    Create-DesktopShortcut -ProjectPath $LocalProjectPath
    
    # Resumen final
    Write-Host "`n=== CONFIGURACIÓN COMPLETADA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "✓ Git y GitHub CLI instalados" -ForegroundColor Green
    Write-Host "✓ Repositorio configurado: $remoteUrl" -ForegroundColor Green
    Write-Host "✓ Proyecto local en: $LocalProjectPath" -ForegroundColor Green
    Write-Host "✓ Scripts de sincronización instalados" -ForegroundColor Green
    Write-Host "✓ Tarea programada creada (inicio automático)" -ForegroundColor Green
    Write-Host "✓ Acceso directo en el escritorio" -ForegroundColor Green
    Write-Host ""
    Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Cyan
    Write-Host "1. Abre Cursor Web y clona el repositorio: $remoteUrl" -ForegroundColor White
    Write-Host "2. La sincronización se iniciará automáticamente al iniciar Windows" -ForegroundColor White
    Write-Host "3. También puedes iniciarla manualmente desde el acceso directo del escritorio" -ForegroundColor White
    Write-Host ""
    Write-Host "¿Deseas iniciar la sincronización ahora? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq 'S' -or $response -eq 's') {
        Write-Host "`nIniciando sincronización..." -ForegroundColor Cyan
        Set-Location $LocalProjectPath
        & ".\sync-cursor-local.ps1"
    }
}

# Ejecutar
try {
    Main
} catch {
    Write-Host "`nError durante la configuración: $_" -ForegroundColor Red
    Write-Host "Por favor, verifica los permisos y vuelve a intentar." -ForegroundColor Yellow
}