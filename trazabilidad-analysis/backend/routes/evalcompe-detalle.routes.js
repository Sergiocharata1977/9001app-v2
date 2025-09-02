const { Router  } = require('express');
const { getDetallesPorProgramacion,
  createDetalle,
 } = require('../controllers/evaluacionDetalleController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = Router();

// Proteger todas las rutas de este módulo
router.use(authMiddleware);

// Rutas para los detalles de la evaluación de competencias

// GET /api/evaluacion-detalle/programacion/:programacionId -> Obtener todos los detalles de una programación
router.get('/programacion/:programacionId', getDetallesPorProgramacion);

// POST /api/evaluacion-detalle -> Crear un nuevo detalle (puntaje)
router.post('/', createDetalle);

// GET /api/evaluacion-detalle/:id -> Obtener un detalle por ID (pendiente)
router.get('/:id', (req, res) => {
  res.status(501).json({ message: 'Ruta para obtener detalle por ID no implementada.' });
});

// PUT /api/evaluacion-detalle/:id -> Actualizar un detalle (pendiente)
router.put('/:id', (req, res) => {
  res.status(501).json({ message: 'Ruta para actualizar detalle no implementada.' });
});

// DELETE /api/evaluacion-detalle/:id -> Eliminar un detalle (pendiente)
router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Ruta para eliminar detalle no implementada.' });
});

module.exports = router;
