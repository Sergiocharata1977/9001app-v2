#!/usr/bin/env node

/**
 * 🔍 Sistema de Búsqueda Simple - Alternativa al RAG
 * Sistema básico de búsqueda en base de datos sin IA
 */

const mongodbClient = require('../lib/mongodbClient.js');

class SimpleSearchSystem {
  static async search(query, organizationId = 1) {
    try {
      const searchQuery = `
        SELECT 
          'personal' as tipo,
          id,
          nombres || ' ' || apellidos as titulo,
          email || ' | ' || COALESCE(telefono, 'Sin teléfono') as contenido,
          'Personal' as codigo,
          estado,
          organization_id,
          created_at,
          updated_at
        FROM personal 
        WHERE organization_id = ? 
          AND (nombres LIKE ? OR apellidos LIKE ? OR email LIKE ?)
        
        UNION ALL
        
        SELECT 
          'normas' as tipo,
          id,
          titulo,
          descripcion || ' | ' || codigo as contenido,
          codigo,
          estado,
          organization_id,
          created_at,
          updated_at
        FROM normas 
        WHERE (organization_id = ? OR organization_id = 0)
          AND (titulo LIKE ? OR descripcion LIKE ? OR codigo LIKE ?)
        
        UNION ALL
        
        SELECT 
          'procesos' as tipo,
          id,
          nombre as titulo,
          descripcion as contenido,
          'Proceso' as codigo,
          'activo' as estado,
          organization_id,
          created_at,
          updated_at
        FROM procesos 
        WHERE organization_id = ?
          AND (nombre LIKE ? OR descripcion LIKE ?)
        
        LIMIT 20
      `;
      
      const searchTerm = `%${query}%`;
      const result = await mongodbClient.execute({
        sql: searchQuery,
        args: [organizationId, searchTerm, searchTerm, searchTerm, organizationId, searchTerm, searchTerm, searchTerm, organizationId, searchTerm, searchTerm]
      });
      
      return result.rows;
    } catch (error) {
      console.error('Error en búsqueda simple:', error);
      return [];
    }
  }
  
  static async getStats() {
    try {
      const statsQuery = `
        SELECT 
          'personal' as tabla, COUNT(*) as count FROM personal WHERE organization_id = 1
        UNION ALL
        SELECT 'normas' as tabla, COUNT(*) as count FROM normas WHERE organization_id = 0 OR organization_id = 1
        UNION ALL
        SELECT 'procesos' as tabla, COUNT(*) as count FROM procesos WHERE organization_id = 1
        UNION ALL
        SELECT 'documentos' as tabla, COUNT(*) as count FROM documentos WHERE organization_id = 1
      `;
      
      const result = await mongodbClient.execute(statsQuery);
      return result.rows;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return [];
    }
  }
}

module.exports = SimpleSearchSystem;
