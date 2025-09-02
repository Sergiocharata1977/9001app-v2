const express = require('express');
const authMiddleware = require('../middleware/authMiddleware.js');
const {
  getAllCapacitaciones,
  getCapacitacionById,
  createCapacitacion,
  updateCapacitacion,
  deleteCapacitacion,
  getTemasByCapacitacion,
  createTema,
  getAsistentesByCapacitacion,
  addAsistente
} = require('../controllers/capacitacionesController.js');

const router = express.Router();

// ===============================================
// RUTAS PRINCIPALES DE CAPACITACIONES
// ===============================================

// GET /api/capacitaciones - Obtener todas las capacitaciones
router.get('/', authMiddleware, getAllCapacitaciones);

// GET /api/capacitaciones/:id - Obtener capacitación por ID
router.get('/:id', authMiddleware, getCapacitacionById);

// POST /api/capacitaciones - Crear nueva capacitación
router.post('/', authMiddleware, createCapacitacion);

// PUT /api/capacitaciones/:id - Actualizar capacitación
router.put('/:id', authMiddleware, updateCapacitacion);

// DELETE /api/capacitaciones/:id - Eliminar capacitación
router.delete('/:id', authMiddleware, deleteCapacitacion);

// ===============================================
// RUTAS DE TEMAS DE CAPACITACIÓN
// ===============================================

// GET /api/capacitaciones/:id/temas - Obtener temas de una capacitación
router.get('/:id/temas', authMiddleware, getTemasByCapacitacion);

// POST /api/capacitaciones/:id/temas - Crear tema para capacitación
router.post('/:id/temas', authMiddleware, createTema);

// ===============================================
// RUTAS DE ASISTENTES DE CAPACITACIÓN
// ===============================================

// GET /api/capacitaciones/:id/asistentes - Obtener asistentes de una capacitación
router.get('/:id/asistentes', authMiddleware, getAsistentesByCapacitacion);

// POST /api/capacitaciones/:id/asistentes - Agregar asistente a capacitación
router.post('/:id/asistentes', authMiddleware, addAsistente);

module.exports = router;
