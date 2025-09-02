const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const crypto = require('crypto');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// GET /relaciones - Obtener todas las relaciones
router.get('/', async (req, res) => {
  try {
    console.log('🔄 [RelacionesRoutes] Obteniendo todas las relaciones...');
    
    const collection = mongoClient.collection('relaciones_sgc');
    const result = await collection.find(
      { organization_id: req.user.organization_id },
      { sort: { fecha_creacion: -1 } }
    ).toArray();

    console.log(`✅ [RelacionesRoutes] Encontradas ${result.length} relaciones`);
    res.json({
      success: true,
      data: result,
      total: result.length
    });
  } catch (error) {
    console.error('❌ [RelacionesRoutes] Error al obtener relaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las relaciones',
      error: error.message
    });
  }
});

// GET /relaciones/origen/:tipo - Obtener relaciones por tipo de origen
router.get('/origen/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    console.log(`🔄 [RelacionesRoutes] Obteniendo relaciones de origen: ${tipo}`);
    
    const collection = mongoClient.collection('relaciones_sgc');
    const result = await collection.find(
      { 
        organization_id: req.user.organization_id,
        origen_tipo: tipo
      },
      { sort: { fecha_creacion: -1 } }
    ).toArray();

    console.log(`✅ [RelacionesRoutes] Encontradas ${result.length} relaciones para origen ${tipo}`);
    res.json({
      success: true,
      data: result,
      total: result.length
    });
  } catch (error) {
    console.error(`❌ [RelacionesRoutes] Error al obtener relaciones de origen ${req.params.tipo}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las relaciones',
      error: error.message
    });
  }
});

// GET /relaciones/destino/:tipo - Obtener relaciones por tipo de destino
router.get('/destino/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    console.log(`🔄 [RelacionesRoutes] Obteniendo relaciones de destino: ${tipo}`);
    
    const collection = mongoClient.collection('relaciones_sgc');
    const result = await collection.find(
      { 
        organization_id: req.user.organization_id,
        destino_tipo: tipo
      },
      { sort: { fecha_creacion: -1 } }
    ).toArray();

    console.log(`✅ [RelacionesRoutes] Encontradas ${result.length} relaciones para destino ${tipo}`);
    res.json({
      success: true,
      data: result,
      total: result.length
    });
  } catch (error) {
    console.error(`❌ [RelacionesRoutes] Error al obtener relaciones de destino ${req.params.tipo}:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las relaciones',
      error: error.message
    });
  }
});

// GET /relaciones/relacion - Obtener relación específica
router.get('/relacion', async (req, res) => {
  try {
    const { origenTipo, origenId, destinoTipo, destinoId } = req.query;
    console.log(`🔄 [RelacionesRoutes] Obteniendo relación: ${origenTipo}:${origenId} -> ${destinoTipo}:${destinoId}`);
    
    const collection = mongoClient.collection('relaciones_sgc');
    const result = await collection.findOne({
      organization_id: req.user.organization_id,
      origen_tipo: origenTipo,
      origen_id: origenId,
      destino_tipo: destinoTipo,
      destino_id: destinoId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    console.log(`✅ [RelacionesRoutes] Relación encontrada`);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ [RelacionesRoutes] Error al obtener relación específica:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la relación',
      error: error.message
    });
  }
});

// POST /relaciones - Crear nueva relación
router.post('/', async (req, res) => {
  try {
    const {
      origen_tipo,
      origen_id,
      destino_tipo,
      destino_id,
      tipo_relacion,
      descripcion,
      metadata
    } = req.body;

    // Validar campos requeridos
    if (!origen_tipo || !origen_id || !destino_tipo || !destino_id || !tipo_relacion) {
      return res.status(400).json({
        success: false,
        message: 'Los campos origen_tipo, origen_id, destino_tipo, destino_id y tipo_relacion son obligatorios'
      });
    }

    console.log(`🔄 [RelacionesRoutes] Creando relación: ${origen_tipo}:${origen_id} -> ${destino_tipo}:${destino_id}`);

    const collection = mongoClient.collection('relaciones_sgc');

    // Verificar si la relación ya existe
    const existingResult = await collection.findOne({
      organization_id: req.user.organization_id,
      origen_tipo,
      origen_id,
      destino_tipo,
      destino_id
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una relación entre estas entidades'
      });
    }

    // Crear nueva relación
    const nuevaRelacion = {
      id: crypto.randomUUID(),
      organization_id: req.user.organization_id,
      origen_tipo,
      origen_id,
      destino_tipo,
      destino_id,
      tipo_relacion,
      descripcion: descripcion || '',
      metadata: metadata || {},
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await collection.insertOne(nuevaRelacion);

    console.log(`✅ [RelacionesRoutes] Relación creada con ID: ${nuevaRelacion.id}`);
    res.status(201).json({
      success: true,
      data: nuevaRelacion,
      message: 'Relación creada exitosamente'
    });
  } catch (error) {
    console.error('❌ [RelacionesRoutes] Error al crear relación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la relación',
      error: error.message
    });
  }
});

