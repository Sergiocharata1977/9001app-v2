const express = require('express');
const mongoClient = require('../lib/mongoClient.js');

const router = express.Router();

// GET /api/politica-calidad - Obtener todas las políticas de calidad
router.get('/', async (req, res) => {
  try {
    console.log('📋 Obteniendo todas las políticas de calidad...');
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM politica_calidad WHERE organization_id = ? ORDER BY nombre',
      args: [req.user?.organization_id || 1]
    });
    
    console.log(`✅ Encontradas ${result.rows.length} políticas de calidad`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener políticas de calidad:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al obtener políticas de calidad',
      error: error.message 
    });
  }
});

// GET /api/politica-calidad/:id - Obtener política de calidad por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Buscando política de calidad con ID: ${id}`);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM politica_calidad WHERE id = ? AND organization_id = ?',
      args: [id, req.user?.organization_id || 1]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Política de calidad no encontrada' 
      });
    }

    console.log(`✅ Política de calidad encontrada: ${result.rows[0].nombre}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener política de calidad:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al obtener política de calidad',
      error: error.message 
    });
  }
});

// POST /api/politica-calidad - Crear nueva política de calidad (ALTA)
router.post('/', async (req, res) => {
  try {
    const { 
      nombre, 
      politica_calidad, 
      alcance, 
      mapa_procesos, 
      organigrama 
    } = req.body;
    
    console.log('➕ Creando nueva política de calidad:', { nombre });

    // Validación básica
    if (!nombre) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El nombre es obligatorio' 
      });
    }

    // Generar ID único
    const id = `politica-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await mongoClient.execute({
      sql: `INSERT INTO politica_calidad (
        id, organization_id, nombre, politica_calidad, alcance, mapa_procesos, organigrama
      ) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
      args: [
        id,
        req.user?.organization_id || 1,
        nombre,
        politica_calidad || '',
        alcance || '',
        mapa_procesos || '',
        organigrama || ''
      ]
    });

    console.log(`✅ Política de calidad creada con ID: ${result.rows[0].id}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear política de calidad:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al crear política de calidad',
      error: error.message 
    });
  }
});

// PUT /api/politica-calidad/:id - Actualizar política de calidad (MODIFICACIÓN)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      politica_calidad, 
      alcance, 
      mapa_procesos, 
      organigrama,
      estado 
    } = req.body;
    
    console.log(`✏️ Actualizando política de calidad ID: ${id}`, { nombre });

    // Validación básica
    if (!nombre) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'El nombre es obligatorio' 
      });
    }

    const result = await mongoClient.execute({
      sql: `UPDATE politica_calidad 
            SET nombre = ?, politica_calidad = ?, alcance = ?, mapa_procesos = ?, 
                organigrama = ?, estado = ?, updated_at = datetime('now', 'localtime')
            WHERE id = ? AND organization_id = ?
            RETURNING *`,
      args: [
        nombre,
        politica_calidad || '',
        alcance || '',
        mapa_procesos || '',
        organigrama || '',
        estado || 'activo',
        id,
        req.user?.organization_id || 1
      ]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Política de calidad no encontrada' 
      });
    }

    console.log(`✅ Política de calidad actualizada: ${result.rows[0].nombre}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar política de calidad:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al actualizar política de calidad',
      error: error.message 
    });
  }
});

// DELETE /api/politica-calidad/:id - Eliminar política de calidad (BAJA)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminando política de calidad ID: ${id}`);

    // Verificar si existe antes de eliminar
    const checkResult = await mongoClient.execute({
      sql: 'SELECT nombre FROM politica_calidad WHERE id = ? AND organization_id = ?',
      args: [id, req.user?.organization_id || 1]
    });

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Política de calidad no encontrada' 
      });
    }

    // Eliminar el registro
    await mongoClient.execute({
      sql: 'DELETE FROM politica_calidad WHERE id = ? AND organization_id = ?',
      args: [id, req.user?.organization_id || 1]
    });

    console.log(`✅ Política de calidad eliminada: ${checkResult.rows[0].nombre}`);
    res.json({ 
      status: 'success', 
      message: 'Política de calidad eliminada correctamente',
      deletedItem: checkResult.rows[0].nombre
    });
  } catch (error) {
    console.error('❌ Error al eliminar política de calidad:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al eliminar política de calidad',
      error: error.message 
    });
  }
});

// GET /api/politica-calidad/search/:term - Buscar políticas de calidad
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    console.log(`🔍 Buscando políticas de calidad con término: ${term}`);
    
    const result = await mongoClient.execute({
      sql: `SELECT * FROM politica_calidad 
            WHERE organization_id = ? 
            AND (nombre LIKE ? OR politica_calidad LIKE ? OR alcance LIKE ?)
            ORDER BY nombre`,
      args: [req.user?.organization_id || 1, `%${term}%`, `%${term}%`, `%${term}%`]
    });

    console.log(`✅ Encontradas ${result.rows.length} políticas de calidad que coinciden con "${term}"`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al buscar políticas de calidad:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al buscar políticas de calidad',
      error: error.message 
    });
  }
});

module.exports = router; 