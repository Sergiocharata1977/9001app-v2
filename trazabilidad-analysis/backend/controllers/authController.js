const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// Unificar secreto con el usado en middlewares
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

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
    
    // Conectar a MongoDB y buscar usuario
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
    const usersCollection = db.collection('users');
    
    // Buscar usuario por email
    const user = await usersCollection.findOne({ email: email });
    
    console.log('📊 Resultado de búsqueda:', user ? 'Usuario encontrado' : 'Usuario no encontrado');
    
    if (!user) {
      await client.close();
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Buscar datos de la organización si existe
    let organizationData = null;
    let organizationStats = {
      personalCount: 0,
      departamentosCount: 0,
      puestosCount: 0
    };
    
    if (user.organization_id) {
      const organizationsCollection = db.collection('organizations');
      organizationData = await organizationsCollection.findOne({ 
        id: user.organization_id 
      });
      
      // Obtener estadísticas de la organización
      if (organizationData) {
        const personalCollection = db.collection('personal');
        const departamentosCollection = db.collection('departamentos');
        const puestosCollection = db.collection('puestos');
        
        organizationStats.personalCount = await personalCollection.countDocuments({ 
          organization_id: user.organization_id 
        });
        organizationStats.departamentosCount = await departamentosCollection.countDocuments({ 
          organization_id: user.organization_id 
        });
        organizationStats.puestosCount = await puestosCollection.countDocuments({ 
          organization_id: user.organization_id 
        });
      }
    }
    
    console.log('✅ Usuario encontrado:', { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      organization: organizationData?.name || 'N/A'
    });

    // Verificar contraseña
    console.log('🔐 Verificando contraseña...');
    const isValidPassword = await bcrypt.compare(password, user.password_hash || '');
    console.log('✅ Contraseña válida:', isValidPassword);
    
    if (!isValidPassword) {
      await client.close();
      console.log('❌ Contraseña inválida');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar tokens usando el ObjectId de MongoDB
    const accessToken = jwt.sign(
      { 
        userId: user._id.toString(), 
        organizationId: user.organization_id, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { 
        userId: user._id.toString(), 
        type: 'refresh' 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Preparar respuesta del usuario (sin password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organization_id: user.organization_id,
      organization_name: organizationData?.name || 'Sin organización',
      organization_code: organizationData?.id || null,
      organization_plan: organizationData?.plan || 'basic',
      organization_active: organizationData?.is_active || false,
      organization_stats: organizationStats,
      is_admin: user.role === 'admin',
      is_active: user.is_active || true
    };

    await client.close();
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