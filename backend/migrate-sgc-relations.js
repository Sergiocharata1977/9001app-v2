const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || '9001app';

// Datos de ejemplo para las tablas de relaciones SGC
const sgcRelationsData = {
  // DOCUMENTOS RELACIONES
  documentos_relaciones: [
    {
      _id: new ObjectId(),
      id: "doc_rel_001",
      organization_id: 1,
      documento_padre_id: "doc_001",
      documento_hijo_id: "doc_002",
      tipo_relacion: "referencia",
      descripcion_relacion: "El procedimiento hace referencia a la política de calidad",
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      id: "doc_rel_002",
      organization_id: 1,
      documento_padre_id: "doc_002",
      documento_hijo_id: "doc_003",
      tipo_relacion: "derivado",
      descripcion_relacion: "Instructivo derivado del procedimiento principal",
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // PROCESOS RELACIONES
  procesos_relaciones: [
    {
      _id: new ObjectId(),
      id: "proc_rel_001",
      organization_id: 1,
      proceso_padre_id: "proc_001",
      proceso_hijo_id: "proc_002",
      tipo_relacion: "secuencial",
      descripcion_relacion: "Proceso de ventas seguido por proceso de entrega",
      orden: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      id: "proc_rel_002",
      organization_id: 1,
      proceso_padre_id: "proc_002",
      proceso_hijo_id: "proc_003",
      tipo_relacion: "paralelo",
      descripcion_relacion: "Procesos que pueden ejecutarse simultáneamente",
      orden: 2,
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // INDICADORES RELACIONES
  indicadores_relaciones: [
    {
      _id: new ObjectId(),
      id: "ind_rel_001",
      organization_id: 1,
      indicador_padre_id: "ind_001",
      indicador_hijo_id: "ind_002",
      tipo_relacion: "dependencia",
      descripcion_relacion: "Indicador de satisfacción depende de tiempo de respuesta",
      factor_influencia: 0.8,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      id: "ind_rel_002",
      organization_id: 1,
      indicador_padre_id: "ind_002",
      indicador_hijo_id: "ind_003",
      tipo_relacion: "correlacion",
      descripcion_relacion: "Correlación entre eficiencia y calidad",
      factor_influencia: 0.7,
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  // AUDITORIAS RELACIONES
  auditorias_relaciones: [
    {
      _id: new ObjectId(),
      id: "aud_rel_001",
      organization_id: 1,
      auditoria_principal_id: "aud_001",
      auditoria_relacionada_id: "aud_002",
      tipo_relacion: "seguimiento",
      descripcion_relacion: "Auditoría de seguimiento para verificar correcciones",
      fecha_relacion: "2024-03-15",
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      id: "aud_rel_002",
      organization_id: 1,
      auditoria_principal_id: "aud_002",
      auditoria_relacionada_id: "aud_003",
      tipo_relacion: "complementaria",
      descripcion_relacion: "Auditoría complementaria para área relacionada",
      fecha_relacion: "2024-04-01",
      created_at: new Date(),
      updated_at: new Date()
    }
  ]
};

async function migrateSGCRelations() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conexión exitosa');
    
    const db = client.db(DB_NAME);
    
    // 1. MIGRAR DOCUMENTOS RELACIONES
    console.log('\n📄 Migrando documentos relaciones...');
    const documentosRelacionesCollection = db.collection('documentos_relaciones');
    await documentosRelacionesCollection.deleteMany({});
    const docRelResult = await documentosRelacionesCollection.insertMany(sgcRelationsData.documentos_relaciones);
    console.log(`✅ ${docRelResult.insertedCount} relaciones de documentos migradas`);
    
    // 2. MIGRAR PROCESOS RELACIONES
    console.log('\n⚙️ Migrando procesos relaciones...');
    const procesosRelacionesCollection = db.collection('procesos_relaciones');
    await procesosRelacionesCollection.deleteMany({});
    const procRelResult = await procesosRelacionesCollection.insertMany(sgcRelationsData.procesos_relaciones);
    console.log(`✅ ${procRelResult.insertedCount} relaciones de procesos migradas`);
    
    // 3. MIGRAR INDICADORES RELACIONES
    console.log('\n📊 Migrando indicadores relaciones...');
    const indicadoresRelacionesCollection = db.collection('indicadores_relaciones');
    await indicadoresRelacionesCollection.deleteMany({});
    const indRelResult = await indicadoresRelacionesCollection.insertMany(sgcRelationsData.indicadores_relaciones);
    console.log(`✅ ${indRelResult.insertedCount} relaciones de indicadores migradas`);
    
    // 4. MIGRAR AUDITORIAS RELACIONES
    console.log('\n🔍 Migrando auditorías relaciones...');
    const auditoriasRelacionesCollection = db.collection('auditorias_relaciones');
    await auditoriasRelacionesCollection.deleteMany({});
    const audRelResult = await auditoriasRelacionesCollection.insertMany(sgcRelationsData.auditorias_relaciones);
    console.log(`✅ ${audRelResult.insertedCount} relaciones de auditorías migradas`);
    
    // 5. CREAR ÍNDICES
    console.log('\n🔍 Creando índices para relaciones SGC...');
    
    // Índices para documentos relaciones
    await documentosRelacionesCollection.createIndex({ "organization_id": 1 });
    await documentosRelacionesCollection.createIndex({ "documento_padre_id": 1 });
    await documentosRelacionesCollection.createIndex({ "documento_hijo_id": 1 });
    await documentosRelacionesCollection.createIndex({ "tipo_relacion": 1 });
    
    // Índices para procesos relaciones
    await procesosRelacionesCollection.createIndex({ "organization_id": 1 });
    await procesosRelacionesCollection.createIndex({ "proceso_padre_id": 1 });
    await procesosRelacionesCollection.createIndex({ "proceso_hijo_id": 1 });
    await procesosRelacionesCollection.createIndex({ "tipo_relacion": 1 });
    await procesosRelacionesCollection.createIndex({ "orden": 1 });
    
    // Índices para indicadores relaciones
    await indicadoresRelacionesCollection.createIndex({ "organization_id": 1 });
    await indicadoresRelacionesCollection.createIndex({ "indicador_padre_id": 1 });
    await indicadoresRelacionesCollection.createIndex({ "indicador_hijo_id": 1 });
    await indicadoresRelacionesCollection.createIndex({ "tipo_relacion": 1 });
    
    // Índices para auditorías relaciones
    await auditoriasRelacionesCollection.createIndex({ "organization_id": 1 });
    await auditoriasRelacionesCollection.createIndex({ "auditoria_principal_id": 1 });
    await auditoriasRelacionesCollection.createIndex({ "auditoria_relacionada_id": 1 });
    await auditoriasRelacionesCollection.createIndex({ "tipo_relacion": 1 });
    await auditoriasRelacionesCollection.createIndex({ "fecha_relacion": 1 });
    
    console.log('✅ Índices para relaciones SGC creados exitosamente');
    
    // 6. VERIFICAR MIGRACIÓN
    console.log('\n📊 Verificando migración de relaciones SGC...');
    
    const docRelCount = await documentosRelacionesCollection.countDocuments();
    const procRelCount = await procesosRelacionesCollection.countDocuments();
    const indRelCount = await indicadoresRelacionesCollection.countDocuments();
    const audRelCount = await auditoriasRelacionesCollection.countDocuments();
    
    console.log(`📈 Resumen de migración de relaciones SGC:`);
    console.log(`   - Documentos relaciones: ${docRelCount}`);
    console.log(`   - Procesos relaciones: ${procRelCount}`);
    console.log(`   - Indicadores relaciones: ${indRelCount}`);
    console.log(`   - Auditorías relaciones: ${audRelCount}`);
    
    console.log('\n🎉 ¡Migración de relaciones SGC completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración de relaciones SGC:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateSGCRelations()
    .then(() => {
      console.log('\n✅ Script de migración de relaciones SGC completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en el script de migración de relaciones SGC:', error);
      process.exit(1);
    });
}

module.exports = { migrateSGCRelations };