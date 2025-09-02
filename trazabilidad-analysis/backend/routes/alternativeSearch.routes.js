const express = require('express');
const router = express.Router();
const SimpleSearchSystem = require('../services/simpleSearchService.js');
const DirectQuerySystem = require('../services/directQueryService.js');

// Middleware de autenticación
const authMiddleware = require('../middleware/authMiddleware.js');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// ===== SISTEMA DE BÚSQUEDA SIMPLE =====
router.post('/simple-search', async (req, res) => {
  try {
    const { query, organizationId } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({
        error: 'Query requerida',
        message: 'Debe proporcionar un término de búsqueda'
      });
    }
    
    const results = await SimpleSearchSystem.search(query, organizationId);
    
    res.json({
      query: query,
      results: results,
      totalFound: results.length,
      system: 'simple-search',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en búsqueda simple:', error);
    res.status(500).json({
      error: 'Error en búsqueda',
      message: error.message
    });
  }
});

router.get('/simple-stats', async (req, res) => {
  try {
    const stats = await SimpleSearchSystem.getStats();
    
    res.json({
      stats: stats,
      system: 'simple-search',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      message: error.message
    });
  }
});

// ===== SISTEMA DE CONSULTAS DIRECTAS =====
router.get('/direct/personal', async (req, res) => {
  try {
    const organizationId = req.user?.organization_id || 1;
    const personal = await DirectQuerySystem.queryPersonal(organizationId);
    
    res.json({
      data: personal,
      system: 'direct-query',
      type: 'personal',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error consultando personal:', error);
    res.status(500).json({
      error: 'Error consultando personal',
      message: error.message
    });
  }
});

router.get('/direct/normas', async (req, res) => {
  try {
    const normas = await DirectQuerySystem.queryNormas();
    
    res.json({
      data: normas,
      system: 'direct-query',
      type: 'normas',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error consultando normas:', error);
    res.status(500).json({
      error: 'Error consultando normas',
      message: error.message
    });
  }
});

router.get('/direct/procesos', async (req, res) => {
  try {
    const organizationId = req.user?.organization_id || 1;
    const procesos = await DirectQuerySystem.queryProcesos(organizationId);
    
    res.json({
      data: procesos,
      system: 'direct-query',
      type: 'procesos',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error consultando procesos:', error);
    res.status(500).json({
      error: 'Error consultando procesos',
      message: error.message
    });
  }
});

router.get('/direct/indicadores', async (req, res) => {
  try {
    const organizationId = req.user?.organization_id || 1;
    const indicadores = await DirectQuerySystem.queryIndicadores(organizationId);
    
    res.json({
      data: indicadores,
      system: 'direct-query',
      type: 'indicadores',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error consultando indicadores:', error);
    res.status(500).json({
      error: 'Error consultando indicadores',
      message: error.message
    });
  }
});

module.exports = router;
