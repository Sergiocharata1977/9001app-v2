import { createClient } from 'mongoose';
import OpenAI from 'openai';

interface RAGQuery {
  question: string;
  organizationId?: string;
  maxResults?: number;
  includeSources?: boolean;
  contextSize?: number;
}

interface RAGResponse {
  question: string;
  answer: string;
  confidence: number;
  sources: RAGSource[];
  totalResults: number;
  processingTime: number;
  timestamp: string;
}

interface RAGSource {
  tipo: string;
  titulo: string;
  codigo: string;
  relevancia: number;
  contenido: string;
}

interface TursoConfig {
  url: string;
  authToken: string;
}

/**
 * Servicio RAG optimizado para Turso
 * Integra OpenAI con base de datos Turso para respuestas inteligentes
 */
export class TursoRAGService {
  private tursoClient: any;
  private openai: OpenAI;
  private config: TursoConfig;

  constructor(config: TursoConfig, openaiApiKey: string) {
    this.config = config;
    this.tursoClient = createClient({
      url: config.url,
      authToken: config.authToken
    });
    
    this.openai = new OpenAI({
      apiKey: openaiApiKey
    });
  }

  /**
   * Procesa una consulta completa con IA
   */
  async processQuery(query: RAGQuery): Promise<RAGResponse> {
    try {
      console.log(`🔄 Procesando consulta RAG con Turso: "${query.question}"`);
      
      const startTime = Date.now();
      
      // MongoDB
      const relevantData = await this.searchTursoData(query.question, query.organizationId);
      
      // Paso 2: Calcular relevancia
      const scoredData = relevantData.map(item => ({
        ...item,
        relevance: this.calculateRelevanceScore(query.question, item)
      })).sort((a, b) => b.relevance - a.relevance);

      // Paso 3: Seleccionar mejores resultados
      const maxResults = query.maxResults || 10;
      const topResults = scoredData.slice(0, maxResults);
      
      // Paso 4: Generar respuesta con OpenAI
      const aiResponse = await this.generateAIResponse(query.question, topResults);
      
      const processingTime = Date.now() - startTime;

      const result: RAGResponse = {
        question: query.question,
        answer: aiResponse.answer,
        confidence: aiResponse.confidence,
        sources: query.includeSources !== false ? aiResponse.sources : [],
        totalResults: scoredData.length,
        processingTime: processingTime,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Consulta procesada en ${processingTime}ms con confianza ${aiResponse.confidence}%`);
      return result;
    } catch (error) {
      console.error('❌ Error procesando consulta RAG con Turso:', error);
      throw error;
    }
  }

  /**
   * Busca datos relevantes en Turso
   */
  private async searchTursoData(question: string, organizationId?: string): Promise<any[]> {
    const questionLower = question.toLowerCase();
    const keywords = this.extractKeywords(questionLower);
    
    // Construir consulta SQL dinámica
    let sql = `
      SELECT 
        tipo, titulo, codigo, contenido, estado, 
        fecha_creacion, fecha_actualizacion
      FROM rag_data 
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Filtrar por organización si se especifica
    if (organizationId) {
      sql += ` AND organizacion_id = ?`;
      params.push(organizationId);
    }
    
    // Filtrar por palabras clave
    if (keywords.length > 0) {
      const keywordConditions = keywords.map(() => 
        `(titulo LIKE ? OR contenido LIKE ? OR codigo LIKE ?)`
      ).join(' OR ');
      sql += ` AND (${keywordConditions})`;
      
      keywords.forEach(keyword => {
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
      });
    }
    
    sql += ` ORDER BY fecha_actualizacion DESC LIMIT 50`;
    
    try {
      const result = await this.tursoClient.execute(sql, params);
      return result.rows || [];
    } catch (error) {
      console.error('Error buscando en Turso:', error);
      return [];
    }
  }

  /**
   * Extrae palabras clave de la pregunta
   */
  private extractKeywords(question: string): string[] {
    const stopWords = ['el', 'la', 'los', 'las', 'de', 'del', 'a', 'al', 'con', 'por', 'para', 'en', 'es', 'son', 'está', 'están', 'como', 'qué', 'cuál', 'dónde', 'cuándo', 'por qué'];
    
    return question
      .split(' ')
      .filter(word => 
        word.length > 2 && 
        !stopWords.includes(word) &&
        !word.match(/^[0-9]+$/)
      )
      .slice(0, 5); // Máximo 5 palabras clave
  }

  /**
   * Calcula score de relevancia
   */
  private calculateRelevanceScore(question: string, item: any): number {
    const questionLower = question.toLowerCase();
    const titleLower = (item.titulo || '').toLowerCase();
    const contentLower = (item.contenido || '').toLowerCase();
    const codeLower = (item.codigo || '').toLowerCase();
    
    let score = 0;
    
    // Coincidencia exacta en título
    if (titleLower.includes(questionLower)) {
      score += 20;
    }
    
    // Coincidencia exacta en código
    if (codeLower.includes(questionLower)) {
      score += 15;
    }
    
    // Coincidencia exacta en contenido
    if (contentLower.includes(questionLower)) {
      score += 10;
    }
    
    // Coincidencia de palabras clave
    const keywords = this.extractKeywords(questionLower);
    keywords.forEach(keyword => {
      if (titleLower.includes(keyword)) {
        score += 5;
      }
      if (codeLower.includes(keyword)) {
        score += 3;
      }
      if (contentLower.includes(keyword)) {
        score += 2;
      }
    });
    
    // Bonus por tipo de contenido
    score += this.getTypeBonus(item.tipo, questionLower);
    
    return Math.min(score, 100);
  }

  /**
   * Obtiene bonus por tipo de contenido
   */
  private getTypeBonus(type: string, question: string): number {
    const typeKeywords: { [key: string]: string[] } = {
      'norma': ['norma', 'iso', 'estándar', 'requisito'],
      'proceso': ['proceso', 'procedimiento', 'flujo'],
      'indicador': ['indicador', 'kpi', 'métrica', 'medición'],
      'auditoria': ['auditoría', 'auditoria', 'auditor'],
      'hallazgo': ['hallazgo', 'no conformidad', 'problema'],
      'accion': ['acción', 'accion', 'correctiva', 'preventiva'],
      'documento': ['documento', 'archivo', 'manual'],
      'personal': ['personal', 'empleado', 'responsable'],
      'capacitacion': ['capacitación', 'capacitacion', 'entrenamiento'],
      'minuta': ['minuta', 'reunión', 'reunion', 'acta']
    };

    const keywords = typeKeywords[type] || [];
    let bonus = 0;
    
    keywords.forEach(keyword => {
      if (question.includes(keyword)) {
        bonus += 3;
      }
    });
    
    return bonus;
  }

  /**
   * Genera respuesta con OpenAI
   */
  private async generateAIResponse(question: string, topResults: any[]): Promise<{ answer: string; confidence: number; sources: RAGSource[] }> {
    if (!topResults || topResults.length === 0) {
      return {
        answer: this.generateNoResultsResponse(question),
        confidence: 0,
        sources: []
      };
    }

    // Preparar contexto para OpenAI
    const context = topResults.map(item => 
      `Tipo: ${item.tipo}\nTítulo: ${item.titulo}\nCódigo: ${item.codigo}\nContenido: ${item.contenido}`
    ).join('\n\n');

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en Sistemas de Gestión de Calidad ISO 9001. 
            Responde basándote únicamente en la información proporcionada. 
            Si no hay información suficiente, indícalo claramente.
            Usa un tono profesional pero accesible.`
          },
          {
            role: 'user',
            content: `Pregunta: ${question}\n\nInformación disponible:\n${context}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const answer = response.choices[0].message.content || 'No se pudo generar una respuesta.';
      const confidence = Math.round(
        topResults.reduce((sum, item) => sum + item.relevance, 0) / topResults.length
      );

      const sources: RAGSource[] = topResults.map(item => ({
        tipo: item.tipo,
        titulo: item.titulo,
        codigo: item.codigo,
        relevancia: item.relevance,
        contenido: item.contenido.substring(0, 200) + '...'
      }));

      return { answer, confidence, sources };
    } catch (error) {
      console.error('Error generando respuesta con OpenAI:', error);
      return {
        answer: this.generateFallbackResponse(question, topResults),
        confidence: 50,
        sources: topResults.map(item => ({
          tipo: item.tipo,
          titulo: item.titulo,
          codigo: item.codigo,
          relevancia: item.relevance,
          contenido: item.contenido.substring(0, 200) + '...'
        }))
      };
    }
  }

  /**
   * Genera respuesta cuando no hay resultados
   */
  private generateNoResultsResponse(question: string): string {
    return `No encontré información específica sobre "${question}" en el Sistema de Gestión de Calidad.\n\n` +
           `**Sugerencias:**\n` +
           `• Reformula tu pregunta usando términos más generales\n` +
           `• Consulta directamente los módulos específicos del sistema\n` +
           `• Verifica que la información que buscas esté registrada en el sistema`;
  }

  /**
   * Genera respuesta de respaldo sin IA
   */
  private generateFallbackResponse(question: string, topResults: any[]): string {
    let answer = `Basándome en la información del Sistema de Gestión de Calidad, aquí tienes lo que encontré:\n\n`;
    
    topResults.forEach((item, index) => {
      answer += `${index + 1}. **${item.titulo}** (${item.tipo})\n`;
      answer += `   ${item.contenido}\n`;
      if (item.codigo && item.codigo !== item.titulo) {
        answer += `   Código: ${item.codigo}\n`;
      }
      answer += `   Relevancia: ${item.relevance}%\n\n`;
    });

    return answer;
  }

  /**
   * Obtiene estadísticas del sistema
   */
  async getSystemStats(organizationId?: string): Promise<any> {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total,
          tipo,
          estado
        FROM rag_data
      `;
      
      const params: any[] = [];
      
      if (organizationId) {
        sql += ` WHERE organizacion_id = ?`;
        params.push(organizationId);
      }
      
      sql += ` GROUP BY tipo, estado`;
      
      const result = await this.tursoClient.execute(sql, params);
      
      // Procesar estadísticas
      const stats = {
        total: 0,
        porTipo: {} as { [key: string]: number },
        porEstado: {} as { [key: string]: number }
      };
      
      result.rows?.forEach((row: any) => {
        stats.total += row.total;
        stats.porTipo[row.tipo] = (stats.porTipo[row.tipo] || 0) + row.total;
        stats.porEstado[row.estado] = (stats.porEstado[row.estado] || 0) + row.total;
      });
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}
