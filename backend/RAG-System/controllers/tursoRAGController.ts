import { Request, Response } from 'express';
import { TursoRAGService } from '../services/tursoRAGService';

interface RAGQueryRequest {
  question: string;
  organizationId?: string;
  maxResults?: number;
  includeSources?: boolean;
  contextSize?: number;
}

/**
 * Controlador para el sistema RAG con Turso e IA
 */
export class TursoRAGController {
  private ragService: TursoRAGService;

  constructor() {
    // MongoDB
    const tursoConfig = {
      url: process.env.MONGODB_URI || 'mongodb://isoflow4-sergiocharata1977.turso.io',
      authToken: process.env.MONGODB_AUTH_TOKEN || ''
    };

    const openaiApiKey = process.env.OPENAI_API_KEY || '';
    
    this.ragService = new TursoRAGService(tursoConfig, openaiApiKey);
  }

  /**
   * Procesa una consulta RAG
   */
  async processQuery(req: Request, res: Response): Promise<void> {
    try {
      const { question, organizationId, maxResults, includeSources, contextSize }: RAGQueryRequest = req.body;

      // Validar entrada
      if (!question || typeof question !== 'string') {
        res.status(400).json({
          success: false,
          error: 'La pregunta es requerida y debe ser una cadena de texto'
        });
        return;
      }

      if (question.length < 3) {
        res.status(400).json({
          success: false,
          error: 'La pregunta debe tener al menos 3 caracteres'
        });
        return;
      }

      if (question.length > 500) {
        res.status(400).json({
          success: false,
          error: 'La pregunta no puede exceder 500 caracteres'
        });
        return;
      }

      console.log(`📝 Nueva consulta RAG: "${question}"`);

      // Procesar consulta
      const result = await this.ragService.processQuery({
        question,
        organizationId,
        maxResults: maxResults || 10,
        includeSources: includeSources !== false,
        contextSize: contextSize || 5
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('❌ Error en controlador RAG:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtiene estadísticas del sistema RAG
   */
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { organizationId } = req.query;

      console.log(`📊 Obteniendo estadísticas RAG para organización: ${organizationId || 'todas'}`);

      const stats = await this.ragService.getSystemStats(
        organizationId as string || undefined
      );

      res.json({
        success: true,
        data: {
          ...stats,
          timestamp: new Date().toISOString(),
          system: 'Turso RAG System'
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas RAG:', error);
      res.status(500).json({
        success: false,
        error: 'Error obteniendo estadísticas del sistema',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Prueba de conectividad con Turso
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔍 Probando conectividad con Turso...');

      // Intentar una consulta simple
      const testResult = await this.ragService.processQuery({
        question: 'test connection',
        maxResults: 1,
        includeSources: false
      });

      res.json({
        success: true,
        message: 'Conexión exitosa con Turso',
        data: {
          processingTime: testResult.processingTime,
          timestamp: testResult.timestamp
        }
      });

    } catch (error) {
      console.error('❌ Error de conectividad con Turso:', error);
      res.status(500).json({
        success: false,
        error: 'Error de conectividad con Turso',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Búsqueda semántica avanzada
   */
  async semanticSearch(req: Request, res: Response): Promise<void> {
    try {
      const { query, filters, limit = 20 }: any = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'La consulta es requerida'
        });
        return;
      }

      console.log(`🔍 Búsqueda semántica: "${query}"`);

      // Procesar con filtros adicionales
      const result = await this.ragService.processQuery({
        question: query,
        maxResults: limit,
        includeSources: true,
        contextSize: 10
      });

      // Aplicar filtros adicionales si se especifican
      let filteredSources = result.sources;
      if (filters && filters.tipo) {
        filteredSources = result.sources.filter(source => 
          source.tipo === filters.tipo
        );
      }

      res.json({
        success: true,
        data: {
          ...result,
          sources: filteredSources,
          appliedFilters: filters || {}
        }
      });

    } catch (error) {
      console.error('❌ Error en búsqueda semántica:', error);
      res.status(500).json({
        success: false,
        error: 'Error en búsqueda semántica',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Análisis de tendencias y insights
   */
  async getInsights(req: Request, res: Response): Promise<void> {
    try {
      const { organizationId, timeRange = '30d' }: any = req.query;

      console.log(`📈 Generando insights para organización: ${organizationId || 'todas'}`);

      // Obtener estadísticas
      const stats = await this.ragService.getSystemStats(
        organizationId as string || undefined
      );

      // Generar insights con IA
      const insightsQuery = `Analiza las siguientes estadísticas del sistema de gestión de calidad y genera insights relevantes: ${JSON.stringify(stats)}`;
      
      const insights = await this.ragService.processQuery({
        question: insightsQuery,
        maxResults: 5,
        includeSources: false
      });

      res.json({
        success: true,
        data: {
          stats,
          insights: insights.answer,
          timeRange,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error generando insights:', error);
      res.status(500).json({
        success: false,
        error: 'Error generando insights',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Sugerencias de consultas relacionadas
   */
  async getSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { query, limit = 5 }: any = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'La consulta es requerida'
        });
        return;
      }

      console.log(`💡 Generando sugerencias para: "${query}"`);

      // Generar sugerencias con IA
      const suggestionsQuery = `Basándote en la consulta "${query}", genera ${limit} sugerencias de consultas relacionadas para un sistema de gestión de calidad ISO 9001. Responde solo con las sugerencias, una por línea.`;
      
      const result = await this.ragService.processQuery({
        question: suggestionsQuery,
        maxResults: 1,
        includeSources: false
      });

      // Parsear sugerencias
      const suggestions = result.answer
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, limit)
        .map(suggestion => suggestion.replace(/^\d+\.\s*/, '').trim());

      res.json({
        success: true,
        data: {
          originalQuery: query,
          suggestions,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Error generando sugerencias:', error);
      res.status(500).json({
        success: false,
        error: 'Error generando sugerencias',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}
