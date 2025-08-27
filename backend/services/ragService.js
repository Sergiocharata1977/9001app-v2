const { createClient } = require('@libsql/client');

/**
 * Servicio RAG simplificado para el Sistema SGC ISO 9001
 * Integra con Turso y proporciona respuestas inteligentes
 */
class RAGService {
  constructor() {
    // Configuración de Turso
    this.mongodbClient = createClient({
      url: process.env.TURSO_DATABASE_URL || 'libsql://isoflow4-sergiocharata1977.turso.io',
      authToken: process.env.TURSO_AUTH_TOKEN || ''
    });
  }

  /**
   * Procesa una consulta RAG
   */
  async processQuery(question, organizationId = 'default', options = {}) {
    try {
      console.log(`🔄 Procesando consulta RAG: "${question}"`);
      
      const startTime = Date.now();
      
      // Configuración por defecto
      const config = {
        maxResults: options.maxResults || 10,
        includeSources: options.includeSources !== false,
        contextSize: options.contextSize || 5,
        ...options
      };

      // Paso 1: Buscar datos relevantes en Turso
      const relevantData = await this.searchData(question, organizationId);
      
      // Paso 2: Calcular relevancia y ordenar
      const scoredData = relevantData.map(item => ({
        ...item,
        relevance: this.calculateRelevanceScore(question, item)
      })).sort((a, b) => b.relevance - a.relevance);

      // Paso 3: Seleccionar mejores resultados
      const topResults = scoredData.slice(0, config.maxResults);
      
      // Paso 4: Generar respuesta
      const response = this.generateResponse(question, topResults, scoredData.length);
      
      const processingTime = Date.now() - startTime;

      const result = {
        question: question,
        answer: response.answer,
        confidence: response.confidence,
        sources: config.includeSources ? response.sources : [],
        totalResults: scoredData.length,
        processingTime: processingTime,
        timestamp: new Date().toISOString()
      };

      console.log(`✅ Consulta procesada en ${processingTime}ms con confianza ${response.confidence}%`);
      return result;
    } catch (error) {
      console.error('❌ Error procesando consulta RAG:', error);
      throw error;
    }
  }

