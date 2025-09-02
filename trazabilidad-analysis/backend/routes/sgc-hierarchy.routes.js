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
    const procesosCollection = mongoClient.collection('procesos');
    const procesos = await procesosCollection.find(
      { organization_id: organizationId },
      { sort: { nombre: 1 } }
    ).toArray();
    
    // 2. Obtener todos los objetivos de calidad
    const objetivosCollection = mongoClient.collection('objetivos_calidad');
    const objetivos = await objetivosCollection.find(
      { organization_id: organizationId },
      { sort: { nombre_objetivo: 1 } }
    ).toArray();
    
    // 3. Obtener todos los indicadores
    const indicadoresCollection = mongoClient.collection('Indicadores');
    const indicadores = await indicadoresCollection.find(
      { organization_id: organizationId },
      { sort: { nombre: 1 } }
    ).toArray();
    
    // 4. Obtener todas las mediciones
    const medicionesCollection = mongoClient.collection('mediciones');
    const mediciones = await medicionesCollection.find(
      { organization_id: organizationId },
      { sort: { fecha_medicion: -1 } }
    ).toArray();
    
    // 5. Construir jerarquía
    const hierarchy = {
      procesos: procesos.map(proceso => ({
        ...proceso,
        objetivos: objetivos.filter(obj => obj.proceso_id === proceso.id),
        indicadores: indicadores.filter(ind => ind.proceso_id === proceso.id),
        mediciones: []
      }))
    };
    
    // 6. Agregar mediciones a cada indicador
    hierarchy.procesos.forEach(proceso => {
      proceso.indicadores.forEach(indicador => {
        indicador.mediciones = mediciones.filter(med => med.indicador_id === indicador.id);
      });
    });
    
    console.log(`✅ Jerarquía SGC construida: ${hierarchy.procesos.length} procesos`);
    res.json({
      success: true,
      data: hierarchy,
      stats: {
        totalProcesos: hierarchy.procesos.length,
        totalObjetivos: objetivos.length,
        totalIndicadores: indicadores.length,
        totalMediciones: mediciones.length
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
    const procesosCollection = mongoClient.collection('procesos');
    const proceso = await procesosCollection.findOne({
      id: id,
      organization_id: organizationId
    });
    
    if (!proceso) {
      return res.status(404).json({
        success: false,
        message: 'Proceso no encontrado'
      });
    }
    
    // 2. Obtener objetivos del proceso
    const objetivosCollection = mongoClient.collection('objetivos_calidad');
    const objetivos = await objetivosCollection.find(
      { 
        proceso_id: id,
        organization_id: organizationId
      },
      { sort: { nombre_objetivo: 1 } }
    ).toArray();
    
    // 3. Obtener indicadores del proceso
    const indicadoresCollection = mongoClient.collection('Indicadores');
    const indicadores = await indicadoresCollection.find(
      { 
        proceso_id: id,
        organization_id: organizationId
      },
      { sort: { nombre: 1 } }
    ).toArray();
    
    // 4. Obtener mediciones de los indicadores del proceso
    const indicadorIds = indicadores.map(ind => ind.id);
    const medicionesCollection = mongoClient.collection('mediciones');
    const medicionesResult = await medicionesCollection.find(
      { 
        indicador_id: { $in: indicadorIds },
        organization_id: organizationId
      },
      { sort: { fecha_medicion: -1 } }
    ).toArray();
    
    // 5. Construir jerarquía del proceso
    const procesoHierarchy = {
      ...proceso,
      objetivos: objetivos,
      indicadores: indicadores.map(indicador => ({
        ...indicador,
        mediciones: medicionesResult.filter(med => med.indicador_id === indicador.id)
      }))
    };
    
    console.log(`✅ Jerarquía del proceso ${id} construida`);
    res.json({
      success: true,
      data: procesoHierarchy,
      stats: {
        totalObjetivos: objetivos.length,
        totalIndicadores: indicadores.length,
        totalMediciones: medicionesResult.length
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

// GET /api/sgc/indicadores/:id/mediciones - Obtener mediciones de un indicador
router.get('/indicadores/:id/mediciones', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const organizationId = req.user?.organization_id || req.user?.org_id || 2;
    console.log(`📊 Obteniendo mediciones para indicador ${id} en organización ${organizationId}`);
    
    // 1. Verificar que el indicador existe
    const indicadoresCollection = mongoClient.collection('Indicadores');
    const indicador = await indicadoresCollection.findOne({
      id: id,
      organization_id: organizationId
    });
    
    if (!indicador) {
      return res.status(404).json({
        success: false,
        message: 'Indicador no encontrado'
      });
    }
    
    // 2. Obtener mediciones del indicador
    const medicionesCollection = mongoClient.collection('mediciones');
    const mediciones = await medicionesCollection.find(
      { 
        indicador_id: id,
        organization_id: organizationId
      },
      { sort: { fecha_medicion: -1 } }
    ).toArray();
    
    console.log(`✅ Obtenidas ${mediciones.length} mediciones para indicador ${id}`);
    res.json({
      success: true,
      data: {
        indicador: indicador,
        mediciones: mediciones
      },
      stats: {
        totalMediciones: mediciones.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener mediciones del indicador:', error);
    next({
      statusCode: 500,
      message: 'Error al obtener mediciones del indicador',
      error: error.message
    });
  }
});

module.exports = router; 