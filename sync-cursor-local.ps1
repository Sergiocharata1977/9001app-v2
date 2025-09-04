# Script de sincronización automática Cursor Web <-> Local
# Este script mantiene sincronizados los cambios entre Cursor Web y tu entorno local

param(
    [string]$RemoteUrl = "https://github.com/tu-usuario/tu-repo.git",
    [string]$LocalPath = "C:\ruta\a\tu\proyecto\local",
    [string]$Branch = "main",
    [int]$IntervalSeconds = 30,
    [switch]$WatchMode = $true,
    [switch]$Debug = $false
)

# Configuración de colores para mensajes
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $prefix = "[$timestamp]"
    
    switch($Type) {
        "Success" { Write-Host "$prefix $Message" -ForegroundColor Green }
        "Error" { Write-Host "$prefix $Message" -ForegroundColor Red }
        "Warning" { Write-Host "$prefix $Message" -ForegroundColor Yellow }
        "Info" { Write-Host "$prefix $Message" -ForegroundColor Cyan }
        "Debug" { if($Debug) { Write-Host "$prefix [DEBUG] $Message" -ForegroundColor Gray } }
    }
}

# Función para verificar si Git está instalado
function Test-GitInstalled {
    try {
        $null = git --version
        return $true
    } catch {
        Write-ColorMessage "Git no está instalado. Por favor, instálalo primero." "Error"
        return $false
    }
}

