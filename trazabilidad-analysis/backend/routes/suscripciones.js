const express = require('express');
const { getSuscripcionActual, createSuscripcion, cancelSuscripcion } = require('../controllers/planesController.js');
const router = express.Router();

// GET - Obtener suscripción de la organización actual
router.get('/organizacion/actual', getSuscripcionActual);

// POST - Crear nueva suscripción
router.post('/', createSuscripcion);

// DELETE - Cancelar suscripción
router.delete('/:id', cancelSuscripcion);

// GET - Debug endpoint
router.get('/debug', (req, res) => {
  res.json({ 
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    user: req.user
  });
});

// GET - Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Suscripciones service running' });
});

module.exports = router; 