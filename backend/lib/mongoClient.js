const { MongoClient } = require('mongodb');
require('dotenv').config();

class MongoClientWrapper {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.useMockData = true; // Temporalmente usar datos mock
  }

  async connect() {
    try {
      // Usar MongoDB URI desde la configuración
      const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://9001app:password@9001app-v2.xqydf2m.mongodb.net/9001app?retryWrites=true&w=majority';
      
      console.log('🔌 Intentando conectar a MongoDB...');
      console.log('📋 URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Ocultar credenciales
      
      this.client = new MongoClient(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      await this.client.connect();
      
      this.db = this.client.db(process.env.MONGODB_DB_NAME || '9001app');
      this.isConnected = true;
      this.useMockData = false; // Si la conexión es exitosa, usar datos reales
      
      console.log('✅ Conexión exitosa a MongoDB');
      console.log('📊 Base de datos:', this.db.databaseName);
      
      // Verificar si hay datos
      const usersCollection = this.db.collection('users');
      const userCount = await usersCollection.countDocuments();
      console.log('👥 Usuarios en la base de datos:', userCount);
      
      if (userCount === 0) {
        console.log('⚠️ No hay usuarios en la base de datos, creando usuarios de prueba...');
        await this.createTestUsers();
      }
      
      return this;
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error.message);
      console.log('🔄 Fallback: Usando datos mock...');
      this.useMockData = true;
      this.isConnected = true;
      return this;
    }
  }

  async createTestUsers() {
    try {
      const bcrypt = require('bcryptjs');
      const testPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const testUsers = [
        {
          name: 'Admin User',
          email: 'admin@9001app.com',
          password_hash: hashedPassword,
          role: 'admin',
          organization_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          name: 'Super Admin',
          email: 'superadmin@9001app.com',
          password_hash: hashedPassword,
          role: 'super_admin',
          organization_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      const usersCollection = this.db.collection('users');
      const result = await usersCollection.insertMany(testUsers);
      
      console.log('✅ Usuarios de prueba creados:', result.insertedIds);
      console.log('🔑 Credenciales de prueba:');
      console.log('   Admin: admin@9001app.com / admin123');
      console.log('   Super Admin: superadmin@9001app.com / admin123');
      
      // Crear organización de prueba
      const organizationsCollection = this.db.collection('organizations');
      const orgResult = await organizationsCollection.insertOne({
        id: 1,
        name: '9001app Demo',
        description: 'Organización de demostración',
        plan: 'premium',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log('✅ Organización de prueba creada:', orgResult.insertedId);
      
    } catch (error) {
      console.error('❌ Error creando usuarios de prueba:', error);
    }
  }

  async execute(query) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      console.log('🔍 Ejecutando query:', query.sql);
      console.log('📋 Args:', query.args);
      
      if (this.useMockData) {
        return this.executeMock(query);
      } else {
        return this.executeReal(query);
      }
    } catch (error) {
      console.error('❌ Error ejecutando query:', error);
      throw error;
    }
  }

  async executeMock(query) {
    console.log('🎭 Usando datos mock');
    
    // Datos mock CRM
    const mockData = {
      users: [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@9001app.com',
          password_hash: '$2a$10$Q/mCA/vbLgdt340VS.QsQeUBZ9N6wLUW47au8Pf1WbIrNliBAbhLC',
          role: 'admin',
          organization_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: 'Super Admin',
          email: 'superadmin@9001app.com',
          password_hash: '$2a$10$Q/mCA/vbLgdt340VS.QsQeUBZ9N6wLUW47au8Pf1WbIrNliBAbhLC',
          role: 'super_admin',
          organization_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      organizations: [
        {
          id: 1,
          name: '9001app Demo',
          description: 'Organización de demostración',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      crm_contactos: [
        {
          id: 1,
          organization_id: 1,
          nombre: 'Juan Pérez',
          apellidos: 'García',
          email: 'juan.perez@agro.com',
          telefono: '+54 11 1234-5678',
          cargo: 'Gerente de Compras',
          empresa: 'Agroindustria del Norte S.A.',
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          organization_id: 1,
          nombre: 'María González',
          apellidos: 'López',
          email: 'maria.gonzalez@coop.com',
          telefono: '+54 291 9876-5432',
          cargo: 'Directora Comercial',
          empresa: 'Cooperativa Agropecuaria Sur',
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      crm_clientes_agro: [
        {
          id: 1,
          organization_id: 1,
          nombre_empresa: 'Agroindustria del Norte S.A.',
          tipo_cliente: 'productor',
          cuit: '30-12345678-9',
          supervisor_comercial_id: 'SUP_001',
          asesor_tecnico_id: 'TEC_001',
          vendedor_asignado_id: 'VEN_001',
          direccion: 'Ruta 9 KM 100, San Nicolas',
          telefono: '+54 11 1234-5678',
          email: 'info@agronorte.com',
          sitio_web: 'www.agronorte.com',
          fecha_registro: '2023-01-15',
          estado: 'activo',
          observaciones: 'Cliente con alto potencial de crecimiento.',
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          organization_id: 1,
          nombre_empresa: 'Cooperativa Agricola Sur',
          tipo_cliente: 'cooperativa',
          cuit: '30-87654321-0',
          supervisor_comercial_id: 'SUP_002',
          asesor_tecnico_id: 'TEC_002',
          vendedor_asignado_id: 'VEN_002',
          direccion: 'Av. San Martin 123, Bahia Blanca',
          telefono: '+54 291 9876-5432',
          email: 'info@coopagro.com',
          sitio_web: 'www.coopagro.com',
          fecha_registro: '2023-02-01',
          estado: 'activo',
          observaciones: 'Cooperativa con 50 productores asociados.',
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      crm_oportunidades_agro: [
        {
          id: 1,
          organization_id: 1,
          supervisor_id: 'PRJ_001',
          vendedor_id: 'VEN_001',
          cliente_id: 'CLI_001',
          nombre_oportunidad: 'Venta de fertilizantes, 2024',
          descripcion: 'Oportunidad de venta de fertilizantes para la campaña 2024/25',
          valor_estimado: 50000,
          probabilidad: 80,
          fecha_cierre_esperada: '2024-11-30',
          estado: 'Negociación',
          observaciones: 'Cliente interesado en productos premium',
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          organization_id: 1,
          supervisor_id: 'PRJ_001',
          vendedor_id: 'VEN_002',
          cliente_id: 'CLI_002',
          nombre_oportunidad: 'Servicios de Asesoramiento técnico',
          descripcion: 'Contrato de asesoramiento técnico anual',
          valor_estimado: 10000,
          probabilidad: 90,
          fecha_cierre_esperada: '2024-12-15',
          estado: 'Propuesta enviada',
          observaciones: 'Finalizando propuesta técnica',
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      crm_productos_agro: [
        {
          id: 1,
          organization_id: 1,
          id_producto: 'prod_agro_001',
          nombre_producto: 'Fertilizante NPK Premium',
          descripcion: 'Fertilizante automatizado para cultivos colombianos',
          categoria: 'Fertilizantes',
          precio_unitario: 850,
          cantidad_disponible: 10000,
          stock_disponible: 10000,
          observaciones: 'Producto estrella de la línea',
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          organization_id: 1,
          id_producto: 'prod_agro_002',
          nombre_producto: 'Herbicida Selectivo',
          descripcion: 'Herbicida para control de malezas en soja',
          categoria: 'Herbicidas',
          precio_unitario: 1200,
          cantidad_disponible: 5000,
          stock_disponible: 5000,
          observaciones: 'Producto de alta demanda',
          is_active: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
    };

    // Simular consultas básicas
    if (query.sql.includes('SELECT') && query.sql.includes('usuarios') && query.sql.includes('organizations')) {
      const usersWithOrg = mockData.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        password_hash: user.password_hash,
        role: user.role,
        organization_id: user.organization_id,
        organization_name: '9001app Demo',
        organization_plan: 'premium'
      }));
      
      if (query.args && query.args[0]) {
        const filteredUsers = usersWithOrg.filter(user => user.email === query.args[0]);
        console.log('📊 Resultado mock:', filteredUsers);
        return { rows: filteredUsers };
      }
      
      return { rows: usersWithOrg };
    }
    
    // Consulta por _id (para authMiddleware)
    if (query.sql.includes('SELECT') && query.sql.includes('usuarios') && query.sql.includes('_id')) {
      if (query.args && query.args[0]) {
        const user = mockData.users.find(u => u.id.toString() === query.args[0].toString());
        if (user) {
          return { 
            rows: [{
              id: user.id.toString(),
              organization_id: user.organization_id,
              name: user.name,
              email: user.email,
              role: user.role,
              is_active: user.is_active
            }]
          };
        }
      }
      return { rows: [] };
    }

    // Consultas CRM específicas
    if (query.sql.includes('crm_contactos')) {
      let contactos = mockData.crm_contactos;
      if (query.args && query.args[0]) {
        contactos = contactos.filter(c => c.organization_id === parseInt(query.args[0]));
      }
      console.log('📊 Contactos CRM mock encontrados:', contactos.length);
      return { rows: contactos };
    }

    if (query.sql.includes('crm_clientes_agro')) {
      let clientes = mockData.crm_clientes_agro;
      if (query.args && query.args[0]) {
        clientes = clientes.filter(c => c.organization_id === parseInt(query.args[0]));
      }
      console.log('📊 Clientes CRM mock encontrados:', clientes.length);
      return { rows: clientes };
    }

    if (query.sql.includes('crm_oportunidades_agro')) {
      let oportunidades = mockData.crm_oportunidades_agro;
      if (query.args && query.args[0]) {
        oportunidades = oportunidades.filter(o => o.organization_id === parseInt(query.args[0]));
      }
      console.log('📊 Oportunidades CRM mock encontradas:', oportunidades.length);
      return { rows: oportunidades };
    }

    if (query.sql.includes('crm_productos_agro')) {
      let productos = mockData.crm_productos_agro;
      if (query.args && query.args[0]) {
        productos = productos.filter(p => p.organization_id === parseInt(query.args[0]));
      }
      console.log('📊 Productos CRM mock encontrados:', productos.length);
      return { rows: productos };
    }
    
    return { rows: [] };
  }

  async executeReal(query) {
    console.log('🗄️ Usando MongoDB real');
    
    // Convertir SQL a operaciones de MongoDB
    if (query.sql.includes('SELECT') && query.sql.includes('usuarios') && query.sql.includes('organizations')) {
      const usersCollection = this.db.collection('users');
      const organizationsCollection = this.db.collection('organizations');
      
      let userQuery = { is_active: true };
      if (query.args && query.args[0]) {
        userQuery.email = query.args[0];
      }
      
      const users = await usersCollection.find(userQuery).toArray();
      console.log('📊 Usuarios encontrados:', users.length);
      
      // Agregar información de organización
      const usersWithOrg = await Promise.all(users.map(async (user) => {
        let org = null;
        if (user.organization_id) {
          org = await organizationsCollection.findOne({ id: user.organization_id });
        }
        
        return {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          password_hash: user.password_hash,
          role: user.role,
          organization_id: user.organization_id,
          organization_name: org ? org.name : 'Sin organización',
          organization_plan: org ? org.plan : 'basic'
        };
      }));
      
      console.log('📊 Resultado real:', usersWithOrg);
      return { rows: usersWithOrg };
    }
    
    // Consulta por _id (para authMiddleware)
    if (query.sql.includes('SELECT') && query.sql.includes('usuarios') && query.sql.includes('_id')) {
      const usersCollection = this.db.collection('users');
      
      if (query.args && query.args[0]) {
        const { ObjectId } = require('mongodb');
        let userId = query.args[0];
        
        console.log('🔍 Buscando usuario por ID:', userId);
        
        // Si es un string, convertirlo a ObjectId
        if (typeof userId === 'string') {
          try {
            userId = new ObjectId(userId);
            console.log('✅ ID convertido a ObjectId:', userId);
          } catch (error) {
            console.log('❌ ID inválido:', userId);
            return { rows: [] };
          }
        }
        
        const user = await usersCollection.findOne({ _id: userId, is_active: true });
        console.log('📊 Usuario encontrado por _id:', user ? 'Sí' : 'No');
        
        if (user) {
          console.log('✅ Usuario encontrado:', user.name, user.email);
          return { 
            rows: [{
              id: user._id.toString(),
              organization_id: user.organization_id,
              name: user.name,
              email: user.email,
              role: user.role,
              is_active: user.is_active
            }]
          };
        } else {
          console.log('❌ Usuario no encontrado en la base de datos');
        }
      }
      
      return { rows: [] };
    }

    // Consultas CRM específicas
    if (query.sql.includes('crm_contactos')) {
      const contactosCollection = this.db.collection('crm_contactos');
      let filter = { is_active: 1 };
      
      if (query.args && query.args[0]) {
        filter.organization_id = parseInt(query.args[0]);
      }
      
      const contactos = await contactosCollection.find(filter).toArray();
      console.log('📊 Contactos CRM encontrados:', contactos.length);
      return { rows: contactos };
    }

    if (query.sql.includes('crm_clientes_agro')) {
      const clientesCollection = this.db.collection('crm_clientes_agro');
      let filter = { is_active: 1 };
      
      if (query.args && query.args[0]) {
        filter.organization_id = parseInt(query.args[0]);
      }
      
      const clientes = await clientesCollection.find(filter).toArray();
      console.log('📊 Clientes CRM encontrados:', clientes.length);
      return { rows: clientes };
    }

    if (query.sql.includes('crm_oportunidades_agro')) {
      const oportunidadesCollection = this.db.collection('crm_oportunidades_agro');
      let filter = { is_active: 1 };
      
      if (query.args && query.args[0]) {
        filter.organization_id = parseInt(query.args[0]);
      }
      
      const oportunidades = await oportunidadesCollection.find(filter).toArray();
      console.log('📊 Oportunidades CRM encontradas:', oportunidades.length);
      return { rows: oportunidades };
    }

    if (query.sql.includes('crm_productos_agro')) {
      const productosCollection = this.db.collection('crm_productos_agro');
      let filter = { is_active: 1 };
      
      if (query.args && query.args[0]) {
        filter.organization_id = parseInt(query.args[0]);
      }
      
      const productos = await productosCollection.find(filter).toArray();
      console.log('📊 Productos CRM encontrados:', productos.length);
      return { rows: productos };
    }
    
    return { rows: [] };
  }

  async query(sql, args = []) {
    return this.execute({ sql, args });
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
    this.isConnected = false;
    console.log('🔌 Desconectado de MongoDB');
  }

  collection(name) {
    if (!this.isConnected) {
      throw new Error('No conectado');
    }
    
    if (this.useMockData) {
      return this.getMockCollection(name);
    } else {
      return this.db.collection(name);
    }
  }

  getMockCollection(name) {
    const mockData = {
      users: [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@9001app.com',
          password_hash: '$2a$10$Q/mCA/vbLgdt340VS.QsQeUBZ9N6wLUW47au8Pf1WbIrNliBAbhLC',
          role: 'admin',
          organization_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          name: 'Super Admin',
          email: 'superadmin@9001app.com',
          password_hash: '$2a$10$Q/mCA/vbLgdt340VS.QsQeUBZ9N6wLUW47au8Pf1WbIrNliBAbhLC',
          role: 'super_admin',
          organization_id: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      organizations: [
        {
          id: 1,
          name: '9001app Demo',
          description: 'Organización de demostración',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]
    };

    return {
      find: (query = {}) => ({
        toArray: async () => mockData[name] || []
      }),
      findOne: async (query = {}) => {
        const collection = mockData[name] || [];
        return collection.find(item => 
          Object.keys(query).every(key => item[key] === query[key])
        );
      },
      insertOne: async (doc) => {
        if (!mockData[name]) mockData[name] = [];
        const newDoc = { ...doc, id: mockData[name].length + 1 };
        mockData[name].push(newDoc);
        return { insertedId: newDoc.id };
      },
      countDocuments: async () => (mockData[name] || []).length
    };
  }
}

// Instancia singleton
const mongoClient = new MongoClientWrapper();

module.exports = mongoClient;
