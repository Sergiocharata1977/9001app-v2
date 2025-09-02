const express = require('express');
const { getOrganizationPlanes } = require('../controllers/planesController.js');
const router = express.Router();

// GET - Obtener todos los planes
router.get('/', getOrganizationPlanes);

// GET - Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Planes service running' });
});

module.exports = router; 