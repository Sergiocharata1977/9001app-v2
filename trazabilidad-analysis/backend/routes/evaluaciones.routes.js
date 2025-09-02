const { Router  } = require('express');
// Importar el nuevo controlador SGC estandarizado
const evaluacionesSgcController = require('../controllers/evaluacionesSgcController.js');
// Mantener el controlador legacy para compatibilidad si es necesario
const evaluacionesController = require('../controllers/evaluacionesController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = Router();

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// ===============================================
// RUTAS ACTUALIZADAS PARA USO DE SGC
// Ahora usa el controlador SGC estandarizado
// ===============================================

// GET /api/evaluaciones -> Obtener todas las evaluaciones individuales (SGC)
router.get('/', evaluacionesSgcController.getEvaluaciones);

// POST /api/evaluaciones -> Crear una nueva evaluación individual (SGC)
router.post('/', evaluacionesSgcController.createEvaluacion);

// GET /api/evaluaciones/estadisticas -> Obtener estadísticas de evaluaciones (SGC)
router.get('/estadisticas', evaluacionesSgcController.getEstadisticasEvaluaciones);

// GET /api/evaluaciones/:id -> Obtener una evaluación específica (SGC)
router.get('/:id', evaluacionesSgcController.getEvaluacionById);

// ===============================================
// NUEVOS ENDPOINTS ESPECÍFICOS SGC
// ===============================================

// GET /api/evaluaciones/:id/participantes -> Obtener participantes de una evaluación
router.get('/:id/participantes', evaluacionesSgcController.getParticipantesEvaluacion);

// GET /api/evaluaciones/:id/competencias -> Obtener competencias evaluadas
router.get('/:id/competencias', evaluacionesSgcController.getCompetenciasEvaluacion);

// ===============================================
// RUTAS LEGACY (para transición gradual)
// Mantener temporalmente para compatibilidad
// ===============================================

// GET /api/evaluaciones/legacy -> Usar el controlador original
router.get('/legacy', evaluacionesController.getEvaluaciones);

// GET /api/evaluaciones/legacy/estadisticas -> Estadísticas usando tablas originales
router.get('/legacy/estadisticas', evaluacionesController.getEstadisticasEvaluaciones);

// GET /api/evaluaciones/legacy/:id -> Evaluación específica usando tablas originales
router.get('/legacy/:id', evaluacionesController.getEvaluacionById);

module.exports = router;
