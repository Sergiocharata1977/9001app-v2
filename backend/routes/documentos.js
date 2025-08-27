const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const ActivityLogService = require('../services/activityLogService.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const crypto = require('crypto');

const router = express.Router();

// GET /api/documentos - Obtener todos los documentos
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log('📄 Obteniendo documentos para organización:', organizationId);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM documentos WHERE organization_id = ? ORDER BY created_at DESC',
      args: [organizationId]
    });
    
    console.log(`✅ Encontrados ${result.rows.length} documentos`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener documentos:', error);
    next({
      statusCode: 500,
      message: 'Error al obtener documentos',
      error: error.message
    });
  }
});

// GET /api/documentos/:id - Obtener documento por ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log(`🔍 Obteniendo documento ${id} para organización ${organizationId}`);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM documentos WHERE id = ? AND organization_id = ?',
      args: [id, organizationId],
    });

    if (result.rows.length === 0) {
      const err = new Error('Documento no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/documentos - Crear nuevo documento
router.post('/', authMiddleware, async (req, res, next) => {
  const { titulo, descripcion, tipo, url, organization_id } = req.body;
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
      sql: 'INSERT INTO documentos (id, titulo, descripcion, tipo, url, organization_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, titulo, descripcion || null, tipo || 'general', url || null, organization_id, now, now]
    });

    // Registrar en la bitácora
    await ActivityLogService.registrarCreacion(
      'documento',
      id,
      { titulo, descripcion, tipo, url, organization_id },
      usuario,
      organization_id
    );

    res.status(201).json({ 
      id, 
      titulo, 
      descripcion, 
      tipo, 
      url, 
      organization_id,
      created_at: now,
      updated_at: now
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/documentos/:id - Actualizar documento
router.put('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const { titulo, descripcion, tipo, url } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    
    // Verificar que el documento existe y pertenece a la organización
    const existing = await mongoClient.execute({
      sql: 'SELECT * FROM documentos WHERE id = ? AND organization_id = ?',
      args: [id, organizationId],
    });

    if (existing.rows.length === 0) {
      const err = new Error('Documento no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }

    const now = new Date().toISOString();
    
    await mongoClient.execute({
      sql: `UPDATE documentos 
            SET titulo = ?, descripcion = ?, tipo = ?, url = ?, updated_at = ?
            WHERE id = ? AND organization_id = ?`,
      args: [titulo, descripcion, tipo, url, now, id, organizationId]
    });

    // Registrar en la bitácora
    await ActivityLogService.registrarActualizacion(
      'documento',
      id,
      { titulo, descripcion, tipo, url },
      usuario,
      organizationId
    );

    res.json({ 
      id, 
      titulo, 
      descripcion, 
      tipo, 
      url,
      organization_id: organizationId,
      updated_at: now
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/documentos/:id - Eliminar documento
router.delete('/:id', authMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    
    const result = await mongoClient.execute({
      sql: 'DELETE FROM documentos WHERE id = ? AND organization_id = ? RETURNING id',
      args: [id, organizationId],
    });

    if (result.rows.length === 0) {
      const err = new Error('Documento no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }

    // Registrar en la bitácora
    await ActivityLogService.registrarEliminacion(
      'documento',
      id,
      usuario,
      organizationId
    );

    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 