const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || '9001app';

// Datos de ejemplo para la tabla PLANES (crítica)
const planesData = {
  planes: [
    {
      _id: new ObjectId(),
      id: 1,
      nombre: "Básico",
      descripcion: "Plan básico para organizaciones pequeñas",
      precio_mensual: 29.99,
      precio_anual: 299.99,
      max_usuarios: 10,
      max_departamentos: 5,
      max_documentos: 1000,
      caracteristicas: [
        "Gestión básica de calidad",
        "Hasta 10 usuarios",
        "Soporte por email",
        "Reportes básicos"
      ],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      id: 2,
      nombre: "Profesional",
      descripcion: "Plan profesional para organizaciones medianas",
      precio_mensual: 79.99,
      precio_anual: 799.99,
      max_usuarios: 50,
      max_departamentos: 20,
      max_documentos: 5000,
      caracteristicas: [
        "Todo del plan básico",
        "Hasta 50 usuarios",
        "Auditorías avanzadas",
        "Reportes personalizados",
        "Soporte telefónico"
      ],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      id: 3,
      nombre: "Empresarial",
      descripcion: "Plan empresarial para grandes organizaciones",
      precio_mensual: 199.99,
      precio_anual: 1999.99,
      max_usuarios: 200,
      max_departamentos: 50,
      max_documentos: 20000,
      caracteristicas: [
        "Todo del plan profesional",
        "Hasta 200 usuarios",
        "Integración con sistemas externos",
        "Soporte prioritario",
        "Consultoría especializada"
      ],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      _id: new ObjectId(),
      id: 4,
      nombre: "Enterprise",
      descripcion: "Plan enterprise para corporaciones",
      precio_mensual: 499.99,
      precio_anual: 4999.99,
      max_usuarios: 500,
      max_departamentos: 100,
      max_documentos: 50000,
      caracteristicas: [
        "Todo del plan empresarial",
        "Usuarios ilimitados",
        "Soporte 24/7",
        "API personalizada",
        "SLA garantizado",
        "Implementación dedicada"
      ],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]
};

async function migratePlanesTable() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Conectando a MongoDB...');
    await client.connect();
    console.log('✅ Conexión exitosa');
    
    const db = client.db(DB_NAME);
    
    // 1. MIGRAR TABLA PLANES (CRÍTICA)
    console.log('\n💳 Migrando tabla planes (CRÍTICA)...');
    const planesCollection = db.collection('planes');
    
    // Limpiar colección existente
    await planesCollection.deleteMany({});
    
    // Insertar datos de planes
    const planesResult = await planesCollection.insertMany(planesData.planes);
    console.log(`✅ ${planesResult.insertedCount} planes migrados`);
    
    // 2. CREAR ÍNDICES PARA PLANES
    console.log('\n🔍 Creando índices para planes...');
    
    // Índices únicos y de búsqueda
    await planesCollection.createIndex({ "id": 1 }, { unique: true });
    await planesCollection.createIndex({ "nombre": 1 }, { unique: true });
    await planesCollection.createIndex({ "precio_mensual": 1 });
    await planesCollection.createIndex({ "precio_anual": 1 });
    await planesCollection.createIndex({ "is_active": 1 });
    await planesCollection.createIndex({ "max_usuarios": 1 });
    
    console.log('✅ Índices para planes creados exitosamente');
    
    // 3. VERIFICAR MIGRACIÓN
    console.log('\n📊 Verificando migración de planes...');
    
    const planesCount = await planesCollection.countDocuments();
    const planesActivos = await planesCollection.countDocuments({ is_active: true });
    
    console.log(`📈 Resumen de migración de PLANES:`);
    console.log(`   - Total de planes: ${planesCount}`);
    console.log(`   - Planes activos: ${planesActivos}`);
    
    // 4. MOSTRAR PLANES MIGRADOS
    console.log('\n📋 Planes migrados:');
    const planes = await planesCollection.find({}).toArray();
    planes.forEach(plan => {
      console.log(`   - ${plan.nombre}: $${plan.precio_mensual}/mes (${plan.max_usuarios} usuarios)`);
    });
    
    console.log('\n🎉 ¡Migración de tabla PLANES completada exitosamente!');
    console.log('⚠️  CRÍTICO: Esta tabla es fundamental para el funcionamiento del sistema');
    
  } catch (error) {
    console.error('❌ Error durante la migración de planes:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar migración
if (require.main === module) {
  migratePlanesTable()
    .then(() => {
      console.log('\n✅ Script de migración de PLANES completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error en el script de migración de PLANES:', error);
      process.exit(1);
    });
}

module.exports = { migratePlanesTable };