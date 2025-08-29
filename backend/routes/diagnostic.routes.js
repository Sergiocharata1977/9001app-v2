const express = require('express');
const router = express.Router();
const diagnosticController = require('../controllers/diagnosticController.js');

// Rutas de diagnóstico del sistema (sin autenticación para facilitar debugging)

// GET /api/diagnostic/full - Diagnóstico completo del sistema
router.get('/full', diagnosticController.fullSystemDiagnostic);

// GET /api/diagnostic/backend - Diagnóstico específico del backend
router.get('/backend', diagnosticController.backendStatus);

// GET /api/diagnostic/quick - Verificación rápida del sistema
router.get('/quick', diagnosticController.quickCheck);

module.exports = router;