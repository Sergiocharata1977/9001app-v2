const Agent = require('../models/Agent');
const Organization = require('../models/Organization');

// Middleware de autenticación para agentes
const agentAuthMiddleware = async (req, res, next) => {
  try {
    console.log('🤖 DEBUG - agentAuthMiddleware llamado para:', req.path);
    
    // Obtener API key del header
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
      console.log('❌ DEBUG - API key no proporcionada');
      return res.status(401).json({ 
        success: false,
        message: 'API key requerida para acceso de agente.' 
      });
    }

    console.log('🔑 DEBUG - API key proporcionada:', apiKey.substring(0, 10) + '...');

    // Buscar agente por API key
    const agent = await Agent.findOne({ 
      apiKey: apiKey,
      isActive: true,
      status: 'active'
    }).populate('organization_id');

    if (!agent) {
      console.log('❌ DEBUG - Agente no encontrado o inactivo');
      return res.status(401).json({ 
        success: false,
        message: 'API key inválida o agente inactivo.' 
      });
    }

    console.log('🤖 Agente autenticado:', agent.name, 'Tipo:', agent.type);

    // Verificar si la organización está activa
    if (!agent.organization_id || !agent.organization_id.isActive) {
      console.log('❌ DEBUG - Organización inactiva');
      return res.status(403).json({ 
        success: false,
        message: 'Organización inactiva o no válida.' 
      });
    }

    // Agregar información del agente al request
    req.agent = agent;
    req.organization = agent.organization_id;
    
    console.log('✅ DEBUG - Agente agregado a req.agent');
    next();

  } catch (error) {
    console.error('❌ DEBUG - Error en agentAuthMiddleware:', error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor.' 
    });
  }
};

// Middleware para verificar permisos específicos
const agentPermissionMiddleware = (resource, action) => {
  return (req, res, next) => {
    try {
      const agent = req.agent;
      
      if (!agent) {
        return res.status(401).json({ 
          success: false,
          message: 'Agente no autenticado.' 
        });
      }

      if (!agent.hasPermission(resource, action)) {
        console.log(`❌ DEBUG - Agente ${agent.name} no tiene permiso ${action} en ${resource}`);
        return res.status(403).json({ 
          success: false,
          message: `Permiso insuficiente: ${action} en ${resource}` 
        });
      }

      console.log(`✅ DEBUG - Permiso ${action} en ${resource} verificado para agente ${agent.name}`);
      next();
    } catch (error) {
      console.error('❌ DEBUG - Error en agentPermissionMiddleware:', error.message);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor.' 
      });
    }
  };
};

// Middleware para verificar capacidades específicas
const agentCapabilityMiddleware = (capability) => {
  return (req, res, next) => {
    try {
      const agent = req.agent;
      
      if (!agent) {
        return res.status(401).json({ 
          success: false,
          message: 'Agente no autenticado.' 
        });
      }

      if (!agent.hasCapability(capability)) {
        console.log(`❌ DEBUG - Agente ${agent.name} no tiene capacidad ${capability}`);
        return res.status(403).json({ 
          success: false,
          message: `Capacidad requerida: ${capability}` 
        });
      }

      console.log(`✅ DEBUG - Capacidad ${capability} verificada para agente ${agent.name}`);
      next();
    } catch (error) {
      console.error('❌ DEBUG - Error en agentCapabilityMiddleware:', error.message);
      return res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor.' 
      });
    }
  };
};

// Middleware para rate limiting por agente
const agentRateLimitMiddleware = async (req, res, next) => {
  try {
    const agent = req.agent;
    
    if (!agent) {
      return res.status(401).json({ 
        success: false,
        message: 'Agente no autenticado.' 
      });
    }

    const now = Date.now();
    const windowStart = now - agent.config.rateLimit.window;
    
    // Aquí podrías implementar un sistema de rate limiting más sofisticado
    // Por ahora, solo verificamos que el agente esté activo
    if (agent.status !== 'active') {
      return res.status(429).json({ 
        success: false,
        message: 'Agente no disponible temporalmente.' 
      });
    }

    console.log(`✅ DEBUG - Rate limit verificado para agente ${agent.name}`);
    next();
  } catch (error) {
    console.error('❌ DEBUG - Error en agentRateLimitMiddleware:', error.message);
    return res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor.' 
    });
  }
};

module.exports = {
  agentAuthMiddleware,
  agentPermissionMiddleware,
  agentCapabilityMiddleware,
  agentRateLimitMiddleware
};