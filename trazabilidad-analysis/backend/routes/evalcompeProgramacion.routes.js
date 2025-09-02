const { Router  } = require('express');
const { getProgramaciones,
  createProgramacion,
  getProgramacionById,
  updateProgramacion,
  deleteProgramacion,
 } = require('../controllers/evaluacionProgramacionController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = Router();

// Proteger todas las rutas de este módulo con autenticación
router.use(authMiddleware);

// Definición de rutas para la programación de evaluaciones

// GET /api/evaluacion-programacion -> Obtener todas las programaciones
router.get('/', getProgramaciones);

// POST /api/evaluacion-programacion -> Crear una nueva programación
router.post('/', createProgramacion);

// GET /api/evaluacion-programacion/:id -> Obtener una programación por ID
router.get('/:id', getProgramacionById);

// PUT /api/evaluacion-programacion/:id -> Actualizar una programación
router.put('/:id', updateProgramacion);

// DELETE /api/evaluacion-programacion/:id -> Eliminar una programación
router.delete('/:id', deleteProgramacion);

// DELETE /api/evaluacion-programacion/:id -> Eliminar una programación (pendiente)
router.delete('/:id', (req, res) => {
  res.status(501).json({ message: 'Ruta para eliminar no implementada.' });
});

module.exports = router;
