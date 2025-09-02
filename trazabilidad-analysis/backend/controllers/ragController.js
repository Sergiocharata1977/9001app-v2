const mongoClient = require('../lib/mongoClient.js');

/**
 * Controlador para el sistema RAG
 * Maneja las peticiones HTTP para consultas RAG
 */
class RAGController {
  constructor() {
    this.ragService = new RAGService();
  }

  /**
   * Crea la tabla RAG en Turso por API
   */
  async createRAGTable(req, res) {
    try {
      console.log('🔧 Creando tabla RAG en Turso...');

      const result = await this.ragService.createRAGTable();

      res.json({
        success: true,
        message: 'Tabla RAG creada exitosamente',
        data: result
      });

    } catch (error) {
      console.error('❌ Error creando tabla RAG:', error);
      res.status(500).json({
        success: false,
        error: 'Error creando tabla RAG',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Procesa una consulta RAG
   */
  async processQuery(req, res) {
    try {
      const { question, organizationId, maxResults, includeSources, contextSize } = req.body;

      // Validar entrada
      if (!question || typeof question !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'La pregunta es requerida y debe ser una cadena de texto'
        });
      }

      if (question.length < 3) {
        return res.status(400).json({
          success: false,
          error: 'La pregunta debe tener al menos 3 caracteres'
        });
      }

      if (question.length > 500) {
        return res.status(400).json({
          success: false,
          error: 'La pregunta no puede exceder 500 caracteres'
        });
      }

      console.log(`📝 Nueva consulta RAG: "${question}"`);

      // Procesar consulta
      const result = await this.ragService.processQuery(question, organizationId || 'default', {
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
  async getStats(req, res) {
    try {
      const { organizationId } = req.query;

      console.log(`📊 Obteniendo estadísticas RAG para organización: ${organizationId || 'default'}`);

      const stats = await this.ragService.getSystemStats(organizationId || 'default');

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
  async testConnection(req, res) {
    try {
      console.log('🔍 Probando conectividad con Turso...');

      const testResult = await this.ragService.testConnection();

      if (testResult.success) {
        res.json({
          success: true,
          message: testResult.message,
          data: {
            dataCount: testResult.dataCount,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        res.status(500).json({
          success: false,
          error: testResult.message,
          details: testResult.error
        });
      }

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
  async semanticSearch(req, res) {
    try {
      const { query, filters, limit = 20 } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'La consulta es requerida'
        });
      }

      console.log(`🔍 Búsqueda semántica: "${query}"`);

      // Procesar con filtros adicionales
      const result = await this.ragService.processQuery(query, 'default', {
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
  async getInsights(req, res) {
    try {
      const { organizationId, timeRange = '30d' } = req.query;

      console.log(`📈 Generando insights para organización: ${organizationId || 'default'}`);

      // Obtener estadísticas
      const stats = await this.ragService.getSystemStats(organizationId || 'default');

      // Generar insights básicos
      const insights = this.generateInsights(stats);

      res.json({
        success: true,
        data: {
          stats,
          insights,
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
   * Genera insights básicos basados en estadísticas
   */
  generateInsights(stats) {
    const insights = [];
    
    if (stats.total > 0) {
      insights.push(`El sistema contiene ${stats.total} registros de información sobre gestión de calidad.`);
    }
    
    if (stats.porTipo) {
      const tipos = Object.keys(stats.porTipo);
      if (tipos.length > 0) {
        insights.push(`Se han identificado ${tipos.length} tipos diferentes de información: ${tipos.join(', ')}.`);
      }
    }
    
    if (stats.porEstado && stats.porEstado.activo) {
      insights.push(`${stats.porEstado.activo} registros están activos y disponibles para consulta.`);
    }
    
    if (stats.porTipo && stats.porTipo.proceso) {
      insights.push(`Hay ${stats.porTipo.proceso} procesos documentados en el sistema.`);
    }
    
    if (stats.porTipo && stats.porTipo.indicador) {
      insights.push(`Se han definido ${stats.porTipo.indicador} indicadores de calidad.`);
    }
    
    return insights.join(' ');
  }

  /**
   * Sugerencias de consultas relacionadas
   */
  async getSuggestions(req, res) {
    try {
      const { query, limit = 5 } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'La consulta es requerida'
        });
      }

      console.log(`💡 Generando sugerencias para: "${query}"`);

      // Generar sugerencias basadas en la consulta
      const suggestions = this.generateSuggestions(query, limit);

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

  /**
   * Genera sugerencias basadas en la consulta
   */
  generateSuggestions(query, limit) {
    const queryLower = query.toLowerCase();
    const suggestions = [];
    
    // Sugerencias basadas en palabras clave
    if (queryLower.includes('indicador') || queryLower.includes('kpi')) {
      suggestions.push('¿Cuáles son los indicadores de calidad más importantes?');
      suggestions.push('¿Cómo se miden los indicadores de calidad?');
      suggestions.push('¿Qué indicadores están por debajo del objetivo?');
    }
    
    if (queryLower.includes('proceso') || queryLower.includes('procedimiento')) {
      suggestions.push('¿Cuáles son los procesos principales del SGC?');
      suggestions.push('¿Cómo se documentan los procesos?');
      suggestions.push('¿Qué procesos necesitan mejora?');
    }
    
    if (queryLower.includes('auditoria') || queryLower.includes('auditor')) {
      suggestions.push('¿Cuándo fue la última auditoría interna?');
      suggestions.push('¿Qué hallazgos se encontraron en las auditorías?');
      suggestions.push('¿Cómo se planifican las auditorías?');
    }
    
    if (queryLower.includes('hallazgo') || queryLower.includes('no conformidad')) {
      suggestions.push('¿Cuáles son los hallazgos más frecuentes?');
      suggestions.push('¿Cómo se gestionan las no conformidades?');
      suggestions.push('¿Qué acciones correctivas se han implementado?');
    }
    
    if (queryLower.includes('personal') || queryLower.includes('empleado')) {
      suggestions.push('¿Qué capacitaciones tiene el personal?');
      suggestions.push('¿Cuáles son las competencias requeridas?');
      suggestions.push('¿Cómo se evalúa el desempeño del personal?');
    }
    
    // Sugerencias generales si no hay coincidencias específicas
    if (suggestions.length === 0) {
      suggestions.push('¿Cuáles son los indicadores de calidad más importantes?');
      suggestions.push('¿Qué procesos están documentados en el SGC?');
      suggestions.push('¿Cuándo fue la última auditoría interna?');
      suggestions.push('¿Qué capacitaciones tiene el personal?');
      suggestions.push('¿Cómo se gestionan las no conformidades?');
    }
    
    return suggestions.slice(0, limit);
  }

  /**
   * Verificación de salud del sistema RAG
   */
  async healthCheck(req, res) {
    try {
      const connectionTest = await this.ragService.testConnection();
      
      res.json({
        success: true,
        message: 'Sistema RAG funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: [
          'Consulta RAG con Turso',
          'Búsqueda semántica',
          'Análisis de insights',
          'Sugerencias inteligentes',
          'Estadísticas en tiempo real'
        ],
        connection: connectionTest.success ? 'OK' : 'ERROR',
        dataCount: connectionTest.dataCount || 0
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error en verificación de salud del sistema RAG',
        details: error.message
      });
    }
  }
}

module.exports = RAGController;
