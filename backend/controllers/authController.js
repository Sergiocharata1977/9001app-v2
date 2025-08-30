const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoClient = require('../lib/mongoClient.js');

// Unificar secreto con el usado en middlewares
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, organization_id } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await mongoClient.execute({
      sql: 'SELECT id FROM usuarios WHERE email = ?',
      args: [email]
    });

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const result = await mongoClient.execute({
      sql: `INSERT INTO usuarios (name, email, password_hash, role, organization_id, is_active, created_at) 
            VALUES (?, ?, ?, ?, ?, 1, NOW())`,
      args: [name, email, passwordHash, 'user', organization_id || 1]
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente'
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    console.log('🔍 Buscando usuario con email:', email);
    
    // Buscar usuario en MongoDB
    await mongoClient.connect();
    const usersCollection = mongoClient.collection('users');
    const organizationsCollection = mongoClient.collection('organizations');
    
    const mongoUser = await usersCollection.findOne({ 
      email: email, 
      is_active: true 
    });
    
    let user = null;
    if (mongoUser) {
      // Obtener información de la organización
      const organization = await organizationsCollection.findOne({ 
        id: mongoUser.organization_id 
      });
      
      user = {
        id: mongoUser._id || mongoUser.id,
        name: mongoUser.name,
        email: mongoUser.email,
        password_hash: mongoUser.password_hash,
        role: mongoUser.role,
        organization_id: mongoUser.organization_id,
        organization_name: organization ? organization.name : '9001app Demo',
        organization_plan: organization ? organization.plan : 'premium'
      };
    } else {
      // Fallback a datos mock si MongoDB no funciona
      console.log('⚠️ Usuario no encontrado en MongoDB, usando fallback mock');
      const mockUsers = [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@9001app.com',
          password_hash: '$2a$10$Q/mCA/vbLgdt340VS.QsQeUBZ9N6wLUW47au8Pf1WbIrNliBAbhLC', // admin123
          role: 'admin',
          organization_id: 1,
          organization_name: '9001app Demo',
          organization_plan: 'premium'
        },
        {
          id: 2,
          name: 'Super Admin',
          email: 'superadmin@9001app.com',
          password_hash: '$2a$10$Q/mCA/vbLgdt340VS.QsQeUBZ9N6wLUW47au8Pf1WbIrNliBAbhLC', // admin123
          role: 'super_admin',
          organization_id: 1,
          organization_name: '9001app Demo',
          organization_plan: 'premium'
        }
      ];
      user = mockUsers.find(u => u.email === email);
    }
    
    console.log('📊 Resultado de búsqueda:', user ? 'Usuario encontrado' : 'Usuario no encontrado');

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    console.log('✅ Usuario encontrado:', { id: user.id, email: user.email, role: user.role });

    // Verificar contraseña
    console.log('🔐 Verificando contraseña...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash || '');
    console.log('✅ Contraseña válida:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Contraseña inválida');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar tokens
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        organizationId: user.organization_id, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { 
        userId: user.id, 
        type: 'refresh' 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Preparar respuesta del usuario (sin password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
      organization_name: user.organization_name || 'Sin organización',
      organization_plan: user.organization_plan || 'basic'
    };

    console.log('🎉 Login exitoso para:', user.email);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userResponse,
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Verificar token
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    // El middleware ya verificó el token y agregó el usuario
    const user = req.user;
    
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization_id: user.organization_id,
          organization_name: user.organization_name,
          organization_plan: user.organization_plan
        }
      }
    });

  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Renovar token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Obtener usuario
    const userResult = await mongoClient.execute({
      sql: 'SELECT id, name, email, role, organization_id FROM usuarios WHERE id = ? AND is_active = 1',
      args: [decoded.userId]
    });

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult.rows[0];

    // Generar nuevo access token
    const newAccessToken = jwt.sign(
      { 
        userId: user.id, 
        organizationId: user.organization_id, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Token renovado',
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    console.error('Error en renovación de token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// @desc    Cerrar sesión
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // En un sistema real, aquí invalidarías el refresh token
    // Por ahora, solo respondemos éxito
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  refreshToken,
  logout
}; 