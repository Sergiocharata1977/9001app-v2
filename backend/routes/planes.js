const express = require('express');
const { 
  getOrganizationPlanes, 
  getPlanById, 
  getPlanesStats 
} = require('../controllers/planesController.js');
const router = express.Router();

// GET - Obtener todos los planes
router.get('/', getOrganizationPlanes);

// GET - Obtener plan específico por ID
router.get('/:id', getPlanById);

// GET - Obtener estadísticas de planes
router.get('/stats/summary', getPlanesStats);

// GET - Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Planes service running with MongoDB' });
});

module.exports = router; 