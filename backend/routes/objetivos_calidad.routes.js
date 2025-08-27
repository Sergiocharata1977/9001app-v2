const express = require('express');
const mongoClient = require('../lib/mongoClient.js');

const router = express.Router();

// Obtener todos los objetivos
router.get('/', async (req, res) => {
  try {
    console.log('🎯 GET /objetivos - Obteniendo objetivos...');
    const organizationId = req.user?.organization_id || 1;
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM objetivos WHERE organization_id = ?',
      args: [organizationId]
    });
    
    console.log(`✅ Objetivos obtenidos: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener objetivos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener objetivo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organization_id || 1;
    
    console.log(`🎯 GET /objetivos/${id} - Obteniendo objetivo específico...`);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM objetivos WHERE id = ? AND organization_id = ?',
      args: [id, organizationId]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Objetivo no encontrado' });
    }
    
    console.log(`✅ Objetivo obtenido: ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener objetivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo objetivo
router.post('/', async (req, res) => {
  try {
    console.log('🎯 POST /objetivos - Creando nuevo objetivo...');
    console.log('Datos recibidos:', req.body);
    
    const organizationId = req.user?.organization_id || 1;
    const {
      nombre_objetivo,
      descripcion,
      proceso_id,
      indicador_asociado_id,
      meta,
      responsable,
      fecha_inicio,
      fecha_fin
    } = req.body;

    // Validaciones
    if (!nombre_objetivo) {
      return res.status(400).json({ error: 'El nombre del objetivo es requerido' });
    }

    // Generar ID único
    const id = 'obj-' + Date.now();
    
    const result = await mongoClient.execute({
      sql: `INSERT INTO objetivos (
        id, nombre_objetivo, descripcion, proceso_id, indicador_asociado_id, 
        meta, responsable, fecha_inicio, fecha_fin, organization_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        nombre_objetivo,
        descripcion || null,
        proceso_id || null,
        indicador_asociado_id || null,
        meta || null,
        responsable || null,
        fecha_inicio || null,
        fecha_fin || null,
        organizationId
      ]
    });

    console.log(`✅ Objetivo creado exitosamente: ${id}`);
    res.status(201).json({ 
      id, 
      nombre_objetivo, 
      descripcion, 
      proceso_id, 
      indicador_asociado_id, 
      meta, 
      responsable, 
      fecha_inicio, 
      fecha_fin,
      organization_id: organizationId
    });
  } catch (error) {
    console.error('❌ Error al crear objetivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar objetivo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organization_id || 1;
    
    console.log(`🎯 PUT /objetivos/${id} - Actualizando objetivo...`);
    console.log('Datos recibidos:', req.body);
    
    const {
      nombre_objetivo,
      descripcion,
      proceso_id,
      indicador_asociado_id,
      meta,
      responsable,
      fecha_inicio,
      fecha_fin
    } = req.body;

    // Verificar que el objetivo existe
    const checkResult = await mongoClient.execute({
      sql: 'SELECT id FROM objetivos WHERE id = ? AND organization_id = ?',
      args: [id, organizationId]
    });
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Objetivo no encontrado' });
    }

    const result = await mongoClient.execute({
      sql: `UPDATE objetivos SET 
        nombre_objetivo = ?, descripcion = ?, proceso_id = ?, 
        indicador_asociado_id = ?, meta = ?, responsable = ?, 
        fecha_inicio = ?, fecha_fin = ?
        WHERE id = ? AND organization_id = ?`,
      args: [
        nombre_objetivo,
        descripcion || null,
        proceso_id || null,
        indicador_asociado_id || null,
        meta || null,
        responsable || null,
        fecha_inicio || null,
        fecha_fin || null,
        id,
        organizationId
      ]
    });

    console.log(`✅ Objetivo actualizado exitosamente: ${id}`);
    res.json({ 
      id, 
      nombre_objetivo, 
      descripcion, 
      proceso_id, 
      indicador_asociado_id, 
      meta, 
      responsable, 
      fecha_inicio, 
      fecha_fin,
      organization_id: organizationId
    });
  } catch (error) {
    console.error('❌ Error al actualizar objetivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar objetivo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organization_id || 1;
    
    console.log(`🎯 DELETE /objetivos/${id} - Eliminando objetivo...`);
    
    // Verificar que el objetivo existe
    const checkResult = await mongoClient.execute({
      sql: 'SELECT id FROM objetivos WHERE id = ? AND organization_id = ?',
      args: [id, organizationId]
    });
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Objetivo no encontrado' });
    }

    await mongoClient.execute({
      sql: 'DELETE FROM objetivos WHERE id = ? AND organization_id = ?',
      args: [id, organizationId]
    });

    console.log(`✅ Objetivo eliminado exitosamente: ${id}`);
    res.json({ message: 'Objetivo eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar objetivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
