# Script para aplicar todos los cambios de los agentes Cursor
Write-Host "🚀 Aplicando cambios de todos los agentes..." -ForegroundColor Green

# Lista de branches de agentes que terminaron
$agentBranches = @(
    "origin/cursor/fix-backend-typescript-configuration-4860",
    "origin/cursor/fix-incompatible-types-and-undefined-values-30a2",
    "origin/cursor/fix-incompatible-types-and-undefined-values-d2f5",
    "origin/cursor/fix-specific-frontend-components-7c2d",
    "origin/cursor/fix-specific-frontend-components-9cfe",
    "origin/cursor/fix-specific-frontend-components-fc23",
    "origin/cursor/fixing-filter-types-and-missing-properties-5398",
    "origin/cursor/fixing-filter-types-and-missing-properties-9a9e",
    "origin/cursor/fixing-filter-types-and-missing-properties-ee8c",
    "origin/cursor/install-frontend-typescript-dependencies-7c83",
    "origin/cursor/install-frontend-typescript-dependencies-f3e7",
    "origin/cursor/limpiar-imports-y-variables-no-utilizadas-7bde",
    "origin/cursor/limpiar-imports-y-variables-no-utilizadas-a45d",
    "origin/cursor/limpiar-imports-y-variables-no-utilizadas-e526",
    "origin/cursor/migrate-and-fix-service-and-api-types-7c32",
    "origin/cursor/migrate-and-fix-service-and-api-types-7dd1",
    "origin/cursor/migrate-and-fix-service-and-api-types-9929",
    "origin/cursor/tipar-componentes-de-interfaz-de-usuario-8c30",
    "origin/cursor/tipar-componentes-de-interfaz-de-usuario-b941",
    "origin/cursor/tipar-componentes-de-interfaz-de-usuario-bf63"
)

# Crear backup del estado actual
Write-Host "📦 Creando backup del estado actual..." -ForegroundColor Yellow
git stash push -m "backup-before-applying-agents"

# Aplicar cambios de cada agente
foreach ($branch in $agentBranches) {
    try {
        Write-Host "🔄 Aplicando cambios de: $branch" -ForegroundColor Cyan
        
        # Crear branch local temporal
        $localBranch = $branch.Replace("origin/", "")
        git checkout -b "temp-$localBranch" $branch
        
        # Hacer merge con main
        git checkout main
        git merge "temp-$localBranch" --no-edit
        
        # Limpiar branch temporal
        git branch -D "temp-$localBranch"
        
        Write-Host "✅ Aplicado: $branch" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error aplicando $branch : $_" -ForegroundColor Red
        continue
    }
}

Write-Host "🎉 ¡Todos los cambios aplicados!" -ForegroundColor Green
Write-Host "📊 Verificando estado final..." -ForegroundColor Yellow

# Verificar estado final
git status
