const { Router  } = require('express');
const competenciasController = require('../controllers/competenciasController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = Router();

// Listar todas las competencias
router.get('/', authMiddleware, competenciasController.getCompetencias);
// Crear una competencia
router.post('/', authMiddleware, competenciasController.createCompetencia);
// Actualizar una competencia
router.put('/:id', authMiddleware, competenciasController.updateCompetencia);
// Eliminar una competencia
router.delete('/:id', authMiddleware, competenciasController.deleteCompetencia);

module.exports = router; 