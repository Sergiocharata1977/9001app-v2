const { Router } = require('express');
const evaluacionesSgcController = require('../controllers/evaluacionesSgcController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = Router();

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// ===============================================
// RUTAS EVALUACIONES SGC ESTANDARIZADO
// Usa las tablas genéricas SGC manteniendo compatibilidad
// ===============================================

// GET /api/evaluaciones-sgc -> Obtener todas las evaluaciones individuales
router.get('/', evaluacionesSgcController.getEvaluaciones);

// POST /api/evaluaciones-sgc -> Crear una nueva evaluación individual
router.post('/', evaluacionesSgcController.createEvaluacion);

// GET /api/evaluaciones-sgc/estadisticas -> Obtener estadísticas de evaluaciones
router.get('/estadisticas', evaluacionesSgcController.getEstadisticasEvaluaciones);

// GET /api/evaluaciones-sgc/:id -> Obtener una evaluación específica
router.get('/:id', evaluacionesSgcController.getEvaluacionById);

// ===============================================
// NUEVOS ENDPOINTS ESPECÍFICOS SGC
// ===============================================

// GET /api/evaluaciones-sgc/:id/participantes -> Obtener participantes de una evaluación
router.get('/:id/participantes', evaluacionesSgcController.getParticipantesEvaluacion);

// GET /api/evaluaciones-sgc/:id/competencias -> Obtener competencias evaluadas
router.get('/:id/competencias', evaluacionesSgcController.getCompetenciasEvaluacion);

module.exports = router;
