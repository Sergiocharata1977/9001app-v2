import { Router } from 'express';
import AIController from '../controllers/ai-controller';
import { tenantMiddleware, checkUserPermissions, checkUserRole } from '../middleware/tenant';

const router = Router();

// ============================================================================
// RUTAS DE AGENTES DE IA
// ============================================================================

/**
 * @route POST /api/org/:orgId/agents
 * @desc Crear un nuevo agente de IA
 * @access OrgAdmin, SuperAdmin
 */
router.post(
  '/agents',
  tenantMiddleware,
  checkUserRole(['OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['ai:create']),
  AIController.createAgent
);

/**
 * @route GET /api/org/:orgId/agents
 * @desc Listar agentes de IA de la organización
 * @access Auditor, Operador, OrgAdmin, SuperAdmin
 */
router.get(
  '/agents',
  tenantMiddleware,
  checkUserRole(['Auditor', 'Operador', 'OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['ai:read']),
  AIController.listAgents
);

/**
 * @route GET /api/org/:orgId/agents/:agentId
 * @desc Obtener un agente específico
 * @access Auditor, Operador, OrgAdmin, SuperAdmin
 */
router.get(
  '/agents/:agentId',
  tenantMiddleware,
  checkUserRole(['Auditor', 'Operador', 'OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['ai:read']),
  AIController.getAgent
);

/**
 * @route POST /api/org/:orgId/agents/:agentId/execute
 * @desc Ejecutar un agente de IA
 * @access Operador, OrgAdmin, SuperAdmin
 */
router.post(
  '/agents/:agentId/execute',
  tenantMiddleware,
  checkUserRole(['Operador', 'OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['ai:execute']),
  AIController.executeAgent
);

/**
 * @route POST /api/org/:orgId/agents/:agentId/train
 * @desc Entrenar un agente de IA
 * @access OrgAdmin, SuperAdmin
 */
router.post(
  '/agents/:agentId/train',
  tenantMiddleware,
  checkUserRole(['OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['ai:train']),
  AIController.trainAgent
);

/**
 * @route GET /api/org/:orgId/agents/stats
 * @desc Obtener estadísticas de agentes
 * @access Auditor, OrgAdmin, SuperAdmin
 */
router.get(
  '/agents/stats',
  tenantMiddleware,
  checkUserRole(['Auditor', 'OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['ai:read']),
  AIController.getAgentStats
);

// ============================================================================
// RUTAS DE RAG (RETRIEVAL AUGMENTED GENERATION)
// ============================================================================

/**
 * @route POST /api/org/:orgId/rag/ingest
 * @desc Ingestionar un documento para RAG
 * @access OrgAdmin, SuperAdmin
 */
router.post(
  '/rag/ingest',
  tenantMiddleware,
  checkUserRole(['OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['rag:ingest']),
  AIController.ingestDocument
);

/**
 * @route POST /api/org/:orgId/rag/search
 * @desc Buscar documentos RAG
 * @access Auditor, Operador, OrgAdmin, SuperAdmin
 */
router.post(
  '/rag/search',
  tenantMiddleware,
  checkUserRole(['Auditor', 'Operador', 'OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['rag:search']),
  AIController.searchDocuments
);

/**
 * @route POST /api/org/:orgId/rag/query
 * @desc Consulta RAG completa (búsqueda + generación)
 * @access Auditor, Operador, OrgAdmin, SuperAdmin
 */
router.post(
  '/rag/query',
  tenantMiddleware,
  checkUserRole(['Auditor', 'Operador', 'OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['rag:query']),
  AIController.queryRAG
);

/**
 * @route GET /api/org/:orgId/rag/documents
 * @desc Listar documentos RAG
 * @access Auditor, Operador, OrgAdmin, SuperAdmin
 */
router.get(
  '/rag/documents',
  tenantMiddleware,
  checkUserRole(['Auditor', 'Operador', 'OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['rag:read']),
  AIController.listDocuments
);

/**
 * @route DELETE /api/org/:orgId/rag/documents/:documentId
 * @desc Eliminar documento RAG
 * @access OrgAdmin, SuperAdmin
 */
router.delete(
  '/rag/documents/:documentId',
  tenantMiddleware,
  checkUserRole(['OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['rag:delete']),
  AIController.deleteDocument
);

/**
 * @route GET /api/org/:orgId/rag/stats
 * @desc Obtener estadísticas RAG
 * @access Auditor, OrgAdmin, SuperAdmin
 */
router.get(
  '/rag/stats',
  tenantMiddleware,
  checkUserRole(['Auditor', 'OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['rag:read']),
  AIController.getRAGStats
);

// ============================================================================
// RUTAS DE ASISTENCIA DE IA PARA PROCESOS
// ============================================================================

/**
 * @route POST /api/org/:orgId/ai/validate
 * @desc Validar proceso con IA
 * @access Operador, OrgAdmin, SuperAdmin
 */
router.post(
  '/ai/validate',
  tenantMiddleware,
  checkUserRole(['Operador', 'OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['ai:validate']),
  AIController.validateProcess
);

/**
 * @route POST /api/org/:orgId/ai/suggest
 * @desc Obtener sugerencias de IA para proceso
 * @access Operador, OrgAdmin, SuperAdmin
 */
router.post(
  '/ai/suggest',
  tenantMiddleware,
  checkUserRole(['Operador', 'OrgAdmin', 'SuperAdmin']),
  checkUserPermissions(['ai:suggest']),
  AIController.getProcessSuggestions
);

// ============================================================================
// RUTAS DE SUPER ADMIN (GLOBAL)
// ============================================================================

/**
 * @route POST /api/super/agents
 * @desc Crear agente global (Super Admin)
 * @access SuperAdmin
 */
router.post(
  '/super/agents',
  checkUserRole(['SuperAdmin']),
  AIController.createAgent
);

/**
 * @route GET /api/super/agents
 * @desc Listar agentes globales (Super Admin)
 * @access SuperAdmin
 */
router.get(
  '/super/agents',
  checkUserRole(['SuperAdmin']),
  AIController.listAgents
);

/**
 * @route GET /api/super/agents/stats
 * @desc Estadísticas globales de agentes (Super Admin)
 * @access SuperAdmin
 */
router.get(
  '/super/agents/stats',
  checkUserRole(['SuperAdmin']),
  AIController.getAgentStats
);

/**
 * @route POST /api/super/rag/ingest
 * @desc Ingestionar documento global (Super Admin)
 * @access SuperAdmin
 */
router.post(
  '/super/rag/ingest',
  checkUserRole(['SuperAdmin']),
  AIController.ingestDocument
);

/**
 * @route GET /api/super/rag/stats
 * @desc Estadísticas globales RAG (Super Admin)
 * @access SuperAdmin
 */
router.get(
  '/super/rag/stats',
  checkUserRole(['SuperAdmin']),
  AIController.getRAGStats
);

export default router;