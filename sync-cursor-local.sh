#!/bin/bash
# Script de sincronización automática Cursor Web <-> Local (versión Linux/Mac)
# Este script mantiene sincronizados los cambios entre Cursor Web y tu entorno local

# Valores por defecto
REMOTE_URL="${1:-https://github.com/tu-usuario/tu-repo.git}"
LOCAL_PATH="${2:-/ruta/a/tu/proyecto/local}"
BRANCH="${3:-main}"
INTERVAL_SECONDS="${4:-30}"
WATCH_MODE="${5:-true}"
DEBUG="${6:-false}"

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con color
write_message() {
    local message="$1"
    local type="${2:-Info}"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local prefix="[$timestamp]"
    
    case "$type" in
        "Success") echo -e "${GREEN}${prefix} ${message}${NC}" ;;
        "Error") echo -e "${RED}${prefix} ${message}${NC}" ;;
        "Warning") echo -e "${YELLOW}${prefix} ${message}${NC}" ;;
        "Info") echo -e "${CYAN}${prefix} ${message}${NC}" ;;
        "Debug") 
            if [ "$DEBUG" = "true" ]; then
                echo -e "${GRAY}${prefix} [DEBUG] ${message}${NC}"
            fi
            ;;
    esac
}

# Verificar si Git está instalado
check_git_installed() {
    if ! command -v git &> /dev/null; then
        write_message "Git no está instalado. Por favor, instálalo primero." "Error"
        return 1
    fi
    return 0
}

# Inicializar repositorio local si no existe
initialize_local_repo() {
    local path="$1"
    
    if [ ! -d "$path" ]; then
        write_message "Creando directorio local: $path" "Info"
        mkdir -p "$path"
    fi
    
    cd "$path" || exit 1
    
    if [ ! -d ".git" ]; then
        write_message "Inicializando repositorio Git..." "Info"
        git init
        git remote add origin "$REMOTE_URL"
        git fetch origin
        git checkout -b "$BRANCH" "origin/$BRANCH"
    fi
    
    cd - > /dev/null || exit 1
}

# Detectar cambios locales
get_local_changes() {
    local path="$1"
    cd "$path" || exit 1
    
    local status=$(git status --porcelain)
    
    cd - > /dev/null || exit 1
    
    [ -n "$status" ]
}

# Sincronizar desde remoto (Cursor Web -> Local)
sync_from_remote() {
    local path="$1"
    
    write_message "Verificando cambios remotos..." "Info"
    
    cd "$path" || exit 1
    
    # Guardar cambios locales si existen
    if get_local_changes "$path"; then
        write_message "Guardando cambios locales temporalmente..." "Warning"
        git stash push -m "Auto-stash antes de pull $(date '+%Y-%m-%d_%H-%M-%S')"
        local stashed=true
    else
        local stashed=false
    fi
    
    # Obtener cambios remotos
    git fetch origin "$BRANCH"
    
    # Verificar si hay cambios
    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse "origin/$BRANCH")
    
    if [ "$local_commit" != "$remote_commit" ]; then
        write_message "Descargando cambios desde Cursor Web..." "Info"
        
        # Pull con rebase para mantener historial limpio
        if git pull origin "$BRANCH" --rebase; then
            write_message "Cambios sincronizados exitosamente desde Cursor Web" "Success"
            
            # Restaurar cambios locales si existían
            if [ "$stashed" = "true" ]; then
                write_message "Restaurando cambios locales..." "Info"
                if git stash pop; then
                    write_message "Cambios locales restaurados" "Success"
                else
                    write_message "Conflicto al restaurar cambios locales. Revisa 'git stash list'" "Warning"
                fi
            fi
            
            cd - > /dev/null || exit 1
            return 0
        else
            write_message "Error al sincronizar desde remoto" "Error"
            cd - > /dev/null || exit 1
            return 1
        fi
    else
        write_message "No hay cambios nuevos en Cursor Web" "Debug"
        cd - > /dev/null || exit 1
        return 1
    fi
}

