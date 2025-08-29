const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || '9001app';

// Datos de ejemplo para las tablas RRHH restantes
const rrhhRemainingData = {
  // EVALUACIONES INDIVIDUALES
  evaluaciones_individuales: [
    {
      _id: new ObjectId(),
      id: "eval_001",
      organization_id: 1,
      empleado_id: "per_001",
      evaluador_id: "per_001",
      periodo_evaluacion: "2024-Q1",
      fecha_evaluacion: "2024-03-31",
      puntuacion_total: 85,
      competencias_evaluadas: [
        {
          competencia_id: "comp_001",
          puntuacion: 4,
          comentarios: "Excelente conocimiento en gestión de calidad"
        },
        {
          competencia_id: "comp_003",
          puntuacion: 5,
          comentarios: "Liderazgo excepcional del equipo"
        }
      ],
      fortalezas: ["Liderazgo", "Conocimiento técnico", "Comunicación"],
      areas_mejora: ["Gestión del tiempo", "Delegación"],
      objetivos_siguiente_periodo: ["Mejorar eficiencia operativa", "Desarrollar equipo"],
      estado: "completada",
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      id: "eval_002",
      organization_id: 1,
      empleado_id: "per_002",
      evaluador_id: "per_001",
      periodo_evaluacion: "2024-Q1",
      fecha_evaluacion: "2024-03-31",
      puntuacion_total: 78,
      competencias_evaluadas: [
        {
          competencia_id: "comp_002",
          puntuacion: 4,
          comentarios: "Buen desempeño en ventas agroindustriales"
        }
      ],
      fortalezas: ["Conocimiento del mercado", "Relación con clientes"],
      areas_mejora: ["Seguimiento post-venta", "Reportes"],
      objetivos_siguiente_periodo: ["Incrementar ventas 15%", "Mejorar seguimiento"],
      estado: "completada",
      created_at: new Date(),
      updated_at: new Date()
    }
  ]
};

async function migrateRRHHRemaining() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conexión exitosa');
    
    const db = client.db(DB_NAME);
    
    // 1. MIGRAR EVALUACIONES INDIVIDUALES
    console.log('\n📊 Migrando evaluaciones individuales...');
    const evaluacionesCollection = db.collection('evaluaciones_individuales');
    await evaluacionesCollection.deleteMany({});
    const evaluacionesResult = await evaluacionesCollection.insertMany(rrhhRemainingData.evaluaciones_individuales);
    console.log(`✅ ${evaluacionesResult.insertedCount} evaluaciones individuales migradas`);
    
    // 2. CREAR ÍNDICES
    console.log('\n🔍 Creando índices para tablas RRHH restantes...');
    
    // Índices para evaluaciones individuales
    await evaluacionesCollection.createIndex({ "organization_id": 1 });
    await evaluacionesCollection.createIndex({ "empleado_id": 1 });
    await evaluacionesCollection.createIndex({ "evaluador_id": 1 });
    await evaluacionesCollection.createIndex({ "periodo_evaluacion": 1 });
    await evaluacionesCollection.createIndex({ "estado": 1 });
    await evaluacionesCollection.createIndex({ "fecha_evaluacion": 1 });
    
    console.log('✅ Índices para RRHH restante creados exitosamente');
    
    // 3. VERIFICAR MIGRACIÓN
    console.log('\n📊 Verificando migración RRHH restante...');
    
    const evaluacionesCount = await evaluacionesCollection.countDocuments();
    
    console.log(`📈 Resumen de migración RRHH restante:`);
    console.log(`   - Evaluaciones individuales: ${evaluacionesCount}`);
    
    // Nota: Las otras tablas RRHH (capacitaciones, competencias, puestos, departamentos) 
    // ya fueron migradas en el script migrate-rrhh-module.js
    console.log('\n📋 Tablas RRHH ya migradas previamente:');
    
    const departamentosCount = await db.collection('departamentos').countDocuments();
    const personalCount = await db.collection('personal').countDocuments();
    const puestosCount = await db.collection('puestos').countDocuments();
    const capacitacionesCount = await db.collection('capacitaciones').countDocuments();
    const competenciasCount = await db.collection('competencias').countDocuments();
    
    console.log(`   - Departamentos: ${departamentosCount}`);
    console.log(`   - Personal: ${personalCount}`);
    console.log(`   - Puestos: ${puestosCount}`);
    console.log(`   - Capacitaciones: ${capacitacionesCount}`);
    console.log(`   - Competencias: ${competenciasCount}`);
    
    console.log('\n🎉 ¡Migración de tablas RRHH restantes completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración RRHH restante:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateRRHHRemaining()
    .then(() => {
      console.log('\n✅ Script de migración RRHH restante completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en el script de migración RRHH restante:', error);
      process.exit(1);
    });
}

module.exports = { migrateRRHHRemaining };