  /**
   * Busca datos relevantes en Turso
   */
  async searchData(question, organizationId = 'default') {
    const questionLower = question.toLowerCase();
    const keywords = this.extractKeywords(questionLower);
    
    // Construir consulta SQL dinámica
    let sql = `
      SELECT 
        tipo, titulo, codigo, contenido, estado, 
        fecha_creacion, fecha_actualizacion
      FROM rag_data 
      WHERE estado = 'activo'
    `;
    
    const params = [];
    
    // Filtrar por organización
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
      const result = await this.mongodbClient.execute(sql, params);
      return result.rows || [];
    } catch (error) {
      console.error('Error buscando en Turso:', error);
      return [];
    }
  }

  /**
   * Extrae palabras clave de la pregunta
   */
  extractKeywords(question) {
    const stopWords = ['el', 'la', 'los', 'las', 'de', 'del', 'a', 'al', 'con', 'por', 'para', 'en', 'es', 'son', 'está', 'están', 'como', 'qué', 'cuál', 'dónde', 'cuándo', 'por qué', 'que', 'cual', 'donde', 'cuando'];
    
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
   * Calcula el score de relevancia para un item
   */
  calculateRelevanceScore(question, item) {
    const questionLower = question.toLowerCase();
    const titleLower = (item.titulo || '').toLowerCase();
    const contentLower = (item.contenido || '').toLowerCase();
    const codeLower = (item.codigo || '').toLowerCase();
    
    let score = 0;
    
    // Coincidencia exacta en título (máxima prioridad)
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
  getTypeBonus(type, question) {
    const typeKeywords = {
      'norma': ['norma', 'iso', 'estándar', 'requisito', 'estandar'],
      'proceso': ['proceso', 'procedimiento', 'flujo', 'procedimientos'],
      'indicador': ['indicador', 'kpi', 'métrica', 'medición', 'indicadores'],
      'auditoria': ['auditoría', 'auditoria', 'auditor', 'auditorias'],
      'hallazgo': ['hallazgo', 'no conformidad', 'problema', 'hallazgos'],
      'accion': ['acción', 'accion', 'correctiva', 'preventiva', 'acciones'],
      'documento': ['documento', 'archivo', 'manual', 'documentos'],
      'personal': ['personal', 'empleado', 'responsable', 'empleados'],
      'capacitacion': ['capacitación', 'capacitacion', 'entrenamiento', 'formacion'],
      'minuta': ['minuta', 'reunión', 'reunion', 'acta', 'minutas']
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
   * Genera respuesta basada en los datos encontrados
   */
  generateResponse(question, topResults, totalResults) {
    if (!topResults || topResults.length === 0) {
      return {
        answer: this.generateNoResultsResponse(question),
        confidence: 0,
        sources: []
      };
    }

    // Calcular confianza promedio
    const avgConfidence = Math.round(
      topResults.reduce((sum, item) => sum + item.relevance, 0) / topResults.length
    );

    // Generar respuesta estructurada
    const answer = this.buildStructuredAnswer(question, topResults, totalResults);

    return {
      answer: answer,
      confidence: avgConfidence,
      sources: topResults.map(item => ({
        tipo: item.tipo,
        titulo: item.titulo,
        codigo: item.codigo,
        relevancia: item.relevance,
        contenido: item.contenido.substring(0, 200) + '...'
      }))
    };
  }

  /**
   * Construye respuesta estructurada
   */
  buildStructuredAnswer(question, topResults, totalResults) {
    let answer = "Basándome en la información del Sistema de Gestión de Calidad, aquí tienes lo que encontré:\n\n";
    
    // Agrupar por tipo
    const groupedResults = this.groupByType(topResults);
    
    Object.entries(groupedResults).forEach(([type, items]) => {
      const typeLabel = this.getTypeLabel(type);
      answer += `**${typeLabel}:**\n`;
      
      items.forEach((item, index) => {
        answer += `${index + 1}. **${item.titulo}**\n`;
        answer += `   ${item.contenido}\n`;
        if (item.codigo && item.codigo !== item.titulo) {
          answer += `   Código: ${item.codigo}\n`;
        }
        answer += `   Relevancia: ${item.relevance}%\n\n`;
      });
    });

    // Agregar contexto adicional
    if (totalResults > topResults.length) {
      answer += `\n*Nota: Se encontraron ${totalResults} resultados relacionados. `;
      answer += `Para información más específica, puedes reformular tu pregunta o consultar directamente los módulos correspondientes.*\n\n`;
    }

    // Agregar sugerencias de seguimiento
    answer += this.generateFollowUpSuggestions(question, topResults);

    return answer;
  }

  /**
   * Agrupa resultados por tipo
   */
  groupByType(results) {
    return results.reduce((groups, item) => {
      const type = item.tipo;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(item);
      return groups;
    }, {});
  }

  /**
   * Obtiene etiqueta legible para tipo
   */
  getTypeLabel(type) {
    const labels = {
      'accion': 'Acciones Correctivas/Preventivas',
      'auditoria': 'Auditorías',
      'capacitacion': 'Capacitaciones',
      'competencia': 'Competencias',
      'departamento': 'Departamentos',
      'documento': 'Documentos',
      'encuesta': 'Encuestas',
      'hallazgo': 'Hallazgos',
      'indicador': 'Indicadores de Calidad',
      'medicion': 'Mediciones',
      'minuta': 'Minutas',
      'norma': 'Normas ISO',
      'objetivo_calidad': 'Objetivos de Calidad',
      'personal': 'Personal',
      'proceso': 'Procesos',
      'producto': 'Productos',
      'puesto': 'Puestos'
    };
    
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  }

  /**
   * Genera respuesta cuando no hay resultados
   */
  generateNoResultsResponse(question) {
    return `Lo siento, no encontré información específica sobre "${question}" en el Sistema de Gestión de Calidad.\n\n` +
           `**Sugerencias:**\n` +
           `• Reformula tu pregunta usando términos más generales\n` +
           `• Consulta directamente los módulos específicos del sistema\n` +
           `• Verifica que la información que buscas esté registrada en el sistema\n\n` +
           `**Módulos disponibles:**\n` +
           `• Auditorías y Hallazgos\n` +
           `• Indicadores y Mediciones\n` +
           `• Procesos y Documentos\n` +
           `• Personal y Capacitaciones\n` +
           `• Normas ISO 9001\n\n` +
           `Si necesitas ayuda específica, contacta al administrador del sistema.`;
  }

  /**
   * Genera sugerencias de seguimiento
   */
  generateFollowUpSuggestions(question, results) {
    const suggestions = [];
    
    // Sugerencias basadas en tipos encontrados
    const types = [...new Set(results.map(r => r.tipo))];
    
    if (types.includes('indicador')) {
      suggestions.push('• Consultar mediciones recientes de indicadores');
    }
    
    if (types.includes('auditoria')) {
      suggestions.push('• Revisar hallazgos relacionados');
    }
    
    if (types.includes('proceso')) {
      suggestions.push('• Verificar documentación del proceso');
    }
    
    if (types.includes('personal')) {
      suggestions.push('• Consultar capacitaciones del personal');
    }
    
    if (suggestions.length > 0) {
      return `**Sugerencias de seguimiento:**\n${suggestions.join('\n')}\n\n`;
    }
    
    return '';
  }

  /**
   * Obtiene estadísticas del sistema
   */
  async getSystemStats(organizationId = 'default') {
    try {
      let sql = `
        SELECT 
          COUNT(*) as total,
          tipo,
          estado
        FROM rag_data
        WHERE organizacion_id = ?
        GROUP BY tipo, estado
      `;
      
      const result = await this.mongodbClient.execute(sql, [organizationId]);
      
      // Procesar estadísticas
      const stats = {
        total: 0,
        porTipo: {},
        porEstado: {}
      };
      
      result.rows?.forEach((row) => {
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

  /**
   * Crea la tabla RAG en Turso
   */
  async createRAGTable() {
    try {
      console.log('🔧 Creando tabla RAG en Turso...');

      // SQL para crear la tabla RAG
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS rag_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          tipo TEXT NOT NULL,
          titulo TEXT NOT NULL,
          codigo TEXT,
          contenido TEXT NOT NULL,
          estado TEXT DEFAULT 'activo',
          organizacion_id TEXT DEFAULT 'default',
          fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT,
          relevancia_score REAL DEFAULT 0
        );
      `;

      // Crear índices
      const createIndexesSQL = `
        CREATE INDEX IF NOT EXISTS idx_rag_tipo ON rag_data(tipo);
        CREATE INDEX IF NOT EXISTS idx_rag_titulo ON rag_data(titulo);
        CREATE INDEX IF NOT EXISTS idx_rag_estado ON rag_data(estado);
        CREATE INDEX IF NOT EXISTS idx_rag_organizacion ON rag_data(organizacion_id);
        CREATE INDEX IF NOT EXISTS idx_rag_fecha ON rag_data(fecha_actualizacion);
      `;

      // Crear trigger
      const createTriggerSQL = `
        CREATE TRIGGER IF NOT EXISTS update_rag_timestamp 
          AFTER UPDATE ON rag_data
          FOR EACH ROW
        BEGIN
          UPDATE rag_data SET fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = NEW.id;
        END;
      `;

      // Datos de ejemplo
      const insertDataSQL = `
        INSERT OR IGNORE INTO rag_data (tipo, titulo, codigo, contenido, organizacion_id) VALUES
        ('norma', 'ISO 9001:2015 - Requisitos generales', 'ISO-9001-2015', 'La norma ISO 9001:2015 establece los requisitos para un sistema de gestión de calidad que puede ser utilizado para aplicación interna por las organizaciones, para certificación o con fines contractuales. Esta norma se basa en el ciclo PDCA (Planificar-Hacer-Verificar-Actuar) y el enfoque basado en procesos.', 'default'),
        ('proceso', 'Proceso de Gestión de Calidad', 'PROC-001', 'Proceso principal que define cómo la organización gestiona la calidad de sus productos y servicios, incluyendo la planificación, implementación, control y mejora continua. Este proceso abarca desde la identificación de requisitos del cliente hasta la entrega del producto o servicio.', 'default'),
        ('indicador', 'Indicador de Satisfacción del Cliente', 'IND-001', 'Medición de la satisfacción del cliente basada en encuestas y feedback recibido, con objetivo de mantener un nivel superior al 85%. Se calcula mediante encuestas semestrales y feedback continuo de los clientes.', 'default'),
        ('auditoria', 'Auditoría Interna de Calidad', 'AUD-001', 'Proceso de auditoría interna que verifica el cumplimiento del sistema de gestión de calidad y la efectividad de los procesos implementados. Se realiza trimestralmente y cubre todos los procesos del SGC.', 'default'),
        ('hallazgo', 'No Conformidad en Documentación', 'HAL-001', 'Hallazgo identificado durante auditoría interna relacionado con documentación desactualizada en el proceso de control de calidad. Se requiere actualización inmediata de procedimientos.', 'default'),
        ('accion', 'Acción Correctiva - Actualización de Documentos', 'ACC-001', 'Acción correctiva implementada para actualizar toda la documentación del sistema de gestión de calidad y establecer proceso de revisión periódica. Incluye capacitación al personal en nuevos procedimientos.', 'default'),
        ('documento', 'Manual de Calidad', 'DOC-001', 'Documento principal que describe el sistema de gestión de calidad de la organización, incluyendo políticas, objetivos, estructura organizacional y compromiso de la dirección con la mejora continua.', 'default'),
        ('personal', 'Responsable de Calidad', 'PER-001', 'Descripción del puesto y responsabilidades del responsable del sistema de gestión de calidad, incluyendo competencias requeridas, formación necesaria y autoridad para tomar decisiones en materia de calidad.', 'default'),
        ('capacitacion', 'Capacitación en ISO 9001', 'CAP-001', 'Programa de capacitación para todo el personal sobre los requisitos de la norma ISO 9001:2015 y su aplicación en la organización. Incluye formación inicial y actualizaciones periódicas.', 'default'),
        ('minuta', 'Reunión de Revisión por la Dirección', 'MIN-001', 'Minuta de la reunión mensual de revisión por la dirección donde se analizan los indicadores de calidad, se revisan las acciones correctivas y se toman decisiones de mejora del sistema.', 'default');
      `;

      // Ejecutar las consultas
      await this.mongodbClient.execute(createTableSQL);
      await this.mongodbClient.execute(createIndexesSQL);
      await this.mongodbClient.execute(createTriggerSQL);
      await this.mongodbClient.execute(insertDataSQL);

      // Verificar que se creó correctamente
      const result = await this.mongodbClient.execute('SELECT COUNT(*) as count FROM rag_data');
      const count = result.rows?.[0]?.count || 0;

      console.log(`✅ Tabla RAG creada exitosamente con ${count} registros`);

      return {
        success: true,
        message: 'Tabla RAG creada exitosamente',
        recordsCount: count,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error creando tabla RAG:', error);
      throw error;
    }
  }

  /**
   * Prueba la conectividad con Turso
   */
  async testConnection() {
    try {
      const result = await this.mongodbClient.execute('SELECT COUNT(*) as count FROM rag_data');
      return {
        success: true,
        message: 'Conexión exitosa con Turso',
        dataCount: result.rows?.[0]?.count || 0
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error de conectividad con Turso',
        error: error.message
      };
    }
  }
}

module.exports = RAGService;
