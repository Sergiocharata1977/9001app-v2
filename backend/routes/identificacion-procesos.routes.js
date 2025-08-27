const express = require('express');
const mongodbClient = require('../lib/mongodbClient.js');

const router = express.Router();

// GET /api/identificacion-procesos - Obtener la identificación de procesos de la organización
router.get('/', async (req, res) => {
  try {
    console.log('📋 Obteniendo identificación de procesos...');
    const result = await mongodbClient.execute({
      sql: 'SELECT * FROM identificacion_procesos WHERE organization_id = ? LIMIT 1',
      args: [req.user?.organization_id || 1]
    });
    
    if (result.rows.length === 0) {
      // Si no existe, crear un registro vacío
      const insertResult = await mongodbClient.execute({
        sql: `INSERT INTO identificacion_procesos (
          organization_id, politica_calidad, alcance, mapa_procesos, organigrama
        ) VALUES (?, ?, ?, ?, ?) RETURNING *`,
        args: [req.user?.organization_id || 1, '', '', '', '']
      });
      
      console.log('✅ Registro de identificación de procesos creado');
      res.json(insertResult.rows[0]);
    } else {
      console.log('✅ Identificación de procesos encontrada');
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('❌ Error al obtener identificación de procesos:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al obtener identificación de procesos',
      error: error.message 
    });
  }
});

// PUT /api/identificacion-procesos - Actualizar la identificación de procesos (MODIFICACIÓN)
router.put('/', async (req, res) => {
  try {
    const { 
      politica_calidad, 
      alcance, 
      mapa_procesos, 
      organigrama 
    } = req.body;
    
    console.log('✏️ Actualizando identificación de procesos:', { 
      politica_calidad: politica_calidad ? 'Proporcionada' : 'Vacía', 
      alcance: alcance ? 'Proporcionado' : 'Vacío', 
      mapa_procesos: mapa_procesos ? 'Proporcionado' : 'Vacío',
      organigrama: organigrama ? 'Proporcionado' : 'Vacío'
    });

    // Verificar si existe un registro
    const existingRecord = await mongodbClient.execute({
      sql: 'SELECT id FROM identificacion_procesos WHERE organization_id = ?',
      args: [req.user?.organization_id || 1]
    });

    let result;
    if (existingRecord.rows.length === 0) {
      // Crear nuevo registro si no existe
      result = await mongodbClient.execute({
        sql: `INSERT INTO identificacion_procesos (
          organization_id, politica_calidad, alcance, mapa_procesos, organigrama, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime')) RETURNING *`,
        args: [
          req.user?.organization_id || 1,
          politica_calidad || '',
          alcance || '',
          mapa_procesos || '',
          organigrama || ''
        ]
      });
      console.log('✅ Nuevo registro de identificación de procesos creado');
    } else {
      // Actualizar registro existente
      result = await mongodbClient.execute({
        sql: `UPDATE identificacion_procesos 
              SET politica_calidad = ?, alcance = ?, mapa_procesos = ?, organigrama = ?, 
                  updated_at = datetime('now', 'localtime')
              WHERE organization_id = ? RETURNING *`,
        args: [
          politica_calidad || '',
          alcance || '',
          mapa_procesos || '',
          organigrama || '',
          req.user?.organization_id || 1
        ]
      });
      console.log('✅ Identificación de procesos actualizada');
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar identificación de procesos:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al actualizar identificación de procesos',
      error: error.message 
    });
  }
});

// DELETE /api/identificacion-procesos - Limpiar la identificación de procesos (BAJA)
router.delete('/', async (req, res) => {
  try {
    console.log('🗑️ Limpiando identificación de procesos...');

    const result = await mongodbClient.execute({
      sql: `UPDATE identificacion_procesos 
            SET politica_calidad = '', alcance = '', mapa_procesos = '', organigrama = '',
                updated_at = datetime('now', 'localtime')
            WHERE organization_id = ? RETURNING *`,
      args: [req.user?.organization_id || 1]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'No se encontró registro de identificación de procesos' 
      });
    }

    console.log('✅ Identificación de procesos limpiada');
    res.json({ 
      status: 'success', 
      message: 'Identificación de procesos limpiada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al limpiar identificación de procesos:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error al limpiar identificación de procesos',
      error: error.message 
    });
  }
});

module.exports = router; 