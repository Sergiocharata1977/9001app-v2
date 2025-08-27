const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock de las dependencias
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../models/User');

const { User } = require('../../models/User');

describe('Login Security Tests', () => {
  let app;
  let mockUser;

  beforeEach(() => {
    // Configurar mocks
    mockUser = {
      id: 'user-001',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'user',
      isActive: true,
      loginAttempts: 0,
      lockUntil: null,
      lastLogin: new Date(),
      save: jest.fn(),
      toJSON: jest.fn(() => ({
        id: 'user-001',
        email: 'test@example.com',
        role: 'user',
        isActive: true
      }))
    };

    User.findOne = jest.fn();
    bcrypt.compare = jest.fn();
    jwt.sign = jest.fn();

    // Crear app de Express para testing
    app = require('express')();
    app.use(require('express').json());
    
    // Importar rutas de auth
    const authRoutes = require('../../routes/auth');
    app.use('/api/auth', authRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Security', () => {
    it('should prevent login with weak passwords', async () => {
      const weakPasswords = [
        '123',
        'password',
        '123456',
        'qwerty',
        'abc123',
        'password123',
        'admin',
        'letmein',
        'welcome',
        'monkey'
      ];

      for (const weakPassword of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: weakPassword
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('weak password');
      }
    });

    it('should enforce password complexity requirements', async () => {
      const invalidPasswords = [
        { password: 'short', reason: 'too short' },
        { password: 'nouppercase123!', reason: 'no uppercase' },
        { password: 'NOLOWERCASE123!', reason: 'no lowercase' },
        { password: 'NoNumbers!', reason: 'no numbers' },
        { password: 'NoSpecialChars123', reason: 'no special characters' }
      ];

      for (const { password, reason } of invalidPasswords) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: password
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('password requirements');
      }
    });

    it('should prevent common password attacks', async () => {
      const commonAttacks = [
        { email: 'admin@example.com', password: 'admin' },
        { email: 'root@example.com', password: 'root' },
        { email: 'test@example.com', password: 'test' },
        { email: 'user@example.com', password: 'user' }
      ];

      for (const attack of commonAttacks) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(attack)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('common password');
      }
    });
  });

  describe('Account Lockout', () => {
    it('should lock account after multiple failed attempts', async () => {
      // Configurar usuario con intentos previos
      mockUser.loginAttempts = 4;
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(423); // Locked

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('account locked');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should increment login attempts on failed login', async () => {
      mockUser.loginAttempts = 0;
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(mockUser.loginAttempts).toBe(1);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should reset login attempts on successful login', async () => {
      mockUser.loginAttempts = 3;
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('valid-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'correctpassword'
        })
        .expect(200);

      expect(mockUser.loginAttempts).toBe(0);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should unlock account after timeout period', async () => {
      // Configurar usuario bloqueado con tiempo expirado
      mockUser.loginAttempts = 5;
      mockUser.lockUntil = new Date(Date.now() - 3600000); // 1 hora atrás
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('valid-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'correctpassword'
        })
        .expect(200);

      expect(mockUser.loginAttempts).toBe(0);
      expect(mockUser.lockUntil).toBeNull();
    });
  });

  describe('Input Validation and Sanitization', () => {
    it('should prevent SQL injection attacks', async () => {
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --"
      ];

      for (const injection of sqlInjectionAttempts) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: injection,
            password: 'password123'
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('invalid input');
      }
    });

    it('should prevent XSS attacks', async () => {
      const xssAttempts = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src="x" onerror="alert(\'xss\')">',
        '"><script>alert("xss")</script>',
        '&#60;script&#62;alert("xss")&#60;/script&#62;'
      ];

      for (const xss of xssAttempts) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: xss,
            password: 'password123'
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('invalid input');
      }
    });

    it('should prevent NoSQL injection attacks', async () => {
      const nosqlInjectionAttempts = [
        { email: { $ne: '' }, password: 'password123' },
        { email: { $gt: '' }, password: 'password123' },
        { email: { $regex: '.*' }, password: 'password123' },
        { email: { $where: '1==1' }, password: 'password123' }
      ];

      for (const injection of nosqlInjectionAttempts) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(injection)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('invalid input');
      }
    });

    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example..com',
        'test@example',
        'test@.com',
        'test@example.',
        'test@example.com.',
        'test@example.com..'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: email,
            password: 'password123'
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('invalid email');
      }
    });

    it('should prevent email enumeration attacks', async () => {
      // Configurar para que no revele si un email existe o no
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      // El mensaje de error debe ser genérico, no específico
      expect(response.body.message).toBe('Invalid credentials');
      expect(response.body.message).not.toContain('user not found');
      expect(response.body.message).not.toContain('email not found');
    });
  });

  describe('Session Security', () => {
    it('should use secure session configuration', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      // Verificar headers de seguridad
      expect(response.headers['set-cookie']).toBeDefined();
      
      const cookies = response.headers['set-cookie'];
      const sessionCookie = cookies.find(cookie => cookie.includes('session'));
      
      if (sessionCookie) {
        expect(sessionCookie).toContain('HttpOnly');
        expect(sessionCookie).toContain('Secure');
        expect(sessionCookie).toContain('SameSite=Strict');
      }
    });

    it('should implement proper JWT token security', async () => {
      mockUser.loginAttempts = 0;
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('valid-jwt-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role
        }),
        process.env.JWT_SECRET,
        expect.objectContaining({
          expiresIn: expect.any(String),
          issuer: expect.any(String),
          audience: expect.any(String)
        })
      );
    });

    it('should prevent session fixation attacks', async () => {
      // Simular login con sesión existente
      const sessionId = 'existing-session-id';
      
      const response = await request(app)
        .post('/api/auth/login')
        .set('Cookie', `session=${sessionId}`)
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      // Verificar que se generó una nueva sesión
      const newCookies = response.headers['set-cookie'];
      const newSessionCookie = newCookies.find(cookie => cookie.includes('session'));
      
      expect(newSessionCookie).not.toContain(sessionId);
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting on login attempts', async () => {
      // Simular múltiples intentos de login rápidamente
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Verificar que al menos algunos requests fueron limitados
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should implement different rate limits for different IPs', async () => {
      const ip1 = '192.168.1.1';
      const ip2 = '192.168.1.2';

      // Intentos desde IP1
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .set('X-Forwarded-For', ip1)
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
      }

      // Verificar que IP2 no está limitada
      const response = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', ip2)
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).not.toBe(429);
    });
  });

  describe('Audit Logging', () => {
    it('should log failed login attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed login attempt')
      );

      consoleSpy.mockRestore();
    });

    it('should log successful logins', async () => {
      mockUser.loginAttempts = 0;
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('valid-token');

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'correctpassword'
        })
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successful login')
      );

      consoleSpy.mockRestore();
    });

    it('should log account lockouts', async () => {
      mockUser.loginAttempts = 4;
      User.findOne.mockResolvedValue(mockUser);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(423);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Account locked')
      );

      consoleSpy.mockRestore();
    });
  });
});