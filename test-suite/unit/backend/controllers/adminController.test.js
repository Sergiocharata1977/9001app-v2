const request = require('supertest');

// Mock de las dependencias
jest.mock('../../models/User');
jest.mock('../../models/Organization');
jest.mock('../../middleware/auth');

const { User } = require('../../models/User');
const { Organization } = require('../../models/Organization');

describe('AdminController', () => {
  let app;
  let mockUser;
  let mockOrganization;

  beforeEach(() => {
    // Configurar mocks
    mockUser = {
      id: 'user-001',
      email: 'admin@example.com',
      role: 'admin',
      name: 'Admin User',
      isActive: true,
      organization: 'org-001',
      save: jest.fn(),
      toJSON: jest.fn(() => ({
        id: 'user-001',
        email: 'admin@example.com',
        role: 'admin',
        name: 'Admin User',
        isActive: true,
        organization: 'org-001'
      }))
    };

    mockOrganization = {
      id: 'org-001',
      name: 'Test Organization',
      description: 'Test organization description',
      isActive: true,
      save: jest.fn(),
      toJSON: jest.fn(() => ({
        id: 'org-001',
        name: 'Test Organization',
        description: 'Test organization description',
        isActive: true
      }))
    };

    // Mock de métodos estáticos
    User.find = jest.fn();
    User.findById = jest.fn();
    User.findByIdAndUpdate = jest.fn();
    User.findByIdAndDelete = jest.fn();
    User.countDocuments = jest.fn();
    Organization.find = jest.fn();
    Organization.findById = jest.fn();
    Organization.create = jest.fn();
    Organization.findByIdAndUpdate = jest.fn();
    Organization.findByIdAndDelete = jest.fn();

    // Crear app de Express para testing
    app = require('express')();
    app.use(require('express').json());
    
    // Importar rutas de admin
    const adminRoutes = require('../../routes/admin');
    app.use('/api/admin', adminRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/dashboard', () => {
    it('should return dashboard statistics for admin', async () => {
      // Configurar mocks
      User.countDocuments.mockResolvedValue(10);
      Organization.countDocuments = jest.fn().mockResolvedValue(5);

      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('totalOrganizations');
      expect(response.body.totalUsers).toBe(10);
      expect(response.body.totalOrganizations).toBe(5);
    });

    it('should return error for non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer user-token')
        .expect(403);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return all users for admin', async () => {
      const mockUsers = [mockUser];
      User.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUsers)
      });

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body.users).toHaveLength(1);
      expect(User.find).toHaveBeenCalled();
    });

    it('should support pagination', async () => {
      const mockUsers = [mockUser];
      User.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockUsers)
          })
        })
      });

      const response = await request(app)
        .get('/api/admin/users?page=1&limit=10')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('users');
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should return specific user by ID', async () => {
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });

      const response = await request(app)
        .get('/api/admin/users/user-001')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe('user-001');
    });

    it('should return 404 for non-existent user', async () => {
      User.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app)
        .get('/api/admin/users/nonexistent-id')
        .set('Authorization', 'Bearer admin-token')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('User not found');
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        role: 'user',
        isActive: true
      };

      User.findByIdAndUpdate.mockResolvedValue({
        ...mockUser,
        ...updateData
      });

      const response = await request(app)
        .put('/api/admin/users/user-001')
        .set('Authorization', 'Bearer admin-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.name).toBe(updateData.name);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-001',
        updateData,
        { new: true }
      );
    });

    it('should validate update data', async () => {
      const invalidData = {
        email: 'invalid-email',
        role: 'invalid-role'
      };

      const response = await request(app)
        .put('/api/admin/users/user-001')
        .set('Authorization', 'Bearer admin-token')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user successfully', async () => {
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      const response = await request(app)
        .delete('/api/admin/users/user-001')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user-001');
    });

    it('should return 404 for non-existent user', async () => {
      User.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/admin/users/nonexistent-id')
        .set('Authorization', 'Bearer admin-token')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('User not found');
    });
  });

  describe('GET /api/admin/organizations', () => {
    it('should return all organizations for admin', async () => {
      const mockOrganizations = [mockOrganization];
      Organization.find.mockResolvedValue(mockOrganizations);

      const response = await request(app)
        .get('/api/admin/organizations')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('organizations');
      expect(response.body.organizations).toHaveLength(1);
    });
  });

  describe('POST /api/admin/organizations', () => {
    it('should create new organization successfully', async () => {
      const orgData = {
        name: 'New Organization',
        description: 'New organization description',
        address: '123 New Street',
        phone: '+1234567890',
        email: 'info@neworg.com'
      };

      Organization.create.mockResolvedValue({
        ...mockOrganization,
        ...orgData
      });

      const response = await request(app)
        .post('/api/admin/organizations')
        .set('Authorization', 'Bearer admin-token')
        .send(orgData)
        .expect(201);

      expect(response.body).toHaveProperty('organization');
      expect(response.body.organization.name).toBe(orgData.name);
      expect(Organization.create).toHaveBeenCalledWith(orgData);
    });

    it('should validate organization data', async () => {
      const invalidData = {
        name: '', // Empty name
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/admin/organizations')
        .set('Authorization', 'Bearer admin-token')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/admin/organizations/:id', () => {
    it('should update organization successfully', async () => {
      const updateData = {
        name: 'Updated Organization',
        description: 'Updated description'
      };

      Organization.findByIdAndUpdate.mockResolvedValue({
        ...mockOrganization,
        ...updateData
      });

      const response = await request(app)
        .put('/api/admin/organizations/org-001')
        .set('Authorization', 'Bearer admin-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('organization');
      expect(response.body.organization.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/admin/organizations/:id', () => {
    it('should delete organization successfully', async () => {
      Organization.findByIdAndDelete.mockResolvedValue(mockOrganization);

      const response = await request(app)
        .delete('/api/admin/organizations/org-001')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');
    });
  });

  describe('GET /api/admin/analytics', () => {
    it('should return analytics data for admin', async () => {
      // Mock de datos de analytics
      const mockAnalytics = {
        userGrowth: [10, 15, 20, 25],
        organizationGrowth: [5, 8, 12, 15],
        activeUsers: 85,
        totalOrganizations: 15
      };

      const response = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body).toHaveProperty('analytics');
    });
  });
});