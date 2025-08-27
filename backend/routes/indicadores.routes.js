const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const ActivityLogService = require('../services/activityLogService.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const crypto = require('crypto');

const router = express.Router();

// GET /api/indicadores - Obtener todos los indicadores
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log('📊 Obteniendo indicadores para organización:', organizationId);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM indicadores WHERE organization_id = ? ORDER BY created_at DESC',
      args: [organizationId]
    });
    
    console.log(`✅ Encontrados ${result.rows.length} indicadores`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener indicadores:', error);
    next({
      statusCode: 500,
      message: 'Error al obtener indicadores',
      error: error.message
    });
  }
});

// GET /api/indicadores/:id - Obtener indicador por ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log(`🔍 Obteniendo indicador ${id} para organización ${organizationId}`);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM indicadores WHERE id = ? AND organization_id = ?',
      args: [id, organizationId],
    });

    if (result.rows.length === 0) {
      const err = new Error('Indicador no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/indicadores - Crear nuevo indicador
router.post('/', authMiddleware, async (req, res, next) => {
  const { nombre, descripcion, tipo, unidad, organization_id } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  if (!nombre || !organization_id) {
    const err = new Error('Los campos "nombre" y "organization_id" son obligatorios.');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await mongoClient.execute({
      sql: 'INSERT INTO indicadores (id, nombre, descripcion, tipo, unidad, organization_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, nombre, descripcion || null, tipo || 'general', unidad || null, organization_id, now, now]
    });

    // Registrar en la bitácora
    await ActivityLogService.registrarCreacion(
      'indicador',
      id,
      { nombre, descripcion, tipo, unidad, organization_id },
      usuario,
      organization_id
    );

    res.status(201).json({ 
      id, 
      nombre, 
      descripcion, 
      tipo, 
      unidad, 
      organization_id,
      created_at: now,
      updated_at: now
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/indicadores/:id - Actualizar indicador
router.put('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const { nombre, descripcion, tipo, unidad } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    
    // Verificar que el indicador existe y pertenece a la organización
    const existing = await mongoClient.execute({
      sql: 'SELECT * FROM indicadores WHERE id = ? AND organization_id = ?',
      args: [id, organizationId],
    });

    if (existing.rows.length === 0) {
      const err = new Error('Indicador no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }

    const now = new Date().toISOString();
    
    await mongoClient.execute({
      sql: `UPDATE indicadores 
            SET nombre = ?, descripcion = ?, tipo = ?, unidad = ?, updated_at = ?
            WHERE id = ? AND organization_id = ?`,
      args: [nombre, descripcion, tipo, unidad, now, id, organizationId]
    });

    // Registrar en la bitácora
    await ActivityLogService.registrarActualizacion(
      'indicador',
      id,
      { nombre, descripcion, tipo, unidad },
      usuario,
      organizationId
    );

    res.json({ 
      id, 
      nombre, 
      descripcion, 
      tipo, 
      unidad,
      organization_id: organizationId,
      updated_at: now
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/indicadores/:id - Eliminar indicador
router.delete('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    
    const result = await mongoClient.execute({
      sql: 'DELETE FROM indicadores WHERE id = ? AND organization_id = ? RETURNING id',
      args: [id, organizationId],
    });

    if (result.rows.length === 0) {
      const err = new Error('Indicador no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }

    // Registrar en la bitácora
    await ActivityLogService.registrarEliminacion(
      'indicador',
      id,
      usuario,
      organizationId
    );

    res.json({ message: 'Indicador eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
