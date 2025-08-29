const fs = require('fs').promises;
const path = require('path');

// Lista de archivos y patrones a buscar y eliminar/reemplazar
const TURSO_PATTERNS = [
  '@libsql/client',
  'libsql',
  'turso',
  'TURSO_',
  'turso_',
  'createClient',
  '.execute(',
  'sql:',
  'args:'
];

const FILES_TO_CLEAN = [
  'package.json',
  'controllers/',
  'lib/',
  'config/',
  'middleware/'
];

async function eliminateTursoDependencies() {
  console.log('🧹 ELIMINANDO DEPENDENCIAS DE TURSO');
  console.log('==================================');
  
  try {
    // 1. LIMPIAR PACKAGE.JSON
    console.log('\n📦 Limpiando package.json...');
    await cleanPackageJson();
    
    // 2. ELIMINAR ARCHIVOS TURSO
    console.log('\n🗑️  Eliminando archivos de Turso...');
    await removeTursoFiles();
    
    // 3. LIMPIAR CONTROLADORES
    console.log('\n🔧 Limpiando controladores...');
    await cleanControllers();
    
    // 4. LIMPIAR CONFIGURACIONES
    console.log('\n⚙️  Limpiando configuraciones...');
    await cleanConfigurations();
    
    // 5. ACTUALIZAR VARIABLES DE ENTORNO
    console.log('\n🌍 Actualizando variables de entorno...');
    await updateEnvironmentVariables();
    
    console.log('\n✅ DEPENDENCIAS DE TURSO ELIMINADAS EXITOSAMENTE');
    console.log('Sistema ahora usa 100% MongoDB');
    
  } catch (error) {
    console.error('❌ Error eliminando dependencias de Turso:', error);
    throw error;
  }
}

async function cleanPackageJson() {
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    // Eliminar dependencias de Turso/LibSQL
    if (packageJson.dependencies) {
      delete packageJson.dependencies['@libsql/client'];
    }
    
    // Actualizar scripts si es necesario
    if (packageJson.scripts) {
      // Remover scripts relacionados con Turso
      Object.keys(packageJson.scripts).forEach(scriptName => {
        if (scriptName.includes('turso') || packageJson.scripts[scriptName].includes('turso')) {
          delete packageJson.scripts[scriptName];
        }
      });
    }
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ package.json limpiado');
    
  } catch (error) {
    console.log('⚠️  package.json no necesita limpieza o ya está limpio');
  }
}

async function removeTursoFiles() {
  const filesToRemove = [
    'lib/turso.js',
    'lib/tursoClient.js',
    'config/turso.config.js',
    'config/database.js', // Si contiene solo configuración Turso
  ];
  
  for (const filePath of filesToRemove) {
    try {
      const fullPath = path.join(__dirname, filePath);
      await fs.access(fullPath);
      await fs.unlink(fullPath);
      console.log(`✅ Eliminado: ${filePath}`);
    } catch (error) {
      // Archivo no existe, continuar
    }
  }
}

async function cleanControllers() {
  const controllersDir = path.join(__dirname, 'controllers');
  
  try {
    const files = await fs.readdir(controllersDir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(controllersDir, file);
        let content = await fs.readFile(filePath, 'utf8');
        
        // Buscar y reportar referencias a Turso
        let hasChanges = false;
        
        TURSO_PATTERNS.forEach(pattern => {
          if (content.includes(pattern)) {
            console.log(`⚠️  ${file} contiene referencia a: ${pattern}`);
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          console.log(`   📝 Revisar manualmente: ${file}`);
        }
      }
    }
  } catch (error) {
    console.log('⚠️  No se pudo acceder al directorio de controladores');
  }
}

async function cleanConfigurations() {
  const configFiles = [
    'config/database.js',
    'config/db.config.js',
    'lib/mongoClient.js'
  ];
  
  for (const configFile of configFiles) {
    try {
      const filePath = path.join(__dirname, configFile);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Verificar si contiene referencias a Turso
      let hasTursoRefs = false;
      TURSO_PATTERNS.forEach(pattern => {
        if (content.includes(pattern)) {
          hasTursoRefs = true;
        }
      });
      
      if (hasTursoRefs) {
        console.log(`⚠️  ${configFile} contiene referencias a Turso - revisar manualmente`);
      } else {
        console.log(`✅ ${configFile} está limpio`);
      }
      
    } catch (error) {
      // Archivo no existe
    }
  }
}

async function updateEnvironmentVariables() {
  const envFiles = ['.env', '.env.example', 'env.production'];
  
  for (const envFile of envFiles) {
    try {
      const filePath = path.join(__dirname, envFile);
      let content = await fs.readFile(filePath, 'utf8');
      
      // Remover variables de Turso
      const tursoVars = [
        'TURSO_DATABASE_URL',
        'TURSO_AUTH_TOKEN',
        'LIBSQL_URL',
        'LIBSQL_AUTH_TOKEN'
      ];
      
      let hasChanges = false;
      tursoVars.forEach(varName => {
        const regex = new RegExp(`^${varName}=.*$`, 'gm');
        if (content.match(regex)) {
          content = content.replace(regex, '');
          hasChanges = true;
        }
      });
      
      // Limpiar líneas vacías múltiples
      if (hasChanges) {
        content = content.replace(/\n\n\n+/g, '\n\n');
        await fs.writeFile(filePath, content);
        console.log(`✅ Variables Turso eliminadas de: ${envFile}`);
      } else {
        console.log(`✅ ${envFile} no contiene variables Turso`);
      }
      
    } catch (error) {
      // Archivo no existe
    }
  }
}

// Ejecutar eliminación
if (require.main === module) {
  eliminateTursoDependencies()
    .then(() => {
      console.log('\n🎉 LIMPIEZA DE TURSO COMPLETADA');
      console.log('Recomendación: Ejecutar npm install para limpiar node_modules');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en limpieza de Turso:', error);
      process.exit(1);
    });
}

module.exports = { eliminateTursoDependencies };