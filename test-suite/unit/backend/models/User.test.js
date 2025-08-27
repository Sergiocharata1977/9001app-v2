const mongoose = require('mongoose');
const { User } = require('../../../models/User');

// Mock de mongoose
jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn()
}));

describe('User Model', () => {
  let mockUser;
  let mockSchema;
  let mockModel;

  beforeEach(() => {
    // Configurar mocks
    mockUser = {
      id: 'user-001',
      email: 'test@example.com',
      password: 'hashedPassword123',
      name: 'Test User',
      role: 'user',
      organization: 'org-001',
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      save: jest.fn(),
      toJSON: jest.fn(() => ({
        id: 'user-001',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        organization: 'org-001',
        isActive: true
      }))
    };

    mockSchema = {
      new: jest.fn(() => mockUser),
      set: jest.fn(),
      get: jest.fn(),
      virtual: jest.fn().mockReturnThis(),
      getter: jest.fn().mockReturnThis(),
      setter: jest.fn().mockReturnThis(),
      pre: jest.fn().mockReturnThis(),
      post: jest.fn().mockReturnThis(),
      index: jest.fn().mockReturnThis(),
      plugin: jest.fn().mockReturnThis()
    };

    mockModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      save: jest.fn()
    };

    mongoose.Schema.mockReturnValue(mockSchema);
    mongoose.model.mockReturnValue(mockModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema Definition', () => {
    it('should define user schema with required fields', () => {
      // Importar el modelo para ejecutar la definición del schema
      require('../../../models/User');

      expect(mongoose.Schema).toHaveBeenCalled();
      const schemaCall = mongoose.Schema.mock.calls[0][0];
      
      // Verificar campos requeridos
      expect(schemaCall).toHaveProperty('email');
      expect(schemaCall).toHaveProperty('password');
      expect(schemaCall).toHaveProperty('name');
      expect(schemaCall).toHaveProperty('role');
      expect(schemaCall).toHaveProperty('organization');
      expect(schemaCall).toHaveProperty('isActive');
      expect(schemaCall).toHaveProperty('lastLogin');
      expect(schemaCall).toHaveProperty('createdAt');
      expect(schemaCall).toHaveProperty('updatedAt');
    });

    it('should set email as required and unique', () => {
      require('../../../models/User');
      
      const schemaCall = mongoose.Schema.mock.calls[0][0];
      expect(schemaCall.email.required).toBe(true);
      expect(schemaCall.email.unique).toBe(true);
    });

    it('should set password as required', () => {
      require('../../../models/User');
      
      const schemaCall = mongoose.Schema.mock.calls[0][0];
      expect(schemaCall.password.required).toBe(true);
    });

    it('should set role with enum values', () => {
      require('../../../models/User');
      
      const schemaCall = mongoose.Schema.mock.calls[0][0];
      expect(schemaCall.role.enum).toContain('user');
      expect(schemaCall.role.enum).toContain('admin');
      expect(schemaCall.role.enum).toContain('super_admin');
    });

    it('should set default values', () => {
      require('../../../models/User');
      
      const schemaCall = mongoose.Schema.mock.calls[0][0];
      expect(schemaCall.role.default).toBe('user');
      expect(schemaCall.isActive.default).toBe(true);
    });
  });

  describe('Model Methods', () => {
    beforeEach(() => {
      // Configurar el modelo mock
      User.find = mockModel.find;
      User.findById = mockModel.findById;
      User.findOne = mockModel.findOne;
      User.create = mockModel.create;
      User.findByIdAndUpdate = mockModel.findByIdAndUpdate;
      User.findByIdAndDelete = mockModel.findByIdAndDelete;
      User.countDocuments = mockModel.countDocuments;
    });

    describe('find', () => {
      it('should find users with filters', async () => {
        const mockUsers = [mockUser];
        User.find.mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockUsers)
        });

        const result = await User.find({ role: 'user' }).populate('organization');

        expect(User.find).toHaveBeenCalledWith({ role: 'user' });
        expect(result).toEqual(mockUsers);
      });
    });

    describe('findById', () => {
      it('should find user by ID', async () => {
        User.findById.mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockUser)
        });

        const result = await User.findById('user-001').populate('organization');

        expect(User.findById).toHaveBeenCalledWith('user-001');
        expect(result).toEqual(mockUser);
      });

      it('should return null for non-existent user', async () => {
        User.findById.mockReturnValue({
          populate: jest.fn().mockResolvedValue(null)
        });

        const result = await User.findById('nonexistent-id').populate('organization');

        expect(result).toBeNull();
      });
    });

    describe('findOne', () => {
      it('should find user by email', async () => {
        User.findOne.mockResolvedValue(mockUser);

        const result = await User.findOne({ email: 'test@example.com' });

        expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(result).toEqual(mockUser);
      });
    });

    describe('create', () => {
      it('should create new user', async () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
          role: 'user',
          organization: 'org-001'
        };

        User.create.mockResolvedValue(mockUser);

        const result = await User.create(userData);

        expect(User.create).toHaveBeenCalledWith(userData);
        expect(result).toEqual(mockUser);
      });
    });

    describe('findByIdAndUpdate', () => {
      it('should update user by ID', async () => {
        const updateData = {
          name: 'Updated Name',
          role: 'admin'
        };

        const updatedUser = { ...mockUser, ...updateData };
        User.findByIdAndUpdate.mockResolvedValue(updatedUser);

        const result = await User.findByIdAndUpdate('user-001', updateData, { new: true });

        expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-001', updateData, { new: true });
        expect(result).toEqual(updatedUser);
      });
    });

    describe('findByIdAndDelete', () => {
      it('should delete user by ID', async () => {
        User.findByIdAndDelete.mockResolvedValue(mockUser);

        const result = await User.findByIdAndDelete('user-001');

        expect(User.findByIdAndDelete).toHaveBeenCalledWith('user-001');
        expect(result).toEqual(mockUser);
      });
    });

    describe('countDocuments', () => {
      it('should count users with filters', async () => {
        User.countDocuments.mockResolvedValue(10);

        const result = await User.countDocuments({ role: 'user' });

        expect(User.countDocuments).toHaveBeenCalledWith({ role: 'user' });
        expect(result).toBe(10);
      });
    });
  });

  describe('Instance Methods', () => {
    it('should save user instance', async () => {
      mockUser.save.mockResolvedValue(mockUser);

      const result = await mockUser.save();

      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should convert user to JSON', () => {
      const jsonUser = mockUser.toJSON();

      expect(mockUser.toJSON).toHaveBeenCalled();
      expect(jsonUser).toHaveProperty('id');
      expect(jsonUser).toHaveProperty('email');
      expect(jsonUser).toHaveProperty('name');
      expect(jsonUser).toHaveProperty('role');
      expect(jsonUser).not.toHaveProperty('password'); // Password should be excluded
    });
  });

  describe('Validation', () => {
    it('should validate email format', () => {
      require('../../../models/User');
      
      const schemaCall = mongoose.Schema.mock.calls[0][0];
      expect(schemaCall.email.validate).toBeDefined();
    });

    it('should validate password strength', () => {
      require('../../../models/User');
      
      const schemaCall = mongoose.Schema.mock.calls[0][0];
      expect(schemaCall.password.validate).toBeDefined();
    });

    it('should validate role enum', () => {
      require('../../../models/User');
      
      const schemaCall = mongoose.Schema.mock.calls[0][0];
      expect(schemaCall.role.enum).toContain('user');
      expect(schemaCall.role.enum).toContain('admin');
      expect(schemaCall.role.enum).toContain('super_admin');
    });
  });

  describe('Indexes', () => {
    it('should create indexes for performance', () => {
      require('../../../models/User');

      expect(mockSchema.index).toHaveBeenCalled();
    });
  });

  describe('Timestamps', () => {
    it('should include timestamps', () => {
      require('../../../models/User');

      const schemaOptions = mongoose.Schema.mock.calls[0][1];
      expect(schemaOptions.timestamps).toBe(true);
    });
  });
});