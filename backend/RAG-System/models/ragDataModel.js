const mongodbClient = require('../../lib/mongodbClient.js');

/**
 * Modelo RAG para el Sistema SGC ISO 9001
 * Integra todas las tablas del sistema para proporcionar datos unificados
 * para búsquedas semánticas y generación de respuestas contextualizadas
 */
class RAGDataModel {
  
  /**
   * Obtiene información de acciones correctivas/preventivas
   */
  static async getAccionesInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'accion' as tipo,
          a.id,
          a.numeroAccion as titulo,
          COALESCE(a.descripcion_accion, 'Sin descripción') || ' | Responsable: ' || COALESCE(a.responsable_accion, 'No asignado') || ' | Estado: ' || a.estado as contenido,
          a.numeroAccion as codigo,
          a.estado,
          a.organization_id,
          a.created_at,
          a.updated_at
        FROM acciones a
      `;
      
      if (organizationId) {
        query += ` WHERE a.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo acciones:', error);
      return [];
    }
  }

  /**
   * Obtiene información de auditorías
   */
  static async getAuditoriasInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'auditoria' as tipo,
          a.id,
          a.titulo,
          COALESCE(a.objetivos, 'Sin objetivos') || ' | Área: ' || COALESCE(a.area, 'No especificada') || ' | Estado: ' || a.estado as contenido,
          a.codigo,
          a.estado,
          a.organization_id,
          a.created_at,
          a.updated_at
        FROM auditorias a
      `;
      
      if (organizationId) {
        query += ` WHERE a.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo auditorías:', error);
      return [];
    }
  }

  /**
   * Obtiene información de capacitaciones
   */
  static async getCapacitacionesInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'capacitacion' as tipo,
          c.id,
          c.nombre as titulo,
          COALESCE(c.descripcion, 'Sin descripción') || ' | Instructor: ' || COALESCE(c.instructor, 'No asignado') || ' | Duración: ' || COALESCE(c.duracion_horas, 0) || ' horas' as contenido,
          c.id as codigo,
          c.estado,
          c.organization_id,
          c.created_at,
          c.updated_at
        FROM capacitaciones c
      `;
      
      if (organizationId) {
        query += ` WHERE c.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo capacitaciones:', error);
      return [];
    }
  }

  /**
   * Obtiene información de competencias
   */
  static async getCompetenciasInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'competencia' as tipo,
          c.id,
          c.nombre as titulo,
          COALESCE(c.descripcion, 'Sin descripción') as contenido,
          c.id as codigo,
          'activo' as estado,
          c.organization_id,
          c.created_at,
          c.updated_at
        FROM competencias c
      `;
      
      if (organizationId) {
        query += ` WHERE c.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo competencias:', error);
      return [];
    }
  }

  /**
   * Obtiene información de departamentos
   */
  static async getDepartamentosInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'departamento' as tipo,
          d.id,
          d.nombre as titulo,
          COALESCE(d.descripcion, 'Sin descripción') || ' | Responsable ID: ' || COALESCE(d.responsable_id, 'No asignado') as contenido,
          d.id as codigo,
          'activo' as estado,
          d.organization_id,
          d.created_at,
          d.updated_at
        FROM departamentos d
      `;
      
      if (organizationId) {
        query += ` WHERE d.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo departamentos:', error);
      return [];
    }
  }

  /**
   * Obtiene información de documentos
   */
  static async getDocumentosInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'documento' as tipo,
          d.id,
          d.titulo,
          COALESCE(d.descripcion, 'Sin descripción') || ' | Versión: ' || COALESCE(d.version, 'No especificada') || ' | Tipo: ' || COALESCE(d.tipo_archivo, 'No especificado') as contenido,
          d.id as codigo,
          'activo' as estado,
          d.organization_id,
          d.created_at,
          d.updated_at
        FROM documentos d
      `;
      
      if (organizationId) {
        query += ` WHERE d.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo documentos:', error);
      return [];
    }
  }

  /**
   * Obtiene información de encuestas
   */
  static async getEncuestasInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'encuesta' as tipo,
          e.id,
          e.titulo,
          COALESCE(e.descripcion, 'Sin descripción') || ' | Estado: ' || e.estado as contenido,
          e.id as codigo,
          e.estado,
          e.organization_id,
          e.created_at,
          e.updated_at
        FROM encuestas e
      `;
      
      if (organizationId) {
        query += ` WHERE e.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo encuestas:', error);
      return [];
    }
  }

  /**
   * Obtiene información de hallazgos
   */
  static async getHallazgosInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'hallazgo' as tipo,
          h.id,
          h.titulo,
          COALESCE(h.descripcion, 'Sin descripción') || ' | Estado: ' || h.estado as contenido,
          h.id as codigo,
          h.estado,
          h.organization_id,
          h.created_at,
          h.updated_at
        FROM hallazgos h
      `;
      
      if (organizationId) {
        query += ` WHERE h.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo hallazgos:', error);
      return [];
    }
  }

  /**
   * Obtiene información de indicadores
   */
  static async getIndicadoresInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'indicador' as tipo,
          i.id,
          i.nombre as titulo,
          COALESCE(i.descripcion, 'Sin descripción') || ' | Meta: ' || COALESCE(i.meta, 'No especificada') || ' | Fórmula: ' || COALESCE(i.formula, 'No especificada') as contenido,
          i.id as codigo,
          'activo' as estado,
          i.organization_id,
          i.created_at,
          i.updated_at
        FROM indicadores i
      `;
      
      if (organizationId) {
        query += ` WHERE i.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo indicadores:', error);
      return [];
    }
  }

  /**
   * Obtiene información de mediciones
   */
  static async getMedicionesInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'medicion' as tipo,
          m.id,
          'Medición ' || m.indicador_id as titulo,
          'Valor: ' || COALESCE(m.valor, 'No especificado') || ' | Fecha: ' || COALESCE(m.fecha_medicion, 'No especificada') || ' | Observaciones: ' || COALESCE(m.observaciones, 'Sin observaciones') as contenido,
          m.id as codigo,
          'activo' as estado,
          m.organization_id,
          m.fecha_creacion as created_at,
          m.fecha_creacion as updated_at
        FROM mediciones m
      `;
      
      if (organizationId) {
        query += ` WHERE m.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo mediciones:', error);
      return [];
    }
  }

  /**
   * Obtiene información de minutas
   */
  static async getMinutasInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'minuta' as tipo,
          m.id,
          m.titulo,
          COALESCE(m.agenda, 'Sin agenda') || ' | Lugar: ' || COALESCE(m.lugar, 'No especificado') || ' | Estado: ' || COALESCE(m.estado, 'activo') as contenido,
          m.id as codigo,
          m.estado,
          m.organization_id,
          m.created_at,
          m.updated_at
        FROM minutas m
      `;
      
      if (organizationId) {
        query += ` WHERE m.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo minutas:', error);
      return [];
    }
  }

  /**
   * Obtiene información de normas ISO
   */
  static async getNormasInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'norma' as tipo,
          n.id,
          n.titulo,
          COALESCE(n.descripcion, 'Sin descripción') || ' | Versión: ' || COALESCE(n.version, 'No especificada') || ' | Tipo: ' || COALESCE(n.tipo, 'No especificado') as contenido,
          n.codigo,
          n.estado,
          n.organization_id,
          n.created_at,
          n.updated_at
        FROM normas n
      `;
      
      if (organizationId) {
        query += ` WHERE n.organization_id = ? OR n.organization_id = 0`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo normas:', error);
      return [];
    }
  }

  /**
   * Obtiene información de personal
   */
  static async getPersonalInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'personal' as tipo,
          p.id,
          p.nombres || ' ' || COALESCE(p.apellidos, '') as titulo,
          COALESCE(p.email, 'Sin email') || ' | Teléfono: ' || COALESCE(p.telefono, 'No especificado') || ' | Estado: ' || COALESCE(p.estado, 'Activo') as contenido,
          p.id as codigo,
          p.estado,
          p.organization_id,
          p.created_at,
          p.updated_at
        FROM personal p
      `;
      
      if (organizationId) {
        query += ` WHERE p.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo personal:', error);
      return [];
    }
  }

  /**
   * Obtiene información de puestos
   */
  static async getPuestosInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'puesto' as tipo,
          p.id,
          p.nombre as titulo,
          COALESCE(p.descripcion_responsabilidades, 'Sin descripción') || ' | Departamento: ' || COALESCE(p.departamento_id, 'No asignado') as contenido,
          p.id as codigo,
          'activo' as estado,
          p.organization_id,
          p.created_at,
          p.updated_at
        FROM puestos p
      `;
      
      if (organizationId) {
        query += ` WHERE p.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo puestos:', error);
      return [];
    }
  }

  /**
   * Obtiene información de objetivos de calidad
   */
  static async getObjetivosCalidadInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'objetivo_calidad' as tipo,
          oc.id,
          oc.nombre_objetivo as titulo,
          COALESCE(oc.descripcion, 'Sin descripción') || ' | Meta: ' || COALESCE(oc.meta, 'No especificada') || ' | Responsable: ' || COALESCE(oc.responsable, 'No asignado') as contenido,
          oc.id as codigo,
          'activo' as estado,
          oc.organization_id,
          '2025-01-01' as created_at,
          '2025-01-01' as updated_at
        FROM objetivos_calidad oc
      `;
      
      if (organizationId) {
        query += ` WHERE oc.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo objetivos de calidad:', error);
      return [];
    }
  }

  /**
   * Obtiene información de procesos
   */
  static async getProcesosInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'proceso' as tipo,
          p.id,
          p.nombre as titulo,
          COALESCE(p.descripcion, 'Sin descripción') || ' | Responsable: ' || COALESCE(p.responsable, 'No asignado') || ' | Estado: ' || p.estado as contenido,
          p.codigo,
          p.estado,
          p.organization_id,
          p.created_at,
          p.updated_at
        FROM procesos p
      `;
      
      if (organizationId) {
        query += ` WHERE p.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo procesos:', error);
      return [];
    }
  }

  /**
   * Obtiene información de productos
   */
  static async getProductosInfo(organizationId = null) {
    try {
      let query = `
        SELECT 
          'producto' as tipo,
          p.id,
          p.nombre as titulo,
          COALESCE(p.descripcion, 'Sin descripción') || ' | Categoría: ' || COALESCE(p.categoria, 'No especificada') || ' | Estado: ' || p.estado as contenido,
          p.codigo,
          p.estado,
          p.organization_id,
          p.created_at,
          p.updated_at
        FROM productos p
      `;
      
      if (organizationId) {
        query += ` WHERE p.organization_id = ?`;
        const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
        return result.rows;
      } else {
        const result = await mongodbClient.execute(query);
        return result.rows;
      }
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los datos del sistema unificados
   */
  static async getAllSystemData(organizationId = null) {
    try {
      console.log('🔄 Obteniendo datos del sistema para RAG...');
      
      const [
        acciones,
        auditorias,
        capacitaciones,
        competencias,
        departamentos,
        documentos,
        encuestas,
        hallazgos,
        indicadores,
        mediciones,
        minutas,
        normas,
        objetivosCalidad,
        personal,
        procesos,
        productos,
        puestos
      ] = await Promise.all([
        this.getAccionesInfo(organizationId),
        this.getAuditoriasInfo(organizationId),
        this.getCapacitacionesInfo(organizationId),
        this.getCompetenciasInfo(organizationId),
        this.getDepartamentosInfo(organizationId),
        this.getDocumentosInfo(organizationId),
        this.getEncuestasInfo(organizationId),
        this.getHallazgosInfo(organizationId),
        this.getIndicadoresInfo(organizationId),
        this.getMedicionesInfo(organizationId),
        this.getMinutasInfo(organizationId),
        this.getNormasInfo(organizationId),
        this.getObjetivosCalidadInfo(organizationId),
        this.getPersonalInfo(organizationId),
        this.getProcesosInfo(organizationId),
        this.getProductosInfo(organizationId),
        this.getPuestosInfo(organizationId)
      ]);

      const allData = [
        ...acciones,
        ...auditorias,
        ...capacitaciones,
        ...competencias,
        ...departamentos,
        ...documentos,
        ...encuestas,
        ...hallazgos,
        ...indicadores,
        ...mediciones,
        ...minutas,
        ...normas,
        ...objetivosCalidad,
        ...personal,
        ...procesos,
        ...productos,
        ...puestos
      ];

      console.log(`✅ Datos obtenidos: ${allData.length} registros totales`);
      return allData;
    } catch (error) {
      console.error('Error obteniendo todos los datos del sistema:', error);
      return [];
    }
  }

  /**
   * Obtiene datos por tipo específico
   */
  static async getDataByType(type, organizationId = null) {
    try {
      switch (type) {
        case 'acciones':
          return await this.getAccionesInfo(organizationId);
        case 'auditorias':
          return await this.getAuditoriasInfo(organizationId);
        case 'capacitaciones':
          return await this.getCapacitacionesInfo(organizationId);
        case 'competencias':
          return await this.getCompetenciasInfo(organizationId);
        case 'departamentos':
          return await this.getDepartamentosInfo(organizationId);
        case 'documentos':
          return await this.getDocumentosInfo(organizationId);
        case 'encuestas':
          return await this.getEncuestasInfo(organizationId);
        case 'hallazgos':
          return await this.getHallazgosInfo(organizationId);
        case 'indicadores':
          return await this.getIndicadoresInfo(organizationId);
        case 'mediciones':
          return await this.getMedicionesInfo(organizationId);
        case 'minutas':
          return await this.getMinutasInfo(organizationId);
        case 'normas':
          return await this.getNormasInfo(organizationId);
        case 'objetivos_calidad':
          return await this.getObjetivosCalidadInfo(organizationId);
        case 'personal':
          return await this.getPersonalInfo(organizationId);
        case 'procesos':
          return await this.getProcesosInfo(organizationId);
        case 'productos':
          return await this.getProductosInfo(organizationId);
        case 'puestos':
          return await this.getPuestosInfo(organizationId);
        default:
          console.warn(`Tipo de dato no reconocido: ${type}`);
          return [];
      }
    } catch (error) {
      console.error(`Error obteniendo datos de tipo ${type}:`, error);
      return [];
    }
  }

  /**
   * Busca datos por texto en todos los campos
   */
  static async searchData(searchTerm, organizationId = null) {
    try {
      const allData = await this.getAllSystemData(organizationId);
      
      if (!searchTerm || searchTerm.trim() === '') {
        return allData;
      }

      const searchLower = searchTerm.toLowerCase();
      
      return allData.filter(item => {
        return (
          (item.titulo && item.titulo.toLowerCase().includes(searchLower)) ||
          (item.contenido && item.contenido.toLowerCase().includes(searchLower)) ||
          (item.codigo && item.codigo.toLowerCase().includes(searchLower)) ||
          (item.tipo && item.tipo.toLowerCase().includes(searchLower))
        );
      });
    } catch (error) {
      console.error('Error en búsqueda de datos:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas del sistema
   */
  static async getSystemStats(organizationId = null) {
    try {
      const allData = await this.getAllSystemData(organizationId);
      
      const stats = {
        total: allData.length,
        porTipo: {},
        porEstado: {},
        ultimaActualizacion: new Date().toISOString()
      };

      allData.forEach(item => {
        // Contar por tipo
        stats.porTipo[item.tipo] = (stats.porTipo[item.tipo] || 0) + 1;
        
        // Contar por estado
        stats.porEstado[item.estado] = (stats.porEstado[item.estado] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        total: 0,
        porTipo: {},
        porEstado: {},
        ultimaActualizacion: new Date().toISOString()
      };
    }
  }
}

module.exports = RAGDataModel;
