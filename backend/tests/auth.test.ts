import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import app from '../src/index'
import { User } from '../src/models/User'
import { Organization } from '../src/models/Organization'

describe('Authentication Endpoints', () => {
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri)
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer.stop()
  })

  beforeEach(async () => {
    // Clean database before each test
    await User.deleteMany({})
    await Organization.deleteMany({})
  })

  describe('POST /auth/register', () => {
    const validRegistrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
      organizationName: 'Test Organization',
      phone: '+1234567890'
    }

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
        data: {
          user: {
            id: expect.any(String),
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'admin'
          },
          organization: {
            id: expect.any(String),
            name: 'Test Organization'
          }
        }
      })

      // Verify user was created in database
      const user = await User.findOne({ email: 'john.doe@example.com' })
      expect(user).toBeTruthy()
      expect(user?.firstName).toBe('John')
      expect(user?.lastName).toBe('Doe')

      // Verify password was hashed
      expect(user?.password).not.toBe('SecurePass123!')
      const isPasswordValid = await bcrypt.compare('SecurePass123!', user!.password)
      expect(isPasswordValid).toBe(true)

      // Verify organization was created
      const organization = await Organization.findById(user?.organization_id)
      expect(organization).toBeTruthy()
      expect(organization?.name).toBe('Test Organization')
    })

    it('should reject registration with invalid email', async () => {
      const invalidData = {
        ...validRegistrationData,
        email: 'invalid-email'
      }

      const response = await request(app)
        .post('/auth/register')
        .send(invalidData)
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('email')
      })
    })

    it('should reject registration with weak password', async () => {
      const invalidData = {
        ...validRegistrationData,
        password: '123'
      }

      const response = await request(app)
        .post('/auth/register')
        .send(invalidData)
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('password')
      })
    })

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(201)

      // Second registration with same email
      const response = await request(app)
        .post('/auth/register')
        .send(validRegistrationData)
        .expect(409)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('email')
      })
    })

    it('should require all mandatory fields', async () => {
      const incompleteData = {
        firstName: 'John',
        email: 'john@example.com'
        // Missing lastName, password, organizationName
      }

      const response = await request(app)
        .post('/auth/register')
        .send(incompleteData)
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /auth/login', () => {
    let testUser: any
    let testOrganization: any

    beforeEach(async () => {
      // Create test organization
      testOrganization = await Organization.create({
        name: 'Test Organization',
        plan: 'basic',
        status: 'active'
      })

      // Create test user
      const hashedPassword = await bcrypt.hash('SecurePass123!', 12)
      testUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        role: 'admin',
        organization_id: testOrganization._id,
        isActive: true,
        isEmailVerified: true
      })
    })

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
        data: {
          user: {
            id: testUser._id.toString(),
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'admin',
            organization_id: testOrganization._id.toString()
          },
          tokens: {
            accessToken: expect.any(String),
            refreshToken: expect.any(String)
          }
        }
      })

      // Verify JWT token
      const decoded = jwt.verify(
        response.body.data.tokens.accessToken,
        process.env.JWT_SECRET!
      ) as any
      expect(decoded.userId).toBe(testUser._id.toString())
    })

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!'
        })
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Invalid')
      })
    })

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'WrongPassword'
        })
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Invalid')
      })
    })

    it('should reject login for inactive user', async () => {
      await User.findByIdAndUpdate(testUser._id, { isActive: false })

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'SecurePass123!'
        })
        .expect(403)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('inactive')
      })
    })

    it('should require email and password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com'
          // Missing password
        })
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /auth/verify', () => {
    let testUser: any
    let validToken: string

    beforeEach(async () => {
      // Create test organization
      const testOrganization = await Organization.create({
        name: 'Test Organization',
        plan: 'basic'
      })

      // Create test user
      testUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('SecurePass123!', 12),
        role: 'admin',
        organization_id: testOrganization._id,
        isActive: true
      })

      // Generate valid token
      validToken = jwt.sign(
        { userId: testUser._id, organizationId: testOrganization._id },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      )
    })

    it('should verify valid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            id: testUser._id.toString(),
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: 'admin'
          }
        }
      })
    })

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('token')
      })
    })

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Invalid')
      })
    })

    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' } // Expired 1 hour ago
      )

      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('expired')
      })
    })
  })

  describe('POST /auth/refresh', () => {
    let testUser: any
    let validRefreshToken: string

    beforeEach(async () => {
      // Create test organization
      const testOrganization = await Organization.create({
        name: 'Test Organization',
        plan: 'basic'
      })

      // Create test user
      testUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('SecurePass123!', 12),
        role: 'admin',
        organization_id: testOrganization._id,
        isActive: true
      })

      // Generate valid refresh token
      validRefreshToken = jwt.sign(
        { userId: testUser._id, type: 'refresh' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      )
    })

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          accessToken: expect.any(String)
        }
      })

      // Verify new access token
      const decoded = jwt.verify(
        response.body.data.accessToken,
        process.env.JWT_SECRET!
      ) as any
      expect(decoded.userId).toBe(testUser._id.toString())
    })

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('Invalid')
      })
    })

    it('should require refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({})
        .expect(400)

      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /auth/logout', () => {
    let testUser: any
    let validToken: string

    beforeEach(async () => {
      // Create test organization
      const testOrganization = await Organization.create({
        name: 'Test Organization',
        plan: 'basic'
      })

      // Create test user
      testUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: await bcrypt.hash('SecurePass123!', 12),
        role: 'admin',
        organization_id: testOrganization._id,
        isActive: true
      })

      // Generate valid token
      validToken = jwt.sign(
        { userId: testUser._id },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      )
    })

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String)
      })
    })

    it('should handle logout without token gracefully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200) // Should still return success

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String)
      })
    })
  })

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/auth/login')
          .send(loginData)
      }

      // Next attempt should be rate limited
      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(429)

      expect(response.body).toMatchObject({
        success: false,
        message: expect.stringContaining('rate limit')
      })
    }, 10000) // Increase timeout for this test
  })

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .expect(401) // Will fail auth but we can check headers

      expect(response.headers['x-content-type-options']).toBe('nosniff')
      expect(response.headers['x-frame-options']).toBe('DENY')
      expect(response.headers['x-xss-protection']).toBe('1; mode=block')
    })
  })
})