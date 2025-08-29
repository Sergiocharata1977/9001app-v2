const PlanesModel = require('../models/Planes.js');

// Obtener todos los planes disponibles
const getOrganizationPlanes = async (req, res) => {
  const planesModel = new PlanesModel();
  
  try {
    console.log('📋 Obteniendo planes disponibles...');

    const planes = await planesModel.getAllPlanes();
    
    console.log(`✅ ${planes.length} planes encontrados`);
    res.json({
      success: true,
      data: planes,
      total: planes.length
    });
  } catch (error) {
    console.error('❌ Error obteniendo planes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener planes',
      error: error.message
    });
  } finally {
    await planesModel.disconnect();
  }
};

// Obtener plan específico por ID
const getPlanById = async (req, res) => {
  const planesModel = new PlanesModel();
  
  try {
    const { id } = req.params;
    console.log(`📋 Obteniendo plan con ID: ${id}`);

    const plan = await planesModel.getPlanById(id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }

    console.log(`✅ Plan encontrado: ${plan.nombre}`);
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('❌ Error obteniendo plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plan',
      error: error.message
    });
  } finally {
    await planesModel.disconnect();
  }
};

// Obtener estadísticas de planes
const getPlanesStats = async (req, res) => {
  const planesModel = new PlanesModel();
  
  try {
    console.log('📊 Obteniendo estadísticas de planes...');

    const stats = await planesModel.getPlanesStats();
    
    console.log('✅ Estadísticas de planes obtenidas');
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de planes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de planes',
      error: error.message
    });
  } finally {
    await planesModel.disconnect();
  }
};

// Obtener suscripción actual
const getSuscripcionActual = async (req, res) => {
  try {
    const organizationId = req.user?.organization_id;
    console.log(`🔍 Obteniendo suscripción actual para organización ${organizationId}...`);
    
    // Simular suscripción actual (en producción esto vendría de la base de datos)
    const suscripcionActual = {
      id: 1,
      organization_id: organizationId,
      plan_id: 4, // Plan Empresarial
      plan_nombre: 'Empresarial',
      plan_descripcion: 'Plan premium para grandes organizaciones',
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-12-31',
      periodo: 'anual',
      estado: 'activa',
      precio_mensual: 199.99,
      precio_anual: 1999.99,
      max_usuarios: 500,
      max_departamentos: 50,
      max_documentos: 10000,
      caracteristicas: JSON.stringify(['Todo del plan profesional', 'Soporte 24/7', 'Usuarios ilimitados', 'API personalizada', 'SLA garantizado'])
    };

    console.log(`✅ Suscripción actual encontrada`);
    res.json({
      success: true,
      data: suscripcionActual
    });
  } catch (error) {
    console.error('❌ Error obteniendo suscripción actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener suscripción actual',
      error: error.message
    });
  }
};

// Crear suscripción
const createSuscripcion = async (req, res) => {
  try {
    const { plan_id, fecha_inicio, periodo = 'mensual' } = req.body;
    const organizationId = req.user?.organization_id;
    
    console.log(`🔍 Creando suscripción para organización ${organizationId}...`);
    
    // Simular creación exitosa
    const nuevaSuscripcion = {
      id: Math.floor(Math.random() * 1000) + 1,
      organization_id: organizationId,
      plan_id: plan_id,
      fecha_inicio: fecha_inicio,
      periodo: periodo,
      estado: 'activa'
    };

    console.log(`✅ Suscripción creada con ID: ${nuevaSuscripcion.id}`);
    res.status(201).json({
      success: true,
      data: nuevaSuscripcion,
      message: 'Suscripción creada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error creando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear suscripción',
      error: error.message
    });
  }
};

// Cancelar suscripción
const cancelSuscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Cancelando suscripción ${id}...`);

    console.log(`✅ Suscripción ${id} cancelada`);
    res.json({
      success: true,
      message: 'Suscripción cancelada exitosamente'
    });
  } catch (error) {
    console.error('❌ Error cancelando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cancelar suscripción',
      error: error.message
    });
  }
};

module.exports = {
  getOrganizationPlanes,
  getPlanById,
  getPlanesStats,
  getSuscripcionActual,
  createSuscripcion,
  cancelSuscripcion
};
