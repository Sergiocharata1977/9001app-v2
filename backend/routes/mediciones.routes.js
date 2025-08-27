const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const ActivityLogService = require('../services/activityLogService.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const crypto = require('crypto');

const router = express.Router();

// GET /api/mediciones - Obtener todas las mediciones
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log('📈 Obteniendo mediciones para organización:', organizationId);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM mediciones WHERE organization_id = ? ORDER BY fecha_medicion DESC',
      args: [organizationId]
    });
    
    console.log(`✅ Encontradas ${result.rows.length} mediciones`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener mediciones:', error);
    next({
      statusCode: 500,
      message: 'Error al obtener mediciones',
      error: error.message
    });
  }
});

// GET /api/mediciones/:id - Obtener medición por ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log(`🔍 Obteniendo medición ${id} para organización ${organizationId}`);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM mediciones WHERE id = ? AND organization_id = ?',
      args: [id, organizationId],
    });

    if (result.rows.length === 0) {
      const err = new Error('Medición no encontrada en tu organización.');
      err.statusCode = 404;
      return next(err);
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/mediciones - Crear nueva medición
router.post('/', authMiddleware, async (req, res, next) => {
  const { indicador_id, valor, fecha_medicion, observaciones, organization_id } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  if (!indicador_id || !valor || !organization_id) {
    const err = new Error('Los campos "indicador_id", "valor" y "organization_id" son obligatorios.');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await mongoClient.execute({
      sql: 'INSERT INTO mediciones (id, indicador_id, valor, fecha_medicion, observaciones, organization_id) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, indicador_id, valor, fecha_medicion || now, observaciones || null, organization_id]
    });

    // Registrar en la bitácora
    await ActivityLogService.registrarCreacion(
      'medicion',
      id,
      { indicador_id, valor, fecha_medicion, observaciones, organization_id },
      usuario,
      organization_id
    );

    res.status(201).json({ 
      id, 
      indicador_id, 
      valor, 
      fecha_medicion, 
      observaciones, 
      organization_id,
      created_at: now,
      updated_at: now
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/mediciones/:id - Actualizar medición
router.put('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const { indicador_id, valor, fecha_medicion, observaciones } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    
    // Verificar que la medición existe y pertenece a la organización
    const existing = await mongoClient.execute({
      sql: 'SELECT * FROM mediciones WHERE id = ? AND organization_id = ?',
      args: [id, organizationId],
    });

    if (existing.rows.length === 0) {
      const err = new Error('Medición no encontrada en tu organización.');
      err.statusCode = 404;
      return next(err);
    }

    const now = new Date().toISOString();
    
    await mongoClient.execute({
      sql: `UPDATE mediciones 
            SET indicador_id = ?, valor = ?, fecha_medicion = ?, observaciones = ?, updated_at = ?
            WHERE id = ? AND organization_id = ?`,
      args: [indicador_id, valor, fecha_medicion, observaciones, now, id, organizationId]
    });

    // Registrar en la bitácora
    await ActivityLogService.registrarActualizacion(
      'medicion',
      id,
      { indicador_id, valor, fecha_medicion, observaciones },
      usuario,
      organizationId
    );

    res.json({ 
      id, 
      indicador_id, 
      valor, 
      fecha_medicion, 
      observaciones,
      organization_id: organizationId,
      updated_at: now
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/mediciones/:id - Eliminar medición
router.delete('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    
    const result = await mongoClient.execute({
      sql: 'DELETE FROM mediciones WHERE id = ? AND organization_id = ? RETURNING id',
      args: [id, organizationId],
    });

    if (result.rows.length === 0) {
      const err = new Error('Medición no encontrada en tu organización.');
      err.statusCode = 404;
      return next(err);
    }

    // Registrar en la bitácora
    await ActivityLogService.registrarEliminacion(
      'medicion',
      id,
      usuario,
      organizationId
    );

    res.json({ message: 'Medición eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
