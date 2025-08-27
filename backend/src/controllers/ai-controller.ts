import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import AIAgentService, { AgentType } from '../services/ai-agents';
import RAGService from '../services/rag-service';
import { logAI, logError, logAudit } from '../utils/logger';
import { AISuggestionResponse, ValidationResult } from '../types';

class AIController {
  /**
   * Crear un nuevo agente de IA
   */
  public async createAgent(req: Request, res: Response): Promise<void> {
    try {
      const { name, type, capabilities, configuration } = req.body;
      const organizationId = req.organizationId!;

      if (!name || !type || !capabilities) {
        res.status(400).json({
          error: 'Missing required fields: name, type, capabilities',
          code: 'MISSING_REQUIRED_FIELDS'
        });
        return;
      }

      if (!Object.values(AgentType).includes(type)) {
        res.status(400).json({
          error: 'Invalid agent type',
          code: 'INVALID_AGENT_TYPE',
          validTypes: Object.values(AgentType)
        });
        return;
      }

      const agent = await AIAgentService.createAgent(
        organizationId,
        name,
        type as AgentType,
        capabilities,
        configuration
      );

      logAudit('AI Agent created', {
        user: req.user?.email,
        organization: req.organization?.name,
        action: 'CREATE_AGENT',
        resource: `ai_agents/${agent._id}`,
        details: { name, type, capabilities }
      });

      res.status(201).json({
        success: true,
        data: agent,
        message: 'AI Agent created successfully'
      });
    } catch (error) {
      logError('Error creating AI agent', error as Error, { 
        organizationId: req.organizationId,
        body: req.body 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'AGENT_CREATION_ERROR'
      });
    }
  }

