const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// GET /api/sgc/hierarchy - Obtener jerarquía completa SGC
router.get('/hierarchy', authMiddleware, async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log('🏗️ Obteniendo jerarquía SGC para organización:', organizationId);
    
    // 1. Obtener todos los procesos
    const procesos = await mongoClient.execute({
      sql: 'SELECT * FROM procesos WHERE organization_id = ? ORDER BY nombre',
      args: [organizationId]
    });
    
    // 2. Obtener todos los objetivos de calidad
    const objetivos = await mongoClient.execute({
      sql: 'SELECT * FROM objetivos_calidad WHERE organization_id = ? ORDER BY nombre_objetivo',
      args: [organizationId]
    });
    
    // 3. Obtener todos los indicadores
    const indicadores = await mongoClient.execute({
      sql: 'SELECT * FROM Indicadores WHERE organization_id = ? ORDER BY nombre',
      args: [organizationId]
    });
    
    // 4. Obtener todas las mediciones
    const mediciones = await mongoClient.execute({
      sql: 'SELECT * FROM mediciones WHERE organization_id = ? ORDER BY fecha_medicion DESC',
      args: [organizationId]
    });
    
    // 5. Construir jerarquía
    const hierarchy = {
      procesos: procesos.rows.map(proceso => ({
        ...proceso,
        objetivos: objetivos.rows.filter(obj => obj.proceso_id === proceso.id),
        indicadores: indicadores.rows.filter(ind => ind.proceso_id === proceso.id),
        mediciones: []
      }))
    };
    
    // 6. Agregar mediciones a cada indicador
    hierarchy.procesos.forEach(proceso => {
      proceso.indicadores.forEach(indicador => {
        indicador.mediciones = mediciones.rows.filter(med => med.indicador_id === indicador.id);
      });
    });
    
    console.log(`✅ Jerarquía SGC construida: ${hierarchy.procesos.length} procesos`);
    res.json({
      success: true,
      data: hierarchy,
      stats: {
        totalProcesos: hierarchy.procesos.length,
        totalObjetivos: objetivos.rows.length,
        totalIndicadores: indicadores.rows.length,
        totalMediciones: mediciones.rows.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener jerarquía SGC:', error);
    next({
      statusCode: 500,
      message: 'Error al obtener jerarquía SGC',
      error: error.message
    });
  }
});

// GET /api/sgc/procesos/:id/hierarchy - Obtener jerarquía por proceso específico
router.get('/procesos/:id/hierarchy', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log(`🔍 Obteniendo jerarquía para proceso ${id} en organización ${organizationId}`);
    
    // 1. Obtener proceso específico
    const proceso = await mongoClient.execute({
      sql: 'SELECT * FROM procesos WHERE id = ? AND organization_id = ?',
      args: [id, organizationId]
    });
    
    if (proceso.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proceso no encontrado'
      });
    }
    
    // 2. Obtener objetivos del proceso
    const objetivos = await mongoClient.execute({
      sql: 'SELECT * FROM objetivos_calidad WHERE proceso_id = ? AND organization_id = ? ORDER BY nombre_objetivo',
      args: [id, organizationId]
    });
    
    // 3. Obtener indicadores del proceso
    const indicadores = await mongoClient.execute({
      sql: 'SELECT * FROM Indicadores WHERE proceso_id = ? AND organization_id = ? ORDER BY nombre',
      args: [id, organizationId]
    });
    
    // 4. Obtener mediciones de los indicadores del proceso
    const indicadorIds = indicadores.rows.map(ind => ind.id);
    let mediciones = [];
    if (indicadorIds.length > 0) {
      const medicionesResult = await mongoClient.execute({
        sql: `SELECT * FROM mediciones WHERE indicador_id IN (${indicadorIds.map(() => '?').join(',')}) AND organization_id = ? ORDER BY fecha_medicion DESC`,
        args: [...indicadorIds, organizationId]
      });
      mediciones = medicionesResult.rows;
    }
    
    // 5. Construir jerarquía del proceso
    const procesoHierarchy = {
      ...proceso.rows[0],
      objetivos: objetivos.rows.map(objetivo => ({
        ...objetivo,
        indicadores: indicadores.rows.filter(ind => ind.proceso_id === id),
        mediciones: []
      })),
      indicadores: indicadores.rows.map(indicador => ({
        ...indicador,
        mediciones: mediciones.filter(med => med.indicador_id === indicador.id)
      })),
      mediciones: mediciones
    };
    
    console.log(`✅ Jerarquía del proceso ${id}: ${objetivos.rows.length} objetivos, ${indicadores.rows.length} indicadores`);
    res.json({
      success: true,
      data: procesoHierarchy,
      stats: {
        objetivos: objetivos.rows.length,
        indicadores: indicadores.rows.length,
        mediciones: mediciones.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener jerarquía del proceso:', error);
    next({
      statusCode: 500,
      message: 'Error al obtener jerarquía del proceso',
      error: error.message
    });
  }
});

module.exports = router; 