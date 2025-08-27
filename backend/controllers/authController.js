const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../lib/mongodbClient.js');

// @desc    Registrar una nueva organización y su usuario admin
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { 
      organizationName, 
      adminName, 
      adminEmail, 
      adminPassword,
      organizationEmail = '',
      organizationPhone = '',
      plan = 'basic'
    } = req.body;

    // Validaciones básicas
    if (!organizationName || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos' 
      });
    }

    // Verificar si la organización ya existe
    const existingOrg = await db.execute({
      sql: 'SELECT id FROM organizations WHERE name = ?',
      args: [organizationName]
    });

    if (existingOrg.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe una organización con ese nombre' 
      });
    }

    // Verificar si el email ya existe
    const existingUser = await db.execute({
      sql: 'SELECT id FROM usuarios WHERE email = ?',
      args: [adminEmail]
    });

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ya existe un usuario con ese email' 
      });
    }

    // Crear la organización
    const orgResult = await db.execute({
      sql: 'INSERT INTO organizations (name, email, phone, plan, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      args: [organizationName, organizationEmail, organizationPhone, plan]
    });

    const organizationId = Number(orgResult.lastInsertRowid);

    // Crear features básicas para la organización
    const basicFeatures = [
      'users_management',
      'documents_management', 
      'processes_management',
      'audits_management',
      'reports_basic'
    ];
    
    for (const feature of basicFeatures) {
      await db.execute({
        sql: 'INSERT INTO organization_features (organization_id, feature_name, is_enabled, created_at) VALUES (?, ?, 1, datetime("now"))',
        args: [organizationId, feature]
      });
    }
    console.log(`✅ Created ${basicFeatures.length} basic features for organization`);

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Crear el usuario admin
    const userResult = await db.execute({
      sql: 'INSERT INTO usuarios (name, email, password_hash, role, organization_id, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))',
      args: [adminName, adminEmail, hashedPassword, 'admin', organizationId]
    });

    const userId = Number(userResult.lastInsertRowid);

    // Generar tokens
    const accessToken = jwt.sign(
      { userId, organizationId, role: 'admin' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId, organizationId },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: '7d' }
    );

    // Guardar refresh token
    await db.execute({
      sql: 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, datetime("now", "+7 days"))',
      args: [userId, refreshToken]
    });

    res.status(201).json({
      success: true,
      message: 'Organización y usuario admin creados exitosamente',
      data: {
        user: {
          id: userId,
          name: adminName,
          email: adminEmail,
          role: 'admin'
        },
        organization: {
          id: organizationId,
          name: organizationName,
          plan
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
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

    // Buscar usuario
    const userResult = await db.execute({
      sql: `
        SELECT u.id, u.name, u.email, u.password_hash, u.role, u.organization_id,
               o.name as organization_name, o.plan as organization_plan
        FROM usuarios u
        JOIN organizations o ON u.organization_id = o.id
        WHERE u.email = ?
      `,
      args: [email]
    });

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
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
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, organizationId: user.organization_id },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: '7d' }
    );

    // Guardar refresh token
    await db.execute({
      sql: 'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, datetime("now", "+7 days"))',
      args: [user.id, refreshToken]
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: {
            id: user.organization_id,
            name: user.organization_name,
            plan: user.organization_plan
          }
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Renovar access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token es requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret');

    // Verificar que el token existe en la base de datos
    const tokenResult = await db.execute({
      sql: 'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime("now")',
      args: [token]
    });

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token inválido o expirado'
      });
    }

    // Generar nuevo access token
    const accessToken = jwt.sign(
      { 
        userId: decoded.userId, 
        organizationId: decoded.organizationId,
        role: decoded.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      data: {
        accessToken
      }
    });

  } catch (error) {
    console.error('Error en refresh token:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token inválido'
    });
  }
};

// @desc    Cerrar sesión
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      // Revocar refresh token
      await db.execute({
        sql: 'DELETE FROM refresh_tokens WHERE token = ?',
        args: [token]
      });
    }

    res.json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Obtener perfil del usuario
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await db.execute({
      sql: `
        SELECT u.id, u.name, u.email, u.role, u.organization_id,
               o.name as organization_name, o.plan as organization_plan
        FROM usuarios u
        JOIN organizations o ON u.organization_id = o.id
        WHERE u.id = ?
      `,
      args: [userId]
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult.rows[0];

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: {
            id: user.organization_id,
            name: user.organization_name,
            plan: user.organization_plan
          }
        }
      }
    });

  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// @desc    Verificar si el token es válido
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = async (req, res) => {
  try {
    // Si llegamos aquí, el middleware de autenticación ya validó el token
    res.json({ 
      success: true, 
      valid: true,
      user: req.user 
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ 
      success: false, 
      valid: false,
      message: 'Token inválido' 
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  verifyToken
}; 