  /**
   * Listar agentes de IA
   */
  public async listAgents(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.organizationId!;
      const { type } = req.query;

      const agents = await AIAgentService.listAgents(organizationId, type as string);

      res.status(200).json({
        success: true,
        data: agents,
        count: agents.length
      });
    } catch (error) {
      logError('Error listing AI agents', error as Error, { 
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'AGENT_LIST_ERROR'
      });
    }
  }

  /**
   * Obtener un agente específico
   */
  public async getAgent(req: Request, res: Response): Promise<void> {
    try {
      const { agentId } = req.params;
      const organizationId = req.organizationId!;

      const agent = await AIAgentService.getAgent(agentId, organizationId);

      if (!agent) {
        res.status(404).json({
          error: 'Agent not found',
          code: 'AGENT_NOT_FOUND'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: agent
      });
    } catch (error) {
      logError('Error getting AI agent', error as Error, { 
        agentId: req.params.agentId,
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'AGENT_GET_ERROR'
      });
    }
  }

  /**
   * Ejecutar un agente de IA
   */
  public async executeAgent(req: Request, res: Response): Promise<void> {
    try {
      const { agentId } = req.params;
      const { input, context } = req.body;
      const organizationId = req.organizationId!;

      if (!input) {
        res.status(400).json({
          error: 'Input data is required',
          code: 'MISSING_INPUT_DATA'
        });
        return;
      }

      const suggestions = await AIAgentService.executeAgent(
        agentId,
        organizationId,
        input,
        context
      );

      const response: AISuggestionResponse = {
        suggestions,
        confidence: suggestions.length > 0 ? 
          suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length : 0,
        reasoning: 'Agent execution completed successfully',
        metadata: {
          agent_id: agentId,
          organization_id: organizationId,
          timestamp: new Date().toISOString()
        }
      };

      logAI(`Agente ejecutado exitosamente`, {
        agent: agentId,
        organization: organizationId,
        suggestionsCount: suggestions.length,
        user: req.user?.email
      });

      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      logError('Error executing AI agent', error as Error, { 
        agentId: req.params.agentId,
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'AGENT_EXECUTION_ERROR'
      });
    }
  }

  /**
   * Entrenar un agente de IA
   */
  public async trainAgent(req: Request, res: Response): Promise<void> {
    try {
      const { agentId } = req.params;
      const { examples } = req.body;
      const organizationId = req.organizationId!;

      if (!examples || !Array.isArray(examples) || examples.length === 0) {
        res.status(400).json({
          error: 'Training examples are required',
          code: 'MISSING_TRAINING_EXAMPLES'
        });
        return;
      }

      await AIAgentService.trainAgent(agentId, organizationId, examples);

      logAudit('AI Agent training started', {
        user: req.user?.email,
        organization: req.organization?.name,
        action: 'TRAIN_AGENT',
        resource: `ai_agents/${agentId}`,
        details: { examplesCount: examples.length }
      });

      res.status(200).json({
        success: true,
        message: 'Agent training started successfully',
        data: {
          agent_id: agentId,
          examples_count: examples.length,
          status: 'training'
        }
      });
    } catch (error) {
      logError('Error training AI agent', error as Error, { 
        agentId: req.params.agentId,
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'AGENT_TRAINING_ERROR'
      });
    }
  }

  /**
   * Obtener estadísticas de agentes
   */
  public async getAgentStats(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.organizationId!;

      const stats = await AIAgentService.getAgentStats(organizationId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logError('Error getting agent stats', error as Error, { 
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'AGENT_STATS_ERROR'
      });
    }
  }

  /**
   * Ingestionar documento RAG
   */
  public async ingestDocument(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, type, source, metadata } = req.body;
      const organizationId = req.organizationId!;

      if (!title || !content || !type || !source) {
        res.status(400).json({
          error: 'Missing required fields: title, content, type, source',
          code: 'MISSING_REQUIRED_FIELDS'
        });
        return;
      }

      const document = await RAGService.ingestDocument(
        organizationId,
        title,
        content,
        type,
        source,
        metadata
      );

      logAudit('RAG Document ingested', {
        user: req.user?.email,
        organization: req.organization?.name,
        action: 'INGEST_DOCUMENT',
        resource: `rag_documents/${document._id}`,
        details: { title, type, source }
      });

      res.status(201).json({
        success: true,
        data: document,
        message: 'Document ingested successfully'
      });
    } catch (error) {
      logError('Error ingesting RAG document', error as Error, { 
        organizationId: req.organizationId,
        body: req.body 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'DOCUMENT_INGESTION_ERROR'
      });
    }
  }

  /**
   * Buscar documentos RAG
   */
  public async searchDocuments(req: Request, res: Response): Promise<void> {
    try {
      const { query, limit, filters } = req.body;
      const organizationId = req.organizationId!;

      if (!query) {
        res.status(400).json({
          error: 'Query is required',
          code: 'MISSING_QUERY'
        });
        return;
      }

      const results = await RAGService.searchDocuments(
        organizationId,
        query,
        limit || 5,
        filters
      );

      res.status(200).json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (error) {
      logError('Error searching RAG documents', error as Error, { 
        organizationId: req.organizationId,
        body: req.body 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'DOCUMENT_SEARCH_ERROR'
      });
    }
  }

  /**
   * Consulta RAG completa
   */
  public async queryRAG(req: Request, res: Response): Promise<void> {
    try {
      const { query, options } = req.body;
      const organizationId = req.organizationId!;
      const userId = req.user?._id.toString() || 'anonymous';

      if (!query) {
        res.status(400).json({
          error: 'Query is required',
          code: 'MISSING_QUERY'
        });
        return;
      }

      const result = await RAGService.queryRAG(
        organizationId,
        query,
        userId,
        options
      );

      logAI(`Consulta RAG completada`, {
        organization: organizationId,
        query,
        user: req.user?.email,
        responseTime: result.metadata.response_time,
        confidenceScore: result.metadata.confidence_score
      });

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logError('Error in RAG query', error as Error, { 
        organizationId: req.organizationId,
        body: req.body 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'RAG_QUERY_ERROR'
      });
    }
  }

  /**
   * Listar documentos RAG
   */
  public async listDocuments(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.organizationId!;
      const { status, type, category } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (category) filters.category = category;

      const documents = await RAGService.listDocuments(organizationId, filters);

      res.status(200).json({
        success: true,
        data: documents,
        count: documents.length
      });
    } catch (error) {
      logError('Error listing RAG documents', error as Error, { 
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'DOCUMENT_LIST_ERROR'
      });
    }
  }

  /**
   * Eliminar documento RAG
   */
  public async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      const organizationId = req.organizationId!;

      await RAGService.deleteDocument(documentId, organizationId);

      logAudit('RAG Document deleted', {
        user: req.user?.email,
        organization: req.organization?.name,
        action: 'DELETE_DOCUMENT',
        resource: `rag_documents/${documentId}`
      });

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      logError('Error deleting RAG document', error as Error, { 
        documentId: req.params.documentId,
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'DOCUMENT_DELETION_ERROR'
      });
    }
  }

  /**
   * Obtener estadísticas RAG
   */
  public async getRAGStats(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.organizationId!;

      const stats = await RAGService.getRAGStats(organizationId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logError('Error getting RAG stats', error as Error, { 
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'RAG_STATS_ERROR'
      });
    }
  }

  /**
   * Validar proceso con IA
   */
  public async validateProcess(req: Request, res: Response): Promise<void> {
    try {
      const { process, data } = req.body;
      const organizationId = req.organizationId!;

      if (!process || !data) {
        res.status(400).json({
          error: 'Process and data are required',
          code: 'MISSING_PROCESS_DATA'
        });
        return;
      }

      // Buscar agente de validación
      const agents = await AIAgentService.listAgents(organizationId, 'validation');
      const validationAgent = agents.find(agent => agent.capabilities.includes('process_validation'));

      if (!validationAgent) {
        res.status(404).json({
          error: 'Validation agent not found',
          code: 'VALIDATION_AGENT_NOT_FOUND'
        });
        return;
      }

      const suggestions = await AIAgentService.executeAgent(
        validationAgent._id.toString(),
        organizationId,
        { process, data },
        { validation_type: 'process_validation' }
      );

      const validationResult: ValidationResult = {
        valid: suggestions.every(s => s.type !== 'validation' || s.confidence > 0.7),
        errors: suggestions
          .filter(s => s.type === 'validation' && s.confidence > 0.7)
          .map(s => s.content),
        warnings: suggestions
          .filter(s => s.type === 'validation' && s.confidence <= 0.7)
          .map(s => s.content)
      };

      res.status(200).json({
        success: true,
        data: validationResult
      });
    } catch (error) {
      logError('Error validating process with AI', error as Error, { 
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'PROCESS_VALIDATION_ERROR'
      });
    }
  }

  /**
   * Obtener sugerencias de IA para proceso
   */
  public async getProcessSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { process, currentState, data } = req.body;
      const organizationId = req.organizationId!;

      if (!process || !currentState) {
        res.status(400).json({
          error: 'Process and current state are required',
          code: 'MISSING_PROCESS_STATE'
        });
        return;
      }

      // Buscar agente de sugerencias
      const agents = await AIAgentService.listAgents(organizationId, 'suggestion');
      const suggestionAgent = agents.find(agent => agent.capabilities.includes('process_suggestions'));

      if (!suggestionAgent) {
        res.status(404).json({
          error: 'Suggestion agent not found',
          code: 'SUGGESTION_AGENT_NOT_FOUND'
        });
        return;
      }

      const suggestions = await AIAgentService.executeAgent(
        suggestionAgent._id.toString(),
        organizationId,
        { process, currentState, data },
        { suggestion_type: 'process_suggestions' }
      );

      res.status(200).json({
        success: true,
        data: {
          suggestions,
          confidence: suggestions.length > 0 ? 
            suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length : 0
        }
      });
    } catch (error) {
      logError('Error getting process suggestions', error as Error, { 
        organizationId: req.organizationId 
      });
      res.status(500).json({
        error: 'Internal server error',
        code: 'PROCESS_SUGGESTIONS_ERROR'
      });
    }
  }
}

export default new AIController();