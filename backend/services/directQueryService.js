#!/usr/bin/env node

/**
 * 📊 Sistema de Consultas Directas - Alternativa al RAG
 * Sistema para consultas directas a tablas específicas
 */

const mongodbClient = require('../lib/mongodbClient.js');

class DirectQuerySystem {
  static async queryPersonal(organizationId = 1) {
    try {
      const query = `
        SELECT 
          id, nombres, apellidos, email, telefono, 
          estado, fecha_contratacion, created_at
        FROM personal 
        WHERE organization_id = ?
        ORDER BY nombres, apellidos
      `;
      
      const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
      return result.rows;
    } catch (error) {
      console.error('Error consultando personal:', error);
      return [];
    }
  }
  
  static async queryNormas() {
    try {
      const query = `
        SELECT 
          id, codigo, titulo, descripcion, version, 
          tipo, estado, categoria, created_at
        FROM normas 
        WHERE organization_id = 0 OR organization_id = 1
        ORDER BY codigo
      `;
      
      const result = await mongodbClient.execute(query);
      return result.rows;
    } catch (error) {
      console.error('Error consultando normas:', error);
      return [];
    }
  }
  
  static async queryProcesos(organizationId = 1) {
    try {
      const query = `
        SELECT 
          id, nombre, descripcion, responsable, created_at
        FROM procesos 
        WHERE organization_id = ?
        ORDER BY nombre
      `;
      
      const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
      return result.rows;
    } catch (error) {
      console.error('Error consultando procesos:', error);
      return [];
    }
  }
  
  static async queryIndicadores(organizationId = 1) {
    try {
      const query = `
        SELECT 
          id, nombre, descripcion, meta, formula, created_at
        FROM indicadores 
        WHERE organization_id = ?
        ORDER BY nombre
      `;
      
      const result = await mongodbClient.execute({ sql: query, args: [organizationId] });
      return result.rows;
    } catch (error) {
      console.error('Error consultando indicadores:', error);
      return [];
    }
  }
}

module.exports = DirectQuerySystem;
