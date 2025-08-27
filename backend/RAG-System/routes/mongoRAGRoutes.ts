import { Router } from 'express';
import { MongoDBRAGController } from '../controllers/mongodbRAGController';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();
const ragController = new MongoDBRAGController();

/**
 * Rutas para el Sistema RAG con MongoDB e IA
 * Todas las rutas requieren autenticación
 */

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * POST /api/rag/query
 * Procesa una consulta RAG con IA
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
 * Prueba la conectividad con MongoDB
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
 * GET /api/rag/health
 * Verificación de salud del sistema RAG
 */
router.get('/health', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Sistema RAG con MongoDB funcionando correctamente',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: [
        'Consulta RAG con IA',
        'Búsqueda semántica',
        'Análisis de insights',
        'Sugerencias inteligentes',
        'Estadísticas en tiempo real'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error en verificación de salud del sistema RAG'
    });
  }
});

export default router;