# Función para inicializar el repositorio local si no existe
function Initialize-LocalRepo {
    param([string]$Path)
    
    if (!(Test-Path $Path)) {
        Write-ColorMessage "Creando directorio local: $Path" "Info"
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
    
    Push-Location $Path
    
    if (!(Test-Path ".git")) {
        Write-ColorMessage "Inicializando repositorio Git..." "Info"
        git init
        git remote add origin $RemoteUrl
        git fetch origin
        git checkout -b $Branch origin/$Branch
    }
    
    Pop-Location
}

# Función para detectar cambios locales
function Get-LocalChanges {
    param([string]$Path)
    
    Push-Location $Path
    
    $status = git status --porcelain
    $hasChanges = $null -ne $status -and $status.Count -gt 0
    
    Pop-Location
    
    return $hasChanges
}

# Función para sincronizar cambios desde remoto (Cursor Web -> Local)
function Sync-FromRemote {
    param([string]$Path)
    
    Write-ColorMessage "Verificando cambios remotos..." "Info"
    
    Push-Location $Path
    
    try {
        # Guardar cambios locales si existen
        $localChanges = Get-LocalChanges -Path $Path
        if ($localChanges) {
            Write-ColorMessage "Guardando cambios locales temporalmente..." "Warning"
            git stash push -m "Auto-stash antes de pull $(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
        }
        
        # Obtener cambios remotos
        git fetch origin $Branch
        
        # Verificar si hay cambios
        $localCommit = git rev-parse HEAD
        $remoteCommit = git rev-parse origin/$Branch
        
        if ($localCommit -ne $remoteCommit) {
            Write-ColorMessage "Descargando cambios desde Cursor Web..." "Info"
            
            # Pull con rebase para mantener historial limpio
            git pull origin $Branch --rebase
            
            Write-ColorMessage "Cambios sincronizados exitosamente desde Cursor Web" "Success"
            
            # Restaurar cambios locales si existían
            if ($localChanges) {
                Write-ColorMessage "Restaurando cambios locales..." "Info"
                try {
                    git stash pop
                    Write-ColorMessage "Cambios locales restaurados" "Success"
                } catch {
                    Write-ColorMessage "Conflicto al restaurar cambios locales. Revisa 'git stash list'" "Warning"
                }
            }
            
            return $true
        } else {
            Write-ColorMessage "No hay cambios nuevos en Cursor Web" "Debug"
            return $false
        }
        
    } catch {
        Write-ColorMessage "Error al sincronizar desde remoto: $_" "Error"
        return $false
    } finally {
        Pop-Location
    }
}

# Función para sincronizar cambios hacia remoto (Local -> Cursor Web)
function Sync-ToRemote {
    param([string]$Path)
    
    Push-Location $Path
    
    try {
        $hasChanges = Get-LocalChanges -Path $Path
        
        if ($hasChanges) {
            Write-ColorMessage "Detectados cambios locales para enviar a Cursor Web..." "Info"
            
            # Agregar todos los cambios
            git add -A
            
            # Crear commit con mensaje descriptivo
            $commitMessage = "Auto-sync desde local: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git commit -m $commitMessage
            
            # Push a remoto
            Write-ColorMessage "Enviando cambios a Cursor Web..." "Info"
            git push origin $Branch
            
            Write-ColorMessage "Cambios locales sincronizados a Cursor Web" "Success"
            return $true
        } else {
            Write-ColorMessage "No hay cambios locales para sincronizar" "Debug"
            return $false
        }
        
    } catch {
        Write-ColorMessage "Error al sincronizar hacia remoto: $_" "Error"
        return $false
    } finally {
        Pop-Location
    }
}

# Función para crear archivo .gitignore optimizado
function Create-GitIgnore {
    param([string]$Path)
    
    $gitignorePath = Join-Path $Path ".gitignore"
    
    if (!(Test-Path $gitignorePath)) {
        Write-ColorMessage "Creando .gitignore optimizado..." "Info"
        
        $gitignoreContent = @"
# Dependencias
node_modules/
bower_components/
jspm_packages/
vendor/

# Archivos de compilación
dist/
build/
out/
.next/
.nuxt/
.cache/

# Logs y temporales
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
.pnpm-store/
temp/
tmp/

# Entorno y configuración local
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# Base de datos local
*.sqlite
*.sqlite3
*.db
/mongodb-data/
/data/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

# Archivos de respaldo
*.bak
*.backup
*.old
backup/

# Archivos grandes que no deben sincronizarse
*.zip
*.tar.gz
*.rar
*.7z
*.dmg
*.iso
*.jar
*.war

# Certificados y claves
*.pem
*.key
*.crt
*.p12
*.pfx

# Uploads locales (mantener estructura pero no contenido)
uploads/*
!uploads/.gitkeep
public/uploads/*
!public/uploads/.gitkeep
"@
        
        Set-Content -Path $gitignorePath -Value $gitignoreContent
        Write-ColorMessage ".gitignore creado exitosamente" "Success"
    }
}

# Función para configurar hooks de Git
function Setup-GitHooks {
    param([string]$Path)
    
    $hooksPath = Join-Path $Path ".git/hooks"
    
    if (!(Test-Path $hooksPath)) {
        New-Item -ItemType Directory -Path $hooksPath -Force | Out-Null
    }
    
    # Pre-commit hook para validar archivos
    $preCommitPath = Join-Path $hooksPath "pre-commit"
    $preCommitContent = @"
#!/bin/sh
# Hook para validar archivos antes de commit

# Verificar archivos muy grandes
for file in \$(git diff --cached --name-only); do
    if [ -f "\$file" ]; then
        size=\$(stat -f%z "\$file" 2>/dev/null || stat -c%s "\$file" 2>/dev/null)
        if [ \$size -gt 104857600 ]; then # 100MB
            echo "Error: \$file es muy grande (\$size bytes). Máximo permitido: 100MB"
            exit 1
        fi
    fi
done

# Verificar archivos sensibles
for pattern in "*.env" "*.pem" "*.key" "*.p12"; do
    if git diff --cached --name-only | grep -q "\$pattern"; then
        echo "Advertencia: Intentando hacer commit de archivos sensibles (\$pattern)"
        echo "¿Estás seguro? (y/n)"
        read answer
        if [ "\$answer" != "y" ]; then
            exit 1
        fi
    fi
done

exit 0
"@
    
    if (!(Test-Path $preCommitPath)) {
        Set-Content -Path $preCommitPath -Value $preCommitContent
        Write-ColorMessage "Git hooks configurados" "Debug"
    }
}

# Función principal de sincronización
function Start-Sync {
    Write-ColorMessage "=== INICIANDO SINCRONIZACIÓN CURSOR WEB <-> LOCAL ===" "Info"
    Write-ColorMessage "Repositorio: $RemoteUrl" "Info"
    Write-ColorMessage "Ruta local: $LocalPath" "Info"
    Write-ColorMessage "Rama: $Branch" "Info"
    Write-ColorMessage "Intervalo: $IntervalSeconds segundos" "Info"
    Write-ColorMessage "Modo watch: $WatchMode" "Info"
    
    # Verificar Git
    if (!(Test-GitInstalled)) {
        return
    }
    
    # Inicializar repositorio local
    Initialize-LocalRepo -Path $LocalPath
    
    # Crear .gitignore si no existe
    Create-GitIgnore -Path $LocalPath
    
    # Configurar Git hooks
    Setup-GitHooks -Path $LocalPath
    
    # Sincronización inicial
    Write-ColorMessage "`nRealizando sincronización inicial..." "Info"
    $remoteUpdated = Sync-FromRemote -Path $LocalPath
    $localUpdated = Sync-ToRemote -Path $LocalPath
    
    if (!$WatchMode) {
        Write-ColorMessage "`nSincronización completada (modo único)" "Success"
        return
    }
    
    # Modo watch - monitoreo continuo
    Write-ColorMessage "`nModo watch activado - Monitoreando cambios..." "Info"
    Write-ColorMessage "Presiona Ctrl+C para detener" "Warning"
    
    $lastSync = Get-Date
    $syncCount = 0
    
    try {
        while ($true) {
            Start-Sleep -Seconds $IntervalSeconds
            
            $currentTime = Get-Date
            $syncCount++
            
            Write-ColorMessage "`n--- Ciclo de sincronización #$syncCount ---" "Debug"
            
            # Sincronizar desde remoto primero (prioridad a Cursor Web)
            $remoteUpdated = Sync-FromRemote -Path $LocalPath
            
            # Luego sincronizar cambios locales
            $localUpdated = Sync-ToRemote -Path $LocalPath
            
            if ($remoteUpdated -or $localUpdated) {
                $lastSync = $currentTime
                
                # Notificación de Windows si hay cambios
                if ($remoteUpdated) {
                    [System.Windows.Forms.MessageBox]::Show(
                        "Nuevos cambios descargados desde Cursor Web",
                        "Sincronización Cursor",
                        [System.Windows.Forms.MessageBoxButtons]::OK,
                        [System.Windows.Forms.MessageBoxIcon]::Information
                    ) | Out-Null
                }
            }
            
            # Mostrar estadísticas cada 10 ciclos
            if ($syncCount % 10 -eq 0) {
                $uptime = $currentTime - $lastSync
                Write-ColorMessage "`nEstadísticas:" "Info"
                Write-ColorMessage "  - Ciclos completados: $syncCount" "Info"
                Write-ColorMessage "  - Última sincronización: $($lastSync.ToString('yyyy-MM-dd HH:mm:ss'))" "Info"
                Write-ColorMessage "  - Tiempo sin cambios: $($uptime.TotalMinutes.ToString('N1')) minutos" "Info"
            }
        }
    } catch {
        Write-ColorMessage "`nSincronización detenida por el usuario" "Warning"
    }
}

# Función para mostrar ayuda
function Show-Help {
    Write-Host @"
SINCRONIZACIÓN AUTOMÁTICA CURSOR WEB <-> LOCAL

USO:
    .\sync-cursor-local.ps1 [-RemoteUrl <url>] [-LocalPath <path>] [-Branch <branch>] 
                            [-IntervalSeconds <seconds>] [-WatchMode] [-Debug]

PARÁMETROS:
    -RemoteUrl        URL del repositorio Git (default: configurado en script)
    -LocalPath        Ruta local del proyecto (default: configurado en script)
    -Branch           Rama a sincronizar (default: main)
    -IntervalSeconds  Intervalo entre sincronizaciones (default: 30)
    -WatchMode        Activar monitoreo continuo (default: true)
    -Debug            Mostrar mensajes de depuración

EJEMPLOS:
    # Sincronización única
    .\sync-cursor-local.ps1 -WatchMode:$false

    # Monitoreo continuo cada minuto
    .\sync-cursor-local.ps1 -IntervalSeconds 60

    # Con mensajes de debug
    .\sync-cursor-local.ps1 -Debug

CARACTERÍSTICAS:
    - Sincronización bidireccional automática
    - Detección inteligente de cambios
    - Manejo de conflictos con stash
    - Filtrado de archivos sensibles
    - Notificaciones de Windows
    - Hooks de Git para validación

"@ -ForegroundColor Cyan
}

# Verificar si se solicita ayuda
if ($PSBoundParameters.ContainsKey('Help') -or $args -contains '-h' -or $args -contains '--help') {
    Show-Help
    exit
}

# Cargar ensamblados necesarios para notificaciones
Add-Type -AssemblyName System.Windows.Forms

# Ejecutar sincronización
Start-Sync