# Sincronizar hacia remoto (Local -> Cursor Web)
sync_to_remote() {
    local path="$1"
    
    cd "$path" || exit 1
    
    if get_local_changes "$path"; then
        write_message "Detectados cambios locales para enviar a Cursor Web..." "Info"
        
        # Agregar todos los cambios
        git add -A
        
        # Crear commit con mensaje descriptivo
        local commit_message="Auto-sync desde local: $(date '+%Y-%m-%d %H:%M:%S')"
        git commit -m "$commit_message"
        
        # Push a remoto
        write_message "Enviando cambios a Cursor Web..." "Info"
        if git push origin "$BRANCH"; then
            write_message "Cambios locales sincronizados a Cursor Web" "Success"
            cd - > /dev/null || exit 1
            return 0
        else
            write_message "Error al sincronizar hacia remoto" "Error"
            cd - > /dev/null || exit 1
            return 1
        fi
    else
        write_message "No hay cambios locales para sincronizar" "Debug"
        cd - > /dev/null || exit 1
        return 1
    fi
}

# Crear archivo .gitignore optimizado
create_gitignore() {
    local path="$1"
    local gitignore_path="$path/.gitignore"
    
    if [ ! -f "$gitignore_path" ]; then
        write_message "Creando .gitignore optimizado..." "Info"
        
        cat > "$gitignore_path" << 'EOF'
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
EOF
        
        write_message ".gitignore creado exitosamente" "Success"
    fi
}

# Configurar hooks de Git
setup_git_hooks() {
    local path="$1"
    local hooks_path="$path/.git/hooks"
    
    mkdir -p "$hooks_path"
    
    # Pre-commit hook para validar archivos
    local pre_commit_path="$hooks_path/pre-commit"
    
    if [ ! -f "$pre_commit_path" ]; then
        cat > "$pre_commit_path" << 'EOF'
#!/bin/sh
# Hook para validar archivos antes de commit

# Verificar archivos muy grandes
for file in $(git diff --cached --name-only); do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        if [ $size -gt 104857600 ]; then # 100MB
            echo "Error: $file es muy grande ($size bytes). Máximo permitido: 100MB"
            exit 1
        fi
    fi
done

# Verificar archivos sensibles
for pattern in "*.env" "*.pem" "*.key" "*.p12"; do
    if git diff --cached --name-only | grep -q "$pattern"; then
        echo "Advertencia: Intentando hacer commit de archivos sensibles ($pattern)"
        echo "¿Estás seguro? (y/n)"
        read answer
        if [ "$answer" != "y" ]; then
            exit 1
        fi
    fi
done

exit 0
EOF
        
        chmod +x "$pre_commit_path"
        write_message "Git hooks configurados" "Debug"
    fi
}

# Función de notificación para Linux/Mac
send_notification() {
    local title="$1"
    local message="$2"
    
    if command -v notify-send &> /dev/null; then
        # Linux con notify-send
        notify-send "$title" "$message"
    elif command -v osascript &> /dev/null; then
        # macOS
        osascript -e "display notification \"$message\" with title \"$title\""
    fi
}

