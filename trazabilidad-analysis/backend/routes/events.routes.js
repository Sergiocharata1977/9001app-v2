const express = require('express');
const router = express.Router();

// GET /api/events - Endpoint básico para evitar error 404
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Endpoint de eventos - no implementado aún'
  });
});

module.exports = router;
