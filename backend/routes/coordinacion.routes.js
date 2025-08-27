const express = require('express');
const router = express.Router();
const coordinacionController = require('../controllers/coordinacionController.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const adminMiddleware = require('../middleware/adminMiddleware.js');

// Aplicar middleware de autenticación solo a rutas específicas
// router.use(authMiddleware);

// Rutas públicas (requieren autenticación)
router.get('/log-tareas', authMiddleware, coordinacionController.leerLogTareas);
router.get('/tareas', authMiddleware, coordinacionController.obtenerTareas);
router.get('/tareas/:tareaNumero', authMiddleware, coordinacionController.obtenerTareaPorNumero);
router.get('/estadisticas', authMiddleware, coordinacionController.obtenerEstadisticas);
router.get('/buscar', authMiddleware, coordinacionController.buscarTareas);
router.get('/modulo/:modulo', authMiddleware, coordinacionController.obtenerTareasPorModulo);
router.get('/estado/:estado', authMiddleware, coordinacionController.obtenerTareasPorEstado);

// Rutas de administración (requieren permisos de admin)
router.use(adminMiddleware);

router.post('/tareas', coordinacionController.crearTarea);
router.put('/tareas/:tareaNumero', coordinacionController.actualizarTarea);
router.delete('/tareas/:tareaNumero', coordinacionController.eliminarTarea);
router.post('/sincronizar', coordinacionController.sincronizarDesdeDocumentacion);

module.exports = router;