# Función principal de sincronización
start_sync() {
    write_message "=== INICIANDO SINCRONIZACIÓN CURSOR WEB <-> LOCAL ===" "Info"
    write_message "Repositorio: $REMOTE_URL" "Info"
    write_message "Ruta local: $LOCAL_PATH" "Info"
    write_message "Rama: $BRANCH" "Info"
    write_message "Intervalo: $INTERVAL_SECONDS segundos" "Info"
    write_message "Modo watch: $WATCH_MODE" "Info"
    
    # Verificar Git
    if ! check_git_installed; then
        return 1
    fi
    
    # Inicializar repositorio local
    initialize_local_repo "$LOCAL_PATH"
    
    # Crear .gitignore si no existe
    create_gitignore "$LOCAL_PATH"
    
    # Configurar Git hooks
    setup_git_hooks "$LOCAL_PATH"
    
    # Sincronización inicial
    write_message "" "Info"
    write_message "Realizando sincronización inicial..." "Info"
    sync_from_remote "$LOCAL_PATH"
    sync_to_remote "$LOCAL_PATH"
    
    if [ "$WATCH_MODE" != "true" ]; then
        write_message "" "Info"
        write_message "Sincronización completada (modo único)" "Success"
        return 0
    fi
    
    # Modo watch - monitoreo continuo
    write_message "" "Info"
    write_message "Modo watch activado - Monitoreando cambios..." "Info"
    write_message "Presiona Ctrl+C para detener" "Warning"
    
    local sync_count=0
    local last_sync=$(date +%s)
    
    trap 'write_message "\nSincronización detenida por el usuario" "Warning"; exit 0' INT
    
    while true; do
        sleep "$INTERVAL_SECONDS"
        
        ((sync_count++))
        
        write_message "" "Debug"
        write_message "--- Ciclo de sincronización #$sync_count ---" "Debug"
        
        # Sincronizar desde remoto primero (prioridad a Cursor Web)
        local remote_updated=false
        if sync_from_remote "$LOCAL_PATH"; then
            remote_updated=true
        fi
        
        # Luego sincronizar cambios locales
        local local_updated=false
        if sync_to_remote "$LOCAL_PATH"; then
            local_updated=true
        fi
        
        if [ "$remote_updated" = "true" ] || [ "$local_updated" = "true" ]; then
            last_sync=$(date +%s)
            
            # Notificación si hay cambios
            if [ "$remote_updated" = "true" ]; then
                send_notification "Sincronización Cursor" "Nuevos cambios descargados desde Cursor Web"
            fi
        fi
        
        # Mostrar estadísticas cada 10 ciclos
        if [ $((sync_count % 10)) -eq 0 ]; then
            local current_time=$(date +%s)
            local uptime=$((current_time - last_sync))
            local uptime_minutes=$((uptime / 60))
            
            write_message "" "Info"
            write_message "Estadísticas:" "Info"
            write_message "  - Ciclos completados: $sync_count" "Info"
            write_message "  - Última sincronización: $(date -d @$last_sync '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -r $last_sync '+%Y-%m-%d %H:%M:%S')" "Info"
            write_message "  - Tiempo sin cambios: $uptime_minutes minutos" "Info"
        fi
    done
}

# Función para mostrar ayuda
show_help() {
    cat << EOF
SINCRONIZACIÓN AUTOMÁTICA CURSOR WEB <-> LOCAL

USO:
    $0 [REMOTE_URL] [LOCAL_PATH] [BRANCH] [INTERVAL_SECONDS] [WATCH_MODE] [DEBUG]

PARÁMETROS:
    REMOTE_URL        URL del repositorio Git (default: configurado en script)
    LOCAL_PATH        Ruta local del proyecto (default: configurado en script)
    BRANCH            Rama a sincronizar (default: main)
    INTERVAL_SECONDS  Intervalo entre sincronizaciones (default: 30)
    WATCH_MODE        Activar monitoreo continuo (true/false, default: true)
    DEBUG             Mostrar mensajes de depuración (true/false, default: false)

EJEMPLOS:
    # Sincronización única
    $0 https://github.com/user/repo.git /home/user/proyecto main 30 false

    # Monitoreo continuo cada minuto con debug
    $0 https://github.com/user/repo.git /home/user/proyecto main 60 true true

CARACTERÍSTICAS:
    - Sincronización bidireccional automática
    - Detección inteligente de cambios
    - Manejo de conflictos con stash
    - Filtrado de archivos sensibles
    - Notificaciones del sistema
    - Hooks de Git para validación

EOF
}

# Verificar si se solicita ayuda
if [ "$1" = "-h" ] || [ "$1" = "--help" ] || [ "$1" = "help" ]; then
    show_help
    exit 0
fi

# Ejecutar sincronización
start_sync