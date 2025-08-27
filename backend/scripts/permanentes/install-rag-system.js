const fs = require('fs');
const path = require('path');

/**
 * Script de instalación y configuración del Sistema RAG
 * Configura todo el sistema RAG con Turso desde cero
 */

console.log('🚀 Instalando Sistema RAG con Turso...');

// 1. Verificar que existan los archivos necesarios
const requiredFiles = [
  'backend/services/ragService.js',
  'backend/controllers/ragController.js',
  'backend/routes/rag.routes.js',
  'frontend/src/components/assistant/RAGChat.tsx',
  'backend/scripts/permanentes/create-rag-table-turso.sql'
];

console.log('📋 Verificando archivos necesarios...');
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Archivo faltante: ${file}`);
    process.exit(1);
  }
  console.log(`✅ ${file}`);
}

// 2. Crear archivo de configuración de variables de entorno
const envConfig = `
# Configuración para Sistema RAG con Turso
# Agregar estas variables a tu archivo .env

# Configuración de Turso
MONGODB_URI=mongodb://isoflow4-sergiocharata1977.turso.io
MONGODB_AUTH_TOKEN=tu_token_aqui

# Configuración adicional para RAG
RAG_MAX_RESULTS=10
RAG_CONTEXT_SIZE=5
RAG_CONFIDENCE_THRESHOLD=60
`;

const envPath = path.join(__dirname, '../../../.env.rag.example');
fs.writeFileSync(envPath, envConfig);
console.log('✅ Archivo de configuración .env.rag.example creado');

// 3. Crear script de integración de rutas
const routesIntegration = `
// Integración de rutas RAG en el servidor principal
// Agregar en el archivo principal de rutas (app.js o index.js)

const ragRoutes = require('./routes/rag.routes.js');

// Agregar las rutas RAG
app.use('/api/rag', ragRoutes);

