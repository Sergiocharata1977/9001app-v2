const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('MongoDB Connection Integration Tests', () => {
  let mongoServer;
  let mongoUri;

  beforeAll(async () => {
    // Iniciar servidor MongoDB en memoria para tests
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
  });

  afterAll(async () => {
    // Limpiar después de todos los tests
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Limpiar base de datos antes de cada test
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany();
      }
    }
  });

  afterEach(async () => {
    // Desconectar después de cada test
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });

  describe('Database Connection', () => {
    it('should connect to MongoDB successfully', async () => {
      const connectionResult = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      expect(connectionResult.connection.readyState).toBe(1); // Connected
      expect(connectionResult.connection.host).toBeDefined();
      expect(connectionResult.connection.port).toBeDefined();
    });

    it('should handle connection errors gracefully', async () => {
      const invalidUri = 'mongodb://invalid-host:27017/test';

      try {
        await mongoose.connect(invalidUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 1000, // Timeout rápido para tests
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('connect');
      }
    });

    it('should reconnect after disconnection', async () => {
      // Primera conexión
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      expect(mongoose.connection.readyState).toBe(1);

      // Desconectar
      await mongoose.disconnect();
      expect(mongoose.connection.readyState).toBe(0);

      // Reconectar
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      expect(mongoose.connection.readyState).toBe(1);
    });
  });

  describe('Database Operations', () => {
    let User;
    let Organization;

    beforeAll(async () => {
      // Definir schemas simples para testing
      const userSchema = new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        role: { type: String, default: 'user' },
        isActive: { type: Boolean, default: true }
      });

      const organizationSchema = new mongoose.Schema({
        name: { type: String, required: true },
        description: String,
        isActive: { type: Boolean, default: true }
      });

      User = mongoose.model('User', userSchema);
      Organization = mongoose.model('Organization', organizationSchema);
    });

    it('should perform CRUD operations on User collection', async () => {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Create
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'user'
      };

      const newUser = await User.create(userData);
      expect(newUser.email).toBe(userData.email);
      expect(newUser.name).toBe(userData.name);
      expect(newUser._id).toBeDefined();

      // Read
      const foundUser = await User.findById(newUser._id);
      expect(foundUser.email).toBe(userData.email);

      // Update
      const updatedUser = await User.findByIdAndUpdate(
        newUser._id,
        { name: 'Updated User' },
        { new: true }
      );
      expect(updatedUser.name).toBe('Updated User');

      // Delete
      await User.findByIdAndDelete(newUser._id);
      const deletedUser = await User.findById(newUser._id);
      expect(deletedUser).toBeNull();
    });

    it('should perform CRUD operations on Organization collection', async () => {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Create
      const orgData = {
        name: 'Test Organization',
        description: 'Test organization description'
      };

      const newOrg = await Organization.create(orgData);
      expect(newOrg.name).toBe(orgData.name);
      expect(newOrg.description).toBe(orgData.description);
      expect(newOrg._id).toBeDefined();

      // Read
      const foundOrg = await Organization.findById(newOrg._id);
      expect(foundOrg.name).toBe(orgData.name);

      // Update
      const updatedOrg = await Organization.findByIdAndUpdate(
        newOrg._id,
        { description: 'Updated description' },
        { new: true }
      );
      expect(updatedOrg.description).toBe('Updated description');

      // Delete
      await Organization.findByIdAndDelete(newOrg._id);
      const deletedOrg = await Organization.findById(newOrg._id);
      expect(deletedOrg).toBeNull();
    });

    it('should handle unique constraints', async () => {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const userData = {
        email: 'unique@example.com',
        name: 'Unique User'
      };

      // Crear primer usuario
      await User.create(userData);

      // Intentar crear segundo usuario con mismo email
      try {
        await User.create(userData);
        fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      }
    });

    it('should handle validation errors', async () => {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const invalidUserData = {
        // email faltante (required)
        name: 'Invalid User'
      };

      try {
        await User.create(invalidUserData);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
        expect(error.errors.email).toBeDefined();
      }
    });
  });

  describe('Database Performance', () => {
    let User;

    beforeAll(async () => {
      const userSchema = new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        role: { type: String, default: 'user' },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
      });

      // Crear índices para performance
      userSchema.index({ email: 1 });
      userSchema.index({ role: 1 });
      userSchema.index({ createdAt: -1 });

      User = mongoose.model('User', userSchema);
    });

    it('should handle bulk operations efficiently', async () => {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const startTime = Date.now();

      // Crear 100 usuarios en bulk
      const usersData = Array.from({ length: 100 }, (_, i) => ({
        email: `user${i}@example.com`,
        name: `User ${i}`,
        role: i % 2 === 0 ? 'user' : 'admin'
      }));

      const users = await User.insertMany(usersData);
      expect(users).toHaveLength(100);

      const insertTime = Date.now() - startTime;
      expect(insertTime).toBeLessThan(5000); // Debería tomar menos de 5 segundos

      // Consulta con filtros
      const queryStartTime = Date.now();
      const adminUsers = await User.find({ role: 'admin' });
      const queryTime = Date.now() - queryStartTime;

      expect(adminUsers).toHaveLength(50);
      expect(queryTime).toBeLessThan(1000); // Debería tomar menos de 1 segundo
    });

    it('should handle aggregation queries', async () => {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      // Crear datos de prueba
      const usersData = [
        { email: 'user1@example.com', name: 'User 1', role: 'user' },
        { email: 'user2@example.com', name: 'User 2', role: 'user' },
        { email: 'admin1@example.com', name: 'Admin 1', role: 'admin' },
        { email: 'admin2@example.com', name: 'Admin 2', role: 'admin' }
      ];

      await User.insertMany(usersData);

      // Agregación para contar usuarios por rol
      const roleCounts = await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      expect(roleCounts).toHaveLength(2);
      expect(roleCounts[0]).toEqual({ _id: 'admin', count: 2 });
      expect(roleCounts[1]).toEqual({ _id: 'user', count: 2 });
    });
  });

  describe('Database Transactions', () => {
    let User;
    let Organization;

    beforeAll(async () => {
      const userSchema = new mongoose.Schema({
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }
      });

      const organizationSchema = new mongoose.Schema({
        name: { type: String, required: true },
        userCount: { type: Number, default: 0 }
      });

      User = mongoose.model('User', userSchema);
      Organization = mongoose.model('Organization', organizationSchema);
    });

    it('should handle transactions successfully', async () => {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Crear organización
        const org = await Organization.create([{
          name: 'Test Organization'
        }], { session });

        // Crear usuario asociado
        const user = await User.create([{
          email: 'test@example.com',
          name: 'Test User',
          organization: org[0]._id
        }], { session });

        // Actualizar contador de usuarios
        await Organization.findByIdAndUpdate(
          org[0]._id,
          { $inc: { userCount: 1 } },
          { session }
        );

        await session.commitTransaction();
        session.endSession();

        // Verificar que todo se guardó correctamente
        const savedOrg = await Organization.findById(org[0]._id);
        const savedUser = await User.findById(user[0]._id);

        expect(savedOrg.userCount).toBe(1);
        expect(savedUser.organization.toString()).toBe(org[0]._id.toString());

      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    });

    it('should rollback transactions on error', async () => {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Crear organización
        const org = await Organization.create([{
          name: 'Test Organization'
        }], { session });

        // Intentar crear usuario con datos inválidos (debería fallar)
        await User.create([{
          email: 'invalid-email', // Email inválido
          name: 'Test User',
          organization: org[0]._id
        }], { session });

        await session.commitTransaction();
        session.endSession();
        fail('Should have thrown validation error');

      } catch (error) {
        await session.abortTransaction();
        session.endSession();

        // Verificar que nada se guardó
        const orgs = await Organization.find({ name: 'Test Organization' });
        const users = await User.find({ name: 'Test User' });

        expect(orgs).toHaveLength(0);
        expect(users).toHaveLength(0);
      }
    });
  });
});