const express = require('express');
const router = express.Router();
const RAGController = require('../controllers/ragController');
const authMiddleware = require('../middleware/authMiddleware');

const ragController = new RAGController();

/**
 * Rutas para el Sistema RAG
 * Todas las rutas requieren autenticación
 */

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * POST /api/rag/query
 * Procesa una consulta RAG
 * Body: { question, organizationId?, maxResults?, includeSources?, contextSize? }
 */
router.post('/query', async (req, res) => {
  await ragController.processQuery(req, res);
});

/**
 * GET /api/rag/stats
 * Obtiene estadísticas del sistema RAG
 * Query: { organizationId? }
 */
router.get('/stats', async (req, res) => {
  await ragController.getStats(req, res);
});

/**
 * GET /api/rag/test-connection
 * Prueba la conectividad con Turso
 */
router.get('/test-connection', async (req, res) => {
  await ragController.testConnection(req, res);
});

/**
 * POST /api/rag/semantic-search
 * Búsqueda semántica avanzada
 * Body: { query, filters?, limit? }
 */
router.post('/semantic-search', async (req, res) => {
  await ragController.semanticSearch(req, res);
});

/**
 * GET /api/rag/insights
 * Genera insights y análisis de tendencias
 * Query: { organizationId?, timeRange? }
 */
router.get('/insights', async (req, res) => {
  await ragController.getInsights(req, res);
});

/**
 * GET /api/rag/suggestions
 * Obtiene sugerencias de consultas relacionadas
 * Query: { query, limit? }
 */
router.get('/suggestions', async (req, res) => {
  await ragController.getSuggestions(req, res);
});

/**
 * POST /api/rag/create-table
 * Crea la tabla RAG en Turso
 */
router.post('/create-table', async (req, res) => {
  await ragController.createRAGTable(req, res);
});

/**
 * GET /api/rag/health
 * Verificación de salud del sistema RAG
 */
router.get('/health', async (req, res) => {
  await ragController.healthCheck(req, res);
});

module.exports = router;
