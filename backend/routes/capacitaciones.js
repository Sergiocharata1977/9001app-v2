const express = require('express');
import MongoDBConnection from '../config/mongodb';
const ActivityLogService = require('../services/activityLogService.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const crypto = require('crypto');

const router = express.Router();

// GET /api/capacitaciones - Obtener todas las capacitaciones
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2; // Valor por defecto
    console.log('📋 Obteniendo todas las capacitaciones para organización:', organizationId);
    
    const result = await tursoClient.execute({
      sql: 'SELECT * FROM capacitaciones WHERE organization_id = ? ORDER BY created_at DESC',
      args: [organizationId]
    });
    
    console.log(`✅ Encontradas ${result.rows.length} capacitaciones`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener capacitaciones:', error);
    next({
      statusCode: 500,
      message: 'Error al obtener capacitaciones',
      error: error.message
    });
  }
});

// GET /api/capacitaciones/:id - Obtener capacitación por ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log(`🔍 Obteniendo capacitación ${id} para organización ${organizationId}`);
    
    const result = await tursoClient.execute({
      sql: 'SELECT * FROM capacitaciones WHERE id = ? AND organization_id = ?',
      args: [id, organizationId],
    });

    if (result.rows.length === 0) {
      const err = new Error('Capacitación no encontrada en tu organización.');
      err.statusCode = 404;
      return next(err);
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/capacitaciones - Crear nueva capacitación
router.post('/', authMiddleware, async (req, res, next) => {
  const { titulo, descripcion, fecha_programada, estado, organization_id } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  if (!titulo || !organization_id) {
    const err = new Error('Los campos "titulo" y "organization_id" son obligatorios.');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await tursoClient.execute({
      sql: 'INSERT INTO capacitaciones (id, titulo, descripcion, fecha_programada, estado, organization_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, titulo, descripcion || null, fecha_programada || null, estado || 'programada', organization_id, now, now]
    });

    // Registrar en la bitácora
    await ActivityLogService.registrarCreacion(
      'capacitacion',
      id,
      { titulo, descripcion, fecha_programada, estado, organization_id },
      usuario,
      organization_id
    );

    res.status(201).json({ 
      id, 
      titulo, 
      descripcion, 
      fecha_programada, 
      estado, 
      organization_id,
      created_at: now,
      updated_at: now
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/capacitaciones/:id - Actualizar capacitación
router.put('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_programada, estado } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    
    // Verificar que la capacitación existe y pertenece a la organización
    const existing = await tursoClient.execute({
      sql: 'SELECT * FROM capacitaciones WHERE id = ? AND organization_id = ?',
      args: [id, organizationId],
    });

    if (existing.rows.length === 0) {
      const err = new Error('Capacitación no encontrada en tu organización.');
      err.statusCode = 404;
      return next(err);
    }

    const now = new Date().toISOString();
    
    await tursoClient.execute({
      sql: `UPDATE capacitaciones 
            SET titulo = ?, descripcion = ?, fecha_programada = ?, estado = ?, updated_at = ?
            WHERE id = ? AND organization_id = ?`,
      args: [titulo, descripcion, fecha_programada, estado, now, id, organizationId]
    });

    // Registrar en la bitácora
    await ActivityLogService.registrarActualizacion(
      'capacitacion',
      id,
      { titulo, descripcion, fecha_programada, estado },
      usuario,
      organizationId
    );

    res.json({ 
      id, 
      titulo, 
      descripcion, 
      fecha_programada, 
      estado,
      organization_id: organizationId,
      updated_at: now
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/capacitaciones/:id - Eliminar capacitación
router.delete('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    
    const result = await tursoClient.execute({
      sql: 'DELETE FROM capacitaciones WHERE id = ? AND organization_id = ? RETURNING id',
      args: [id, organizationId],
    });

    if (result.rows.length === 0) {
      const err = new Error('Capacitación no encontrada en tu organización.');
      err.statusCode = 404;
      return next(err);
    }

    // Registrar en la bitácora
    await ActivityLogService.registrarEliminacion(
      'capacitacion',
      id,
      usuario,
      organizationId
    );

    res.json({ message: 'Capacitación eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 