console.log('✅ Rutas RAG integradas en /api/rag');
`;

const integrationPath = path.join(__dirname, '../../../routes-integration-rag.js');
fs.writeFileSync(integrationPath, routesIntegration);
console.log('✅ Archivo de integración de rutas creado');

// 4. Crear script de prueba del sistema
const testScript = `
// Script de prueba para el sistema RAG
const testRAGSystem = async () => {
  console.log('🧪 Probando sistema RAG con Turso...');
  
  const testQueries = [
    '¿Cuáles son los indicadores de calidad más importantes?',
    'Muéstrame los procesos del sistema de gestión de calidad',
    '¿Qué auditorías se han realizado recientemente?',
    'Cuáles son las acciones correctivas pendientes',
    '¿Qué capacitaciones están programadas?'
  ];
  
  for (const query of testQueries) {
    try {
      console.log(\`\\n📝 Probando: "\${query}"\`);
      
      const response = await fetch('http://localhost:3000/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${process.env.TEST_TOKEN || 'test'}\`
        },
        body: JSON.stringify({
          question: query,
          maxResults: 5,
          includeSources: true
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(\`✅ Respuesta: \${data.data.answer.substring(0, 100)}...\`);
        console.log(\`📊 Confianza: \${data.data.confidence}%\`);
        console.log(\`⏱️ Tiempo: \${data.data.processingTime}ms\`);
      } else {
        console.log(\`❌ Error: \${response.status}\`);
      }
    } catch (error) {
      console.log(\`❌ Error: \${error.message}\`);
    }
  }
  
  console.log('\\n🎉 Pruebas completadas');
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  testRAGSystem();
}

module.exports = { testRAGSystem };
`;

const testPath = path.join(__dirname, '../temporales/test-rag-system.js');
fs.writeFileSync(testPath, testScript);
console.log('✅ Script de prueba RAG creado');

// 5. Crear documentación completa
const documentation = `
# Sistema RAG con Turso - Guía de Instalación

## Descripción
Sistema de Retrieval Augmented Generation (RAG) que integra con la base de datos Turso para proporcionar respuestas inteligentes sobre el Sistema de Gestión de Calidad ISO 9001.

## Características
- ✅ Consulta RAG con búsqueda semántica
- ✅ Búsqueda avanzada con filtros
- ✅ Análisis de insights y tendencias
- ✅ Sugerencias de consultas relacionadas
- ✅ Estadísticas en tiempo real
- ✅ Integración completa con MongoDB Database

## Instalación Paso a Paso

### 1. Instalar Dependencias
\`\`\`bash
cd backend
npm install mongoose
\`\`\`

### 2. Configurar Variables de Entorno
Agregar al archivo .env del backend:
\`\`\`
MONGODB_URI=mongodb://isoflow4-sergiocharata1977.turso.io
MONGODB_AUTH_TOKEN=tu_token_aqui
\`\`\`

### 3. Crear Tabla RAG en Turso
\`\`\`bash
# Conectar a Turso y ejecutar el script de migración
npx turso db shell isoflow4 < backend/scripts/permanentes/create-rag-table-turso.sql
\`\`\`

### 4. Integrar Rutas en el Servidor
Agregar en el archivo principal del servidor (app.js o index.js):
\`\`\`javascript
const ragRoutes = require('./routes/rag.routes.js');
app.use('/api/rag', ragRoutes);
\`\`\`

### 5. Agregar Componente al Frontend
En tu aplicación React, importar y usar el componente:
\`\`\`tsx
import { RAGChat } from './components/assistant/RAGChat';

function App() {
  return (
    <div className="h-screen">
      <RAGChat />
    </div>
  );
}
\`\`\`

## Endpoints Disponibles

### POST /api/rag/query
Procesa una consulta RAG
\`\`\`json
{
  "question": "¿Cuáles son los indicadores de calidad más importantes?",
  "organizationId": "default",
  "maxResults": 10,
  "includeSources": true,
  "contextSize": 5
}
\`\`\`

### GET /api/rag/stats
Obtiene estadísticas del sistema RAG

### GET /api/rag/test-connection
Prueba la conectividad con Turso

### POST /api/rag/semantic-search
Búsqueda semántica avanzada
\`\`\`json
{
  "query": "auditorías recientes",
  "filters": { "tipo": "auditoria" },
  "limit": 20
}
\`\`\`

### GET /api/rag/insights
Genera insights y análisis de tendencias

### GET /api/rag/suggestions
Obtiene sugerencias de consultas relacionadas

### GET /api/rag/health
Verificación de salud del sistema RAG

## Uso del Componente Frontend

### Características del Chat
- Interfaz de chat intuitiva
- Estadísticas en tiempo real
- Sugerencias de consultas relacionadas
- Indicadores de confianza
- Fuentes consultadas
- Tiempo de procesamiento

### Ejemplos de Consultas
- "¿Cuáles son los indicadores de calidad más importantes?"
- "Muéstrame los hallazgos de auditoría recientes"
- "¿Qué procesos están documentados?"
- "¿Cómo se gestionan las no conformidades?"
- "¿Qué capacitaciones tiene el personal?"

## Tipos de Datos Soportados
- **normas**: Normas ISO y estándares
- **procesos**: Procesos del SGC
- **indicadores**: Indicadores de calidad
- **auditorias**: Auditorías internas y externas
- **hallazgos**: No conformidades y hallazgos
- **acciones**: Acciones correctivas y preventivas
- **documentos**: Documentación del SGC
- **personal**: Personal y responsabilidades
- **capacitaciones**: Programas de capacitación
- **minutas**: Minutas de reuniones

## Monitoreo y Mantenimiento

### Verificar Estado del Sistema
\`\`\`bash
curl -H "Authorization: Bearer \${token}" http://localhost:3000/api/rag/health
\`\`\`

### Estadísticas del Sistema
\`\`\`bash
curl -H "Authorization: Bearer \${token}" http://localhost:3000/api/rag/stats
\`\`\`

### Prueba de Conectividad
\`\`\`bash
curl -H "Authorization: Bearer \${token}" http://localhost:3000/api/rag/test-connection
\`\`\`

### Ejecutar Pruebas Automatizadas
\`\`\`bash
node backend/scripts/temporales/test-rag-system.js
\`\`\`

## Troubleshooting

### Error de Conexión con Turso
1. Verificar MONGODB_URI y MONGODB_AUTH_TOKEN
2. Comprobar conectividad de red
3. Verificar permisos de la base de datos
4. Ejecutar: \`npx turso db shell isoflow4\`

### Error de Autenticación
1. Verificar que el token esté en localStorage
2. Comprobar que el middleware de autenticación esté funcionando
3. Verificar que las rutas estén protegidas

### Baja Confianza en Respuestas
1. Revisar calidad de datos en Turso
2. Ajustar parámetros de búsqueda
3. Mejorar estructura de datos RAG
4. Agregar más datos de ejemplo

### Error en Frontend
1. Verificar que el componente esté importado correctamente
2. Comprobar que las rutas API estén disponibles
3. Verificar la configuración de CORS
4. Revisar la consola del navegador

## Estructura de Archivos
\`\`\`
backend/
├── services/
│   └── ragService.js          # Servicio principal RAG
├── controllers/
│   └── ragController.js       # Controlador HTTP
├── routes/
│   └── rag.routes.js          # Rutas API
└── scripts/
    └── permanentes/
        ├── create-rag-table-turso.sql  # Migración SQL
        └── install-rag-system.js       # Script de instalación

frontend/
└── src/
    └── components/
        └── assistant/
            └── RAGChat.tsx    # Componente de chat
\`\`\`

## Mejoras Futuras
- [ ] Vectorización de embeddings
- [ ] Cache inteligente de respuestas
- [ ] Análisis de sentimientos
- [ ] Integración con más modelos de IA
- [ ] Dashboard de analytics avanzado
- [ ] Exportación de consultas
- [ ] Historial de conversaciones
- [ ] Personalización por usuario

## Soporte
Para problemas o consultas:
1. Revisar la documentación
2. Verificar logs del servidor
3. Ejecutar pruebas de conectividad
4. Contactar al administrador del sistema

## Versión
Sistema RAG v1.0.0
Última actualización: ${new Date().toISOString()}
`;

const docsPath = path.join(__dirname, '../../../docs-esenciales/SISTEMA_RAG_INSTALACION.md');
fs.writeFileSync(docsPath, documentation);
console.log('✅ Documentación de instalación creada');

// 6. Crear script de verificación de instalación
const verificationScript = `
// Script de verificación de instalación del sistema RAG
const verifyInstallation = async () => {
  console.log('🔍 Verificando instalación del sistema RAG...');
  
  const checks = [
    {
      name: 'Verificar archivos del backend',
      check: () => {
        const files = [
          'backend/services/ragService.js',
          'backend/controllers/ragController.js',
          'backend/routes/rag.routes.js'
        ];
        
        for (const file of files) {
          if (!require('fs').existsSync(file)) {
            throw new Error(\`Archivo faltante: \${file}\`);
          }
        }
        return true;
      }
    },
    {
      name: 'Verificar archivos del frontend',
      check: () => {
        const files = [
          'frontend/src/components/assistant/RAGChat.tsx'
        ];
        
        for (const file of files) {
          if (!require('fs').existsSync(file)) {
            throw new Error(\`Archivo faltante: \${file}\`);
          }
        }
        return true;
      }
    },
    {
      name: 'Verificar variables de entorno',
      check: () => {
        const required = ['MONGODB_URI', 'MONGODB_AUTH_TOKEN'];
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
          throw new Error(\`Variables de entorno faltantes: \${missing.join(', ')}\`);
        }
        return true;
      }
    },
    {
      name: 'Verificar conectividad con Turso',
      check: async () => {
        try {
          const { createClient } = require('mongoose');
          const client = createClient({
            url: process.env.MONGODB_URI,
            authToken: process.env.MONGODB_AUTH_TOKEN
          });
          
          const result = await client.execute('SELECT COUNT(*) as count FROM rag_data');
          console.log(\`✅ Tabla RAG encontrada con \${result.rows[0].count} registros\`);
          return true;
        } catch (error) {
          throw new Error(\`Error conectando con Turso: \${error.message}\`);
        }
      }
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const check of checks) {
    try {
      console.log(\`\\n📋 \${check.name}...\`);
      await check.check();
      console.log(\`✅ \${check.name} - OK\`);
      passed++;
    } catch (error) {
      console.log(\`❌ \${check.name} - ERROR: \${error.message}\`);
      failed++;
    }
  }
  
  console.log(\`\\n📊 Resultado de verificación:\`);
  console.log(\`✅ Pasadas: \${passed}\`);
  console.log(\`❌ Fallidas: \${failed}\`);
  
  if (failed === 0) {
    console.log(\`\\n🎉 ¡Instalación verificada correctamente!\`);
    console.log(\`El sistema RAG está listo para usar.\`);
  } else {
    console.log(\`\\n⚠️ Hay problemas en la instalación. Revisa los errores arriba.\`);
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  verifyInstallation();
}

module.exports = { verifyInstallation };
`;

const verificationPath = path.join(__dirname, '../temporales/verify-rag-installation.js');
fs.writeFileSync(verificationPath, verificationScript);
console.log('✅ Script de verificación creado');

// 7. Crear script de comandos de instalación
const installCommands = `
# Comandos para instalar el sistema RAG

# 1. Instalar dependencias
cd backend
npm install mongoose

# 2. Configurar variables de entorno (agregar al .env)
echo "MONGODB_URI=mongodb://isoflow4-sergiocharata1977.turso.io" >> .env
echo "MONGODB_AUTH_TOKEN=tu_token_aqui" >> .env

# 3. Crear tabla RAG en Turso
npx turso db shell isoflow4 < backend/scripts/permanentes/create-rag-table-turso.sql

# 4. Integrar rutas en el servidor (agregar en app.js o index.js)
echo "const ragRoutes = require('./routes/rag.routes.js');" >> app.js
echo "app.use('/api/rag', ragRoutes);" >> app.js

# 5. Verificar instalación
node backend/scripts/temporales/verify-rag-installation.js

# 6. Probar sistema
node backend/scripts/temporales/test-rag-system.js

# 7. Iniciar servidor
npm start
`;

const commandsPath = path.join(__dirname, '../../../docs-esenciales/COMANDOS_INSTALACION_RAG.sh');
fs.writeFileSync(commandsPath, installCommands);
console.log('✅ Script de comandos de instalación creado');

console.log('\n🎉 Instalación del sistema RAG completada!');
console.log('\n📋 Próximos pasos:');
console.log('1. Instalar dependencias: npm install mongoose');
console.log('2. Configurar variables de entorno en .env');
console.log('3. Ejecutar migración en Turso');
console.log('4. Integrar rutas en el servidor principal');
console.log('5. Verificar instalación con el script de verificación');
console.log('6. Probar el sistema con el script de prueba');
console.log('7. Agregar el componente RAGChat al frontend');
console.log('\n📚 Documentación disponible en:');
console.log('- docs-esenciales/SISTEMA_RAG_INSTALACION.md');
console.log('- docs-esenciales/COMANDOS_INSTALACION_RAG.sh');
console.log('\n🔍 Para verificar la instalación:');
console.log('node backend/scripts/temporales/verify-rag-installation.js');
console.log('\n🧪 Para probar el sistema:');
console.log('node backend/scripts/temporales/test-rag-system.js');
