const express = require('express');
const router = express.Router();
const {
  getFileStructure,
  regenerateFileStructure,
  getFileStructureStats,
  getFileStructureSection,
  getFileTypes,
  getFileStructureStatus
} = require('../controllers/fileStructureController');
const authMiddleware = require('../middleware/authMiddleware');
// const adminMiddleware = require('../middleware/adminMiddleware');

/**
 * Rutas para la estructura de archivos del sistema
 * Todas las rutas requieren autenticación y permisos de administrador
 */

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);
// TODO: Agregar adminMiddleware cuando esté funcionando
// router.use(adminMiddleware);

/**
 * GET /api/file-structure
 * Obtiene la estructura completa de archivos del sistema
 */
router.get('/', getFileStructure);

/**
 * POST /api/file-structure/regenerate
 * Regenera la estructura de archivos del sistema
 */
router.post('/regenerate', regenerateFileStructure);

/**
 * GET /api/file-structure/stats
 * Obtiene estadísticas básicas de la estructura de archivos
 */
router.get('/stats', getFileStructureStats);

/**
 * GET /api/file-structure/status
 * Obtiene el estado de la estructura de archivos
 */
router.get('/status', getFileStructureStatus);

/**
 * GET /api/file-structure/file-types
 * Obtiene estadísticas de tipos de archivo
 */
router.get('/file-types', getFileTypes);

/**
 * GET /api/file-structure/section/:sectionName
 * Obtiene la estructura de una sección específica
 * Secciones disponibles: backend, frontend, documentation, scripts
 */
router.get('/section/:sectionName', getFileStructureSection);

module.exports = router;
