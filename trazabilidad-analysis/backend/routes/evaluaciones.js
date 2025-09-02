const express = require('express');
const router = express.Router();

// GET - Obtener todas las evaluaciones
router.get('/', (req, res) => {
  res.json({ message: 'Evaluaciones endpoint working' });
});

// GET - Obtener una evaluación específica
router.get('/:id', (req, res) => {
  res.json({ message: 'Evaluación específica endpoint working', id: req.params.id });
});

// POST - Crear nueva evaluación
router.post('/', (req, res) => {
  res.json({ message: 'Crear evaluación endpoint working' });
});

// PUT - Actualizar evaluación
router.put('/:id', (req, res) => {
  res.json({ message: 'Actualizar evaluación endpoint working', id: req.params.id });
});

// DELETE - Eliminar evaluación
router.delete('/:id', (req, res) => {
  res.json({ message: 'Eliminar evaluación endpoint working', id: req.params.id });
});

// GET - Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Evaluaciones service running' });
});

module.exports = router; 