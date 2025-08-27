const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const { 
  agentAuthMiddleware, 
  agentPermissionMiddleware, 
  agentCapabilityMiddleware,
  agentRateLimitMiddleware 
} = require('../middleware/agentAuthMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas (sin autenticación)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API de agentes funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas protegidas por autenticación de agentes
router.use(agentAuthMiddleware);
router.use(agentRateLimitMiddleware);

// Rutas para gestión de agentes (requieren permisos de administración)
router.get('/agents', 
  agentPermissionMiddleware('system', 'read'),
  agentController.getAllAgents
);

router.get('/agents/stats', 
  agentPermissionMiddleware('system', 'read'),
  agentController.getAgentStats
);

router.get('/agents/type/:type', 
  agentPermissionMiddleware('system', 'read'),
  agentController.getAgentsByType
);

router.get('/agents/:id', 
  agentPermissionMiddleware('system', 'read'),
  agentController.getAgentById
);

router.get('/agents/:id/metrics', 
  agentPermissionMiddleware('system', 'read'),
  agentController.getAgentMetrics
);

// Rutas que requieren permisos de escritura
router.post('/agents', 
  agentPermissionMiddleware('system', 'create'),
  agentController.createAgent
);

router.put('/agents/:id', 
  agentPermissionMiddleware('system', 'update'),
  agentController.updateAgent
);

router.put('/agents/:id/health', 
  agentCapabilityMiddleware('system_monitoring'),
  agentController.updateAgentHealth
);

router.post('/agents/:id/regenerate-key', 
  agentPermissionMiddleware('system', 'update'),
  agentController.regenerateApiKey
);

router.delete('/agents/:id', 
  agentPermissionMiddleware('system', 'delete'),
  agentController.deleteAgent
);

// Rutas específicas para cada tipo de agente
router.get('/coordinator/status', 
  agentCapabilityMiddleware('system_monitoring'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Estado del coordinador obtenido',
      data: {
        agent: req.agent.name,
        type: req.agent.type,
        status: req.agent.status,
        lastActivity: req.agent.metrics.lastActivity
      }
    });
  }
);

router.get('/database/status', 
  agentCapabilityMiddleware('database_operations'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Estado de la base de datos obtenido',
      data: {
        agent: req.agent.name,
        type: req.agent.type,
        status: req.agent.status,
        capabilities: req.agent.capabilities
      }
    });
  }
);

router.get('/frontend/status', 
  agentCapabilityMiddleware('document_management'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Estado del frontend obtenido',
      data: {
        agent: req.agent.name,
        type: req.agent.type,
        status: req.agent.status,
        capabilities: req.agent.capabilities
      }
    });
  }
);

router.get('/tester/status', 
  agentCapabilityMiddleware('system_monitoring'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Estado del tester obtenido',
      data: {
        agent: req.agent.name,
        type: req.agent.type,
        status: req.agent.status,
        capabilities: req.agent.capabilities
      }
    });
  }
);

router.get('/documenter/status', 
  agentCapabilityMiddleware('document_management'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Estado del documentador obtenido',
      data: {
        agent: req.agent.name,
        type: req.agent.type,
        status: req.agent.status,
        capabilities: req.agent.capabilities
      }
    });
  }
);

router.get('/deployer/status', 
  agentCapabilityMiddleware('backup_operations'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Estado del desplegador obtenido',
      data: {
        agent: req.agent.name,
        type: req.agent.type,
        status: req.agent.status,
        capabilities: req.agent.capabilities
      }
    });
  }
);

router.get('/rehabilitator/status', 
  agentCapabilityMiddleware('system_monitoring'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Estado del rehabilitador obtenido',
      data: {
        agent: req.agent.name,
        type: req.agent.type,
        status: req.agent.status,
        capabilities: req.agent.capabilities
      }
    });
  }
);

// Rutas para comunicación entre agentes
router.post('/agents/:id/notify', 
  agentCapabilityMiddleware('api_management'),
  (req, res) => {
    const { id } = req.params;
    const { message, type, data } = req.body;
    
    console.log(`🤖 Notificación enviada al agente ${id}:`, { message, type, data });
    
    res.json({
      success: true,
      message: 'Notificación enviada exitosamente',
      data: {
        recipient: id,
        sender: req.agent.name,
        timestamp: new Date().toISOString()
      }
    });
  }
);

// Rutas para sincronización de datos
router.post('/agents/:id/sync', 
  agentCapabilityMiddleware('database_operations'),
  (req, res) => {
    const { id } = req.params;
    const { data, operation } = req.body;
    
    console.log(`🔄 Sincronización solicitada con agente ${id}:`, { operation, dataSize: data ? Object.keys(data).length : 0 });
    
    res.json({
      success: true,
      message: 'Sincronización iniciada',
      data: {
        targetAgent: id,
        operation,
        timestamp: new Date().toISOString()
      }
    });
  }
);

// Rutas para reportes de actividad
router.post('/agents/:id/activity', 
  agentCapabilityMiddleware('system_monitoring'),
  (req, res) => {
    const { id } = req.params;
    const { activity, duration, success, details } = req.body;
    
    console.log(`📊 Actividad reportada del agente ${id}:`, { activity, duration, success });
    
    res.json({
      success: true,
      message: 'Actividad registrada exitosamente',
      data: {
        agent: id,
        activity,
        duration,
        success,
        timestamp: new Date().toISOString()
      }
    });
  }
);

// Manejo de errores específicos para rutas de agentes
router.use((err, req, res, next) => {
  console.error('❌ Error en rutas de agentes:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor de agentes'
  });
});

module.exports = router;