/**
 * Archivo de integración para las nuevas rutas del Editor de Registros
 * Este archivo debe ser importado y usado en index.js
 */

// Importar las rutas TypeScript compiladas
const plantillaRegistroRoutes = require('./plantillaRegistro.routes');
const registroRoutes = require('./registro.routes');

/**
 * Función para registrar las rutas del Editor de Registros
 * @param {Express} app - Instancia de Express
 */
function registrarRutasEditorRegistros(app) {
  // Rutas de plantillas de registro
  app.use('/api/plantillas-registro', plantillaRegistroRoutes.default || plantillaRegistroRoutes);
  
  // Rutas de registros dinámicos
  app.use('/api/registros-dinamicos', registroRoutes.default || registroRoutes);
  
  console.log('✅ Rutas del Editor de Registros registradas correctamente');
}

module.exports = { registrarRutasEditorRegistros };