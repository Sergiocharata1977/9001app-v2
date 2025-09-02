const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// Ruta de prueba rápida sin autenticación
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Test rápido de normas...');
    const result = await mongoClient.execute('SELECT COUNT(*) as count FROM normas WHERE organization_id = 0');
    console.log('🧪 Resultado test:', result.rows[0]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('🧪 Error test:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test con parámetros como la consulta real
router.get('/test2', async (req, res) => {
  try {
    console.log('🧪 Test con parámetros...');
    const result = await mongoClient.execute({
      sql: 'SELECT id, codigo, titulo FROM normas WHERE organization_id = 0 OR organization_id = ? LIMIT 5',
      args: [2]
    });
    console.log('🧪 Resultado test2:', result.rows);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('🧪 Error test2:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===========================================
// RUTAS ULTRA SIMPLES SIN RESTRICCIONES
// ===========================================

// Obtener TODAS las normas de la organización del usuario
router.get('/', authMiddleware, async (req, res) => {
  const startTime = Date.now();
  try {
    const organization_id = req.user?.organization_id;

    console.log(`🚀 [${new Date().toISOString()}] GET /api/normas iniciado para org: ${organization_id}`);

    if (!organization_id) {
      console.log(`❌ [${Date.now() - startTime}ms] Sin organization_id`);
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    console.log(`🔍 [${Date.now() - startTime}ms] Ejecutando consulta SQL...`);
    
    // Consulta simplificada sin ORDER BY para debuggear
    console.log(`🔍 [${Date.now() - startTime}ms] Consultando normas para org_id: ${organization_id}`);
    
    const queryPromise = mongoClient.execute({
      sql: `SELECT id, codigo, titulo, version, tipo, estado, organization_id 
            FROM normas 
            WHERE organization_id = 0 OR organization_id = ?`,
      args: [organization_id]
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout after 5 seconds')), 5000);
    });

    const result = await Promise.race([queryPromise, timeoutPromise]);

    console.log(`✅ [${Date.now() - startTime}ms] Consulta completada. Encontradas ${result.rows.length} normas`);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      message: `${result.rows.length} normas encontradas`
    });
    
  } catch (error) {
    console.error(`❌ [${Date.now() - startTime}ms] Error obteniendo normas:`, error.message);
    res.status(500).json({
      success: false,
      data: [],
      total: 0,
      message: `Error al obtener normas: ${error.message}`
    });
  }
});

// Obtener norma específica por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔓 Obteniendo norma ${id} sin restricciones`);
    
    const result = await mongoClient.execute({
      sql: `SELECT n.*, o.name as organization_name 
            FROM normas n 
            LEFT JOIN organizations o ON n.organization_id = o.id 
            WHERE n.id = ?`,
      args: [id]
    });
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Norma no encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error obteniendo norma:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener norma',
      error: error.message
    });
  }
});

// Crear nueva norma
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      codigo, 
      titulo, 
      descripcion, 
      version, 
      tipo, 
      estado = 'activo', 
      categoria,
      responsable,
      fecha_revision,
      observaciones
    } = req.body;

    console.log('🔓 Creando nueva norma sin restricciones');

    const result = await mongoClient.execute({
      sql: `INSERT INTO normas (
        codigo, titulo, descripcion, version, tipo, estado, categoria,
        responsable, fecha_revision, observaciones, organization_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        codigo, titulo, descripcion, version, tipo, estado, categoria,
        responsable, fecha_revision, observaciones, req.user?.organization_id || 1
      ]
    });

    console.log(`✅ Norma creada con ID: ${result.lastInsertRowid}`);
    
    res.status(201).json({
      success: true,
      data: { id: result.lastInsertRowid, codigo, titulo },
      message: 'Norma creada exitosamente'
    });
    
  } catch (error) {
    console.error('Error creando norma:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear norma',
      error: error.message
    });
  }
});

// Actualizar norma
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      codigo, 
      titulo, 
      descripcion, 
      version, 
      tipo, 
      estado, 
      categoria,
      responsable,
      fecha_revision,
      observaciones
    } = req.body;

    console.log(`🔓 Actualizando norma ${id} sin restricciones`);
    
    const result = await mongoClient.execute({
      sql: `UPDATE normas SET 
        codigo = ?, titulo = ?, descripcion = ?, version = ?, tipo = ?, 
        estado = ?, categoria = ?, responsable = ?, fecha_revision = ?, 
        observaciones = ?, updated_at = datetime('now')
        WHERE id = ?`,
      args: [
        codigo, titulo, descripcion, version, tipo, estado, categoria,
        responsable, fecha_revision, observaciones, id
      ]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Norma no encontrada'
      });
    }

    console.log(`✅ Norma ${id} actualizada`);
    
    res.json({
      success: true,
      message: 'Norma actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error actualizando norma:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar norma',
      error: error.message
    });
  }
});

// Eliminar norma
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔓 Eliminando norma ${id} sin restricciones`);

    const result = await mongoClient.execute({
      sql: `DELETE FROM normas WHERE id = ?`,
      args: [id]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Norma no encontrada'
      });
    }

    console.log(`✅ Norma ${id} eliminada`);
    
    res.json({
      success: true,
      message: 'Norma eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando norma:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar norma',
      error: error.message
    });
  }
});

module.exports = router;