// PUT /relaciones/:id - Actualizar relación
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tipo_relacion,
      descripcion,
      metadata
    } = req.body;

    console.log(`🔄 [RelacionesRoutes] Actualizando relación: ${id}`);

    const collection = mongoClient.collection('relaciones_sgc');

    // Verificar que la relación existe
    const existingResult = await collection.findOne({
      id: id,
      organization_id: req.user.organization_id
    });

    if (!existingResult) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    // Preparar datos para actualización
    const updateData = {
      updated_at: new Date()
    };

    if (tipo_relacion !== undefined) updateData.tipo_relacion = tipo_relacion;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (metadata !== undefined) updateData.metadata = metadata;

    const result = await collection.updateOne(
      { id: id, organization_id: req.user.organization_id },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    // Obtener la relación actualizada
    const updatedRelacion = await collection.findOne({
      id: id,
      organization_id: req.user.organization_id
    });

    console.log(`✅ [RelacionesRoutes] Relación actualizada: ${id}`);
    res.json({
      success: true,
      data: updatedRelacion,
      message: 'Relación actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ [RelacionesRoutes] Error al actualizar relación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la relación',
      error: error.message
    });
  }
});

// DELETE /relaciones/:id - Eliminar relación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 [RelacionesRoutes] Eliminando relación: ${id}`);

    const collection = mongoClient.collection('relaciones_sgc');
    const result = await collection.deleteOne({
      id: id,
      organization_id: req.user.organization_id
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    console.log(`✅ [RelacionesRoutes] Relación eliminada: ${id}`);
    res.json({
      success: true,
      message: 'Relación eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ [RelacionesRoutes] Error al eliminar relación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la relación',
      error: error.message
    });
  }
});

// GET /relaciones/entidades/:tipo - Obtener entidades relacionadas por tipo
router.get('/entidades/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    console.log(`🔄 [RelacionesRoutes] Obteniendo entidades relacionadas de tipo: ${tipo}`);

    const collection = mongoClient.collection('relaciones_sgc');
    
    // Obtener relaciones donde el tipo aparece como origen o destino
    const result = await collection.find({
      organization_id: req.user.organization_id,
      $or: [
        { origen_tipo: tipo },
        { destino_tipo: tipo }
      ]
    }, {
      sort: { fecha_creacion: -1 }
    }).toArray();

    // Agrupar entidades relacionadas
    const entidadesRelacionadas = {};
    
    result.forEach(relacion => {
      if (relacion.origen_tipo === tipo) {
        const entidadId = relacion.origen_id;
        if (!entidadesRelacionadas[entidadId]) {
          entidadesRelacionadas[entidadId] = {
            entidad_id: entidadId,
            relaciones_salientes: [],
            relaciones_entrantes: []
          };
        }
        entidadesRelacionadas[entidadId].relaciones_salientes.push(relacion);
      }
      
      if (relacion.destino_tipo === tipo) {
        const entidadId = relacion.destino_id;
        if (!entidadesRelacionadas[entidadId]) {
          entidadesRelacionadas[entidadId] = {
            entidad_id: entidadId,
            relaciones_salientes: [],
            relaciones_entrantes: []
          };
        }
        entidadesRelacionadas[entidadId].relaciones_entrantes.push(relacion);
      }
    });

    console.log(`✅ [RelacionesRoutes] Encontradas ${Object.keys(entidadesRelacionadas).length} entidades relacionadas`);
    res.json({
      success: true,
      data: Object.values(entidadesRelacionadas),
      total: Object.keys(entidadesRelacionadas).length
    });
  } catch (error) {
    console.error(`❌ [RelacionesRoutes] Error al obtener entidades relacionadas:`, error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener entidades relacionadas',
      error: error.message
    });
  }
});

module.exports = router; 