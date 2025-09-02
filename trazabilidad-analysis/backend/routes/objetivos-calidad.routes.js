const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const ActivityLogService = require('../services/activityLogService.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const crypto = require('crypto');

const router = express.Router();

// GET /api/objetivos-calidad - Obtener todos los objetivos de calidad
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log('🎯 Obteniendo objetivos de calidad para organización:', organizationId);
    
    const result = await mongoClient.execute({
      sql: `SELECT 
        id, nombre_objetivo, descripcion, meta, responsable, 
        fecha_limite, estado, organization_id, created_at, updated_at, is_active
      FROM objetivos_calidad 
      WHERE organization_id = ? AND is_active = 1
      ORDER BY created_at DESC`,
      args: [organizationId]
    });
    
    console.log(`✅ Encontrados ${result.rows.length} objetivos de calidad`);
    res.json({ 
      success: true, 
      data: result.rows, 
      total: result.rows.length,
      message: 'Objetivos de calidad obtenidos exitosamente'
    });
  } catch (error) {
    console.error('❌ Error al obtener objetivos de calidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener objetivos de calidad',
      error: error.message
    });
  }
});

// GET /api/objetivos-calidad/:id - Obtener objetivo por ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log(`🔍 Obteniendo objetivo ${id} para organización ${organizationId}`);
    
         const result = await mongoClient.execute({
       sql: 'SELECT * FROM objetivos_calidad WHERE id = ?',
       args: [id],
     });

    if (result.rows.length === 0) {
      const err = new Error('Objetivo de calidad no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/objetivos-calidad - Crear nuevo objetivo
router.post('/', authMiddleware, async (req, res, next) => {
  const { titulo, descripcion, meta, fecha_limite, organization_id } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  if (!titulo || !organization_id) {
    const err = new Error('Los campos "titulo" y "organization_id" son obligatorios.');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

         await mongoClient.execute({
       sql: 'INSERT INTO objetivos_calidad (id, nombre_objetivo, descripcion, meta, responsable) VALUES (?, ?, ?, ?, ?)',
       args: [id, titulo, descripcion || null, meta || null, null]
     });

    // Registrar en la bitácora
    await ActivityLogService.registrarCreacion(
      'objetivo_calidad',
      id,
      { titulo, descripcion, meta, fecha_limite, organization_id },
      usuario,
      organization_id
    );

    res.status(201).json({ 
      id, 
      titulo, 
      descripcion, 
      meta, 
      fecha_limite, 
      organization_id,
      created_at: now,
      updated_at: now
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/objetivos-calidad/:id - Actualizar objetivo
router.put('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const { titulo, descripcion, meta, fecha_limite } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    
         // Verificar que el objetivo existe
     const existing = await mongoClient.execute({
       sql: 'SELECT * FROM objetivos_calidad WHERE id = ?',
       args: [id],
     });

    if (existing.rows.length === 0) {
      const err = new Error('Objetivo de calidad no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }

    const now = new Date().toISOString();
    
         await mongoClient.execute({
       sql: `UPDATE objetivos_calidad 
             SET nombre_objetivo = ?, descripcion = ?, meta = ?
             WHERE id = ?`,
       args: [titulo, descripcion, meta, id]
     });

    // Registrar en la bitácora
    await ActivityLogService.registrarActualizacion(
      'objetivo_calidad',
      id,
      { titulo, descripcion, meta, fecha_limite },
      usuario,
      organizationId
    );

    res.json({ 
      id, 
      titulo, 
      descripcion, 
      meta, 
      fecha_limite,
      organization_id: organizationId,
      updated_at: now
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/objetivos-calidad/:id - Eliminar objetivo
router.delete('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    
         const result = await mongoClient.execute({
       sql: 'DELETE FROM objetivos_calidad WHERE id = ? RETURNING id',
       args: [id],
     });

    if (result.rows.length === 0) {
      const err = new Error('Objetivo de calidad no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }

    // Registrar en la bitácora
    await ActivityLogService.registrarEliminacion(
      'objetivo_calidad',
      id,
      usuario,
      organizationId
    );

    res.json({ message: 'Objetivo de calidad eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 