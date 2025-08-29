const mongoose = require('mongoose');

// Controlador para probar MongoDB y ver datos
const testMongoController = {
  // Obtener información de la base de datos
  getDatabaseInfo: async (req, res) => {
    try {
      const db = mongoose.connection.db;
      
      // Obtener lista de colecciones
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      // Obtener estadísticas de la base de datos
      const stats = await db.stats();
      
      res.json({
        success: true,
        databaseName: db.databaseName,
        connectionState: mongoose.connection.readyState,
        collections: collectionNames,
        collectionsCount: collections.length,
        stats: {
          collections: stats.collections,
          dataSize: stats.dataSize,
          storageSize: stats.storageSize,
          indexes: stats.indexes
        }
      });
    } catch (error) {
      console.error('Error obteniendo información de MongoDB:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener información de la base de datos',
        error: error.message
      });
    }
  },

  // Obtener datos de una colección específica
  getCollectionData: async (req, res) => {
    try {
      const { collectionName } = req.params;
      const { limit = 10 } = req.query;
      
      const db = mongoose.connection.db;
      const collection = db.collection(collectionName);
      
      // Contar documentos
      const count = await collection.countDocuments();
      
      // Obtener muestra de documentos
      const documents = await collection
        .find({})
        .limit(parseInt(limit))
        .toArray();
      
      res.json({
        success: true,
        collection: collectionName,
        totalDocuments: count,
        documentsReturned: documents.length,
        documents: documents
      });
    } catch (error) {
      console.error(`Error obteniendo datos de la colección ${req.params.collectionName}:`, error);
      res.status(500).json({
        success: false,
        message: `Error al obtener datos de la colección ${req.params.collectionName}`,
        error: error.message
      });
    }
  },

  // Obtener planes desde MongoDB (con fallback a datos mock)
  getPlanes: async (req, res) => {
    try {
      // Verificar si MongoDB está conectado
      if (mongoose.connection.readyState !== 1) {
        // MongoDB no conectado - usar datos mock
        const planesMock = [
          {
            _id: "plan_basico",
            name: "Plan Básico",
            description: "Plan básico para pequeñas organizaciones",
            price_monthly: 29.99,
            price_annual: 299.99,
            max_users: 10,
            max_departments: 5,
            features: ["Gestión básica de documentos", "5 procesos", "Soporte por email"],
            is_active: true,
            created_at: new Date("2024-01-01").toISOString()
          },
          {
            _id: "plan_profesional", 
            name: "Plan Profesional",
            description: "Plan profesional para organizaciones medianas",
            price_monthly: 79.99,
            price_annual: 799.99,
            max_users: 50,
            max_departments: 20,
            features: ["Todo del plan básico", "20 procesos", "Auditorías", "Indicadores", "Soporte prioritario"],
            is_active: true,
            created_at: new Date("2024-01-01").toISOString()
          },
          {
            _id: "plan_empresarial",
            name: "Plan Empresarial", 
            description: "Plan empresarial para grandes organizaciones",
            price_monthly: 199.99,
            price_annual: 1999.99,
            max_users: 500,
            max_departments: 50,
            features: ["Todo del plan profesional", "Procesos ilimitados", "API personalizada", "Soporte 24/7"],
            is_active: true,
            created_at: new Date("2024-01-01").toISOString()
          }
        ];
        
        return res.json({
          success: true,
          data: planesMock,
          total: planesMock.length,
          message: `Datos mock: ${planesMock.length} planes disponibles (MongoDB no conectado)`,
          source: "mock_data"
        });
      }

      const db = mongoose.connection.db;
      const planesCollection = db.collection('planes');
      
      // Obtener todos los planes
      const planes = await planesCollection.find({}).toArray();
      
      res.json({
        success: true,
        data: planes,
        total: planes.length,
        message: `Encontrados ${planes.length} planes en MongoDB`,
        source: "mongodb"
      });
    } catch (error) {
      console.error('Error obteniendo planes:', error);
      
      // Fallback a datos mock en caso de error
      const planesMock = [
        {
          _id: "plan_basico_fallback",
          name: "Plan Básico (Fallback)",
          description: "Plan básico - datos de emergencia",
          price_monthly: 29.99,
          error_fallback: true
        }
      ];
      
      res.json({
        success: true,
        data: planesMock,
        total: planesMock.length,
        message: "Usando datos de emergencia debido a error de conexión",
        source: "fallback_data",
        original_error: error.message
      });
    }
  },

  // Obtener organizaciones desde MongoDB
  getOrganizations: async (req, res) => {
    try {
      const db = mongoose.connection.db;
      const orgsCollection = db.collection('organizations');
      
      // Obtener todas las organizaciones
      const organizations = await orgsCollection.find({}).limit(10).toArray();
      
      res.json({
        success: true,
        data: organizations,
        total: organizations.length,
        message: `Encontradas ${organizations.length} organizaciones en MongoDB`
      });
    } catch (error) {
      console.error('Error obteniendo organizaciones desde MongoDB:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener organizaciones desde MongoDB',
        error: error.message
      });
    }
  },

  // Obtener usuarios desde MongoDB
  getUsers: async (req, res) => {
    try {
      const db = mongoose.connection.db;
      const usersCollection = db.collection('users');
      
      // Obtener usuarios (sin mostrar contraseñas)
      const users = await usersCollection
        .find({}, { projection: { password: 0, refreshToken: 0 } })
        .limit(10)
        .toArray();
      
      res.json({
        success: true,
        data: users,
        total: users.length,
        message: `Encontrados ${users.length} usuarios en MongoDB`
      });
    } catch (error) {
      console.error('Error obteniendo usuarios desde MongoDB:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios desde MongoDB',
        error: error.message
      });
    }
  }
};

module.exports = testMongoController;