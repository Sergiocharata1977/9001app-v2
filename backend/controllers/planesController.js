const mongodbClient = require('../lib/mongodbClient.js');

// Obtener todos los planes
const getAllPlanes = async (req, res) => {
  try {
    console.log('🔍 Obteniendo todos los planes...');
    
    // Datos de ejemplo para planes
    const planes = [
      {
        id: 1,
        nombre: 'Gratuito',
        descripcion: 'Plan básico para pequeñas organizaciones',
        precio_mensual: 0,
        precio_anual: 0,
        max_usuarios: 5,
        max_departamentos: 2,
        max_documentos: 50,
        caracteristicas: JSON.stringify(['Acceso básico', 'Soporte por email', '5 usuarios']),
        es_plan_gratuito: true,
        is_active: 1
      },
      {
        id: 2,
        nombre: 'Básico',
        descripcion: 'Plan ideal para organizaciones en crecimiento',
        precio_mensual: 29.99,
        precio_anual: 299.99,
        max_usuarios: 25,
        max_departamentos: 10,
        max_documentos: 500,
        caracteristicas: JSON.stringify(['Todo del plan gratuito', 'Soporte prioritario', '25 usuarios', 'Reportes básicos']),
        es_plan_gratuito: false,
        is_active: 1
      },
      {
        id: 3,
        nombre: 'Profesional',
        descripcion: 'Plan completo para organizaciones establecidas',
        precio_mensual: 79.99,
        precio_anual: 799.99,
        max_usuarios: 100,
        max_departamentos: 25,
        max_documentos: 2000,
        caracteristicas: JSON.stringify(['Todo del plan básico', 'Soporte telefónico', '100 usuarios', 'Reportes avanzados', 'Integraciones']),
        es_plan_gratuito: false,
        is_active: 1
      },
      {
        id: 4,
        nombre: 'Empresarial',
        descripcion: 'Plan premium para grandes organizaciones',
        precio_mensual: 199.99,
        precio_anual: 1999.99,
        max_usuarios: 500,
        max_departamentos: 50,
        max_documentos: 10000,
        caracteristicas: JSON.stringify(['Todo del plan profesional', 'Soporte 24/7', 'Usuarios ilimitados', 'API personalizada', 'SLA garantizado']),
        es_plan_gratuito: false,
        is_active: 1
      }
    ];

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
  getAllPlanes,
  getSuscripcionActual,
  createSuscripcion,
  cancelSuscripcion
};
