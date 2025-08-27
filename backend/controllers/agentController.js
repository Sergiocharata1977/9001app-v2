const Agent = require('../models/Agent');
const Organization = require('../models/Organization');
const crypto = require('crypto');

class AgentController {
  // Crear nuevo agente
  async createAgent(req, res) {
    try {
      const {
        name,
        type,
        organization_id,
        capabilities,
        permissions,
        config
      } = req.body;

      // Validar datos requeridos
      if (!name || !type || !organization_id) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, tipo y organización son requeridos'
        });
      }

      // Verificar que la organización existe
      const organization = await Organization.findById(organization_id);
      if (!organization) {
        return res.status(404).json({
          success: false,
          message: 'Organización no encontrada'
        });
      }

      // Generar API key única
      const apiKey = crypto.randomBytes(32).toString('hex');

      // Crear agente
      const agent = new Agent({
        name,
        type,
        organization_id,
        apiKey,
        capabilities: capabilities || [],
        permissions: permissions || [],
        config: config || {}
      });

      await agent.save();

      console.log(`✅ Agente creado: ${agent.name} (${agent.type})`);

      res.status(201).json({
        success: true,
        message: 'Agente creado exitosamente',
        data: {
          id: agent._id,
          name: agent.name,
          type: agent.type,
          apiKey: agent.apiKey,
          status: agent.status
        }
      });

    } catch (error) {
      console.error('❌ Error creando agente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener todos los agentes
  async getAllAgents(req, res) {
    try {
      const { organization_id, type, status, page = 1, limit = 10 } = req.query;

      // Construir filtro
      const filter = { isActive: true };
      if (organization_id) filter.organization_id = organization_id;
      if (type) filter.type = type;
      if (status) filter.status = status;

      // Paginación
      const skip = (page - 1) * limit;

      const agents = await Agent.find(filter)
        .populate('organization_id', 'name')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Agent.countDocuments(filter);

      console.log(`✅ Agentes obtenidos: ${agents.length} de ${total}`);

      res.json({
        success: true,
        data: agents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo agentes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener agente por ID
  async getAgentById(req, res) {
    try {
      const { id } = req.params;

      const agent = await Agent.findById(id)
        .populate('organization_id', 'name description');

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agente no encontrado'
        });
      }

      console.log(`✅ Agente obtenido: ${agent.name}`);

      res.json({
        success: true,
        data: agent
      });

    } catch (error) {
      console.error('❌ Error obteniendo agente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar agente
  async updateAgent(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // No permitir actualizar API key desde aquí
      delete updateData.apiKey;

      const agent = await Agent.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('organization_id', 'name');

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agente no encontrado'
        });
      }

      console.log(`✅ Agente actualizado: ${agent.name}`);

      res.json({
        success: true,
        message: 'Agente actualizado exitosamente',
        data: agent
      });

    } catch (error) {
      console.error('❌ Error actualizando agente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar agente (soft delete)
  async deleteAgent(req, res) {
    try {
      const { id } = req.params;

      const agent = await Agent.findByIdAndUpdate(
        id,
        { isActive: false, status: 'inactive', updatedAt: new Date() },
        { new: true }
      );

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agente no encontrado'
        });
      }

      console.log(`✅ Agente eliminado: ${agent.name}`);

      res.json({
        success: true,
        message: 'Agente eliminado exitosamente'
      });

    } catch (error) {
      console.error('❌ Error eliminando agente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Regenerar API key
  async regenerateApiKey(req, res) {
    try {
      const { id } = req.params;

      const newApiKey = crypto.randomBytes(32).toString('hex');

      const agent = await Agent.findByIdAndUpdate(
        id,
        { 
          apiKey: newApiKey,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agente no encontrado'
        });
      }

      console.log(`✅ API key regenerada para: ${agent.name}`);

      res.json({
        success: true,
        message: 'API key regenerada exitosamente',
        data: {
          id: agent._id,
          name: agent.name,
          apiKey: agent.apiKey
        }
      });

    } catch (error) {
      console.error('❌ Error regenerando API key:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener métricas del agente
  async getAgentMetrics(req, res) {
    try {
      const { id } = req.params;

      const agent = await Agent.findById(id).select('name metrics health');

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agente no encontrado'
        });
      }

      console.log(`✅ Métricas obtenidas para: ${agent.name}`);

      res.json({
        success: true,
        data: {
          name: agent.name,
          metrics: agent.metrics,
          health: agent.health
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo métricas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar estado de salud del agente
  async updateAgentHealth(req, res) {
    try {
      const { id } = req.params;
      const healthData = req.body;

      const agent = await Agent.findByIdAndUpdate(
        id,
        { 
          health: { ...healthData, lastCheck: new Date() },
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agente no encontrado'
        });
      }

      console.log(`✅ Estado de salud actualizado para: ${agent.name}`);

      res.json({
        success: true,
        message: 'Estado de salud actualizado exitosamente',
        data: {
          name: agent.name,
          health: agent.health
        }
      });

    } catch (error) {
      console.error('❌ Error actualizando estado de salud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener agentes por tipo
  async getAgentsByType(req, res) {
    try {
      const { type } = req.params;
      const { organization_id } = req.query;

      const filter = { type, isActive: true };
      if (organization_id) filter.organization_id = organization_id;

      const agents = await Agent.find(filter)
        .populate('organization_id', 'name')
        .sort({ createdAt: -1 });

      console.log(`✅ Agentes de tipo ${type} obtenidos: ${agents.length}`);

      res.json({
        success: true,
        data: agents
      });

    } catch (error) {
      console.error('❌ Error obteniendo agentes por tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de agentes
  async getAgentStats(req, res) {
    try {
      const { organization_id } = req.query;

      const filter = { isActive: true };
      if (organization_id) filter.organization_id = organization_id;

      const stats = await Agent.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            },
            inactive: {
              $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
            },
            error: {
              $sum: { $cond: [{ $eq: ['$status', 'error'] }, 1, 0] }
            }
          }
        }
      ]);

      const totalAgents = await Agent.countDocuments(filter);
      const activeAgents = await Agent.countDocuments({ ...filter, status: 'active' });

      console.log(`✅ Estadísticas de agentes obtenidas`);

      res.json({
        success: true,
        data: {
          total: totalAgents,
          active: activeAgents,
          byType: stats
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = new AgentController();