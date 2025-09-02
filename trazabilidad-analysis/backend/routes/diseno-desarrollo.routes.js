const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const mongoClient = require('../lib/mongoClient.js');

router.use(authMiddleware);

// ===============================================
// RUTAS PARA DISEÑO Y DESARROLLO DE PRODUCTOS
// ===============================================

// GET /api/diseno-desarrollo - Obtener todos los proyectos
router.get('/', async (req, res) => {
  try {
    const orgId = req.user?.organization_id;
    console.log('🔧 Obteniendo proyectos de diseño y desarrollo para organización:', orgId);

    const result = await mongoClient.execute({
      sql: `SELECT * FROM diseno_desarrollo_productos 
            WHERE organization_id = ? 
            ORDER BY created_at DESC`,
      args: [orgId]
    });

    console.log(`✅ Encontrados ${result.rows.length} proyectos`);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyectos',
      error: error.message
    });
  }
});

// GET /api/diseno-desarrollo/:id - Obtener proyecto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization_id;
    console.log('🔧 Obteniendo proyecto:', id);

    const result = await mongoClient.execute({
      sql: `SELECT * FROM diseno_desarrollo_productos 
            WHERE id = ? AND organization_id = ?`,
      args: [id, orgId]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener proyecto',
      error: error.message
    });
  }
});

// POST /api/diseno-desarrollo - Crear nuevo proyecto
router.post('/', async (req, res) => {
  try {
    const {
      nombre_producto,
      descripcion,
      etapa_actual,
      responsable_id,
      fecha_inicio,
      fecha_fin_estimada,
      requisitos_cliente,
      especificaciones_tecnicas,
      observaciones
    } = req.body;

    const orgId = req.user?.organization_id;
    console.log('🔧 Creando nuevo proyecto de diseño y desarrollo');

    const result = await mongoClient.execute({
      sql: `INSERT INTO diseno_desarrollo_productos (
        organization_id, nombre_producto, descripcion, etapa_actual,
        responsable_id, fecha_inicio, fecha_fin_estimada,
        requisitos_cliente, especificaciones_tecnicas, observaciones,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        orgId, nombre_producto, descripcion, etapa_actual,
        responsable_id, fecha_inicio, fecha_fin_estimada,
        requisitos_cliente, especificaciones_tecnicas, observaciones
      ]
    });

    console.log(`✅ Proyecto creado con ID: ${result.lastInsertRowid}`);

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: {
        id: result.lastInsertRowid,
        nombre_producto,
        etapa_actual
      }
    });

  } catch (error) {
    console.error('Error creando proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear proyecto',
      error: error.message
    });
  }
});

// PUT /api/diseno-desarrollo/:id - Actualizar proyecto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre_producto,
      descripcion,
      etapa_actual,
      responsable_id,
      fecha_inicio,
      fecha_fin_estimada,
      requisitos_cliente,
      especificaciones_tecnicas,
      observaciones
    } = req.body;

    const orgId = req.user?.organization_id;
    console.log('🔧 Actualizando proyecto:', id);

    const result = await mongoClient.execute({
      sql: `UPDATE diseno_desarrollo_productos SET
        nombre_producto = ?, descripcion = ?, etapa_actual = ?,
        responsable_id = ?, fecha_inicio = ?, fecha_fin_estimada = ?,
        requisitos_cliente = ?, especificaciones_tecnicas = ?, observaciones = ?,
        updated_at = datetime('now')
        WHERE id = ? AND organization_id = ?`,
      args: [
        nombre_producto, descripcion, etapa_actual,
        responsable_id, fecha_inicio, fecha_fin_estimada,
        requisitos_cliente, especificaciones_tecnicas, observaciones,
        id, orgId
      ]
    });

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    console.log(`✅ Proyecto ${id} actualizado`);

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar proyecto',
      error: error.message
    });
  }
});

// DELETE /api/diseno-desarrollo/:id - Eliminar proyecto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.organization_id;
    console.log('🔧 Eliminando proyecto:', id);

    const result = await mongoClient.execute({
      sql: `DELETE FROM diseno_desarrollo_productos 
            WHERE id = ? AND organization_id = ?`,
      args: [id, orgId]
    });

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado'
      });
    }

    console.log(`✅ Proyecto ${id} eliminado`);

    res.json({
      success: true,
      message: 'Proyecto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar proyecto',
      error: error.message
    });
  }
});

module.exports = router;
