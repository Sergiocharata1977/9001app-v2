const fs = require('fs');
const path = require('path');
const { generateFileStructure } = require('../scripts/permanentes/generate-file-structure');
const mongoClient = require('../lib/mongoClient.js');

/**
 * Controlador para la estructura de archivos del sistema
 * Proporciona endpoints para obtener información sobre la estructura de archivos
 */

// Función para obtener la estructura de archivos desde el archivo JSON
const getFileStructureFromFile = () => {
  try {
    const filePath = path.join(__dirname, '../../../logs/file-structure.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error reading file structure:', error);
    return null;
  }
};

// Función para verificar si el archivo de estructura está actualizado
const isFileStructureUpdated = () => {
  try {
    const filePath = path.join(__dirname, '../../../logs/file-structure.json');
    if (!fs.existsSync(filePath)) {
      return false;
    }
    
    const stats = fs.statSync(filePath);
    const now = new Date();
    const fileAge = now - stats.mtime;
    const maxAge = 48 * 60 * 60 * 1000; // 48 horas en milisegundos
    
    return fileAge < maxAge;
  } catch (error) {
    return false;
  }
};

/**
 * GET /api/file-structure
 * Obtiene la estructura de archivos del sistema
 */
const getFileStructure = async (req, res) => {
  try {
    console.log('📁 Obteniendo estructura de archivos...');
    
    // Verificar si el archivo existe y está actualizado
    if (!isFileStructureUpdated()) {
      console.log('🔄 Generando nueva estructura de archivos...');
      await generateFileStructure();
    }
    
    // Obtener datos del archivo
    const fileStructure = getFileStructureFromFile();
    
    if (!fileStructure) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener la estructura de archivos',
        error: 'No se pudo leer el archivo de estructura'
      });
    }
    
    res.json({
      success: true,
      data: fileStructure,
      message: 'Estructura de archivos obtenida exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en getFileStructure:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

/**
 * POST /api/file-structure/regenerate
 * Regenera la estructura de archivos del sistema
 */
const regenerateFileStructure = async (req, res) => {
  try {
    console.log('🔄 Regenerando estructura de archivos...');
    
    // Generar nueva estructura
    const fileStructure = await generateFileStructure();
    
    res.json({
      success: true,
      data: fileStructure,
      message: 'Estructura de archivos regenerada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error en regenerateFileStructure:', error);
    res.status(500).json({
      success: false,
      message: 'Error al regenerar la estructura de archivos',
      error: error.message
    });
  }
};

/**
 * GET /api/file-structure/stats
 * Obtiene estadísticas básicas de la estructura de archivos
 */
const getFileStructureStats = async (req, res) => {
  try {
    const fileStructure = getFileStructureFromFile();
    
    if (!fileStructure) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la estructura de archivos'
      });
    }
    
    const stats = {
      totalFiles: fileStructure.totalFiles,
      totalLines: fileStructure.totalLines,
      totalSize: fileStructure.totalSize,
      directories: fileStructure.directories,
      lastUpdate: fileStructure.lastUpdate,
      status: fileStructure.status,
      sections: Object.keys(fileStructure.sections).map(key => ({
        name: fileStructure.sections[key].name,
        icon: fileStructure.sections[key].icon,
        files: fileStructure.sections[key].files,
        lines: fileStructure.sections[key].lines,
        status: fileStructure.sections[key].status
      }))
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas de estructura de archivos obtenidas'
    });
    
  } catch (error) {
    console.error('❌ Error en getFileStructureStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * GET /api/file-structure/section/:sectionName
 * Obtiene la estructura de una sección específica
 */
const getFileStructureSection = async (req, res) => {
  try {
    const { sectionName } = req.params;
    const fileStructure = getFileStructureFromFile();
    
    if (!fileStructure) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la estructura de archivos'
      });
    }
    
    const section = fileStructure.sections[sectionName];
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: `Sección '${sectionName}' no encontrada`
      });
    }
    
    res.json({
      success: true,
      data: section,
      message: `Estructura de sección '${sectionName}' obtenida`
    });
    
  } catch (error) {
    console.error('❌ Error en getFileStructureSection:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la sección',
      error: error.message
    });
  }
};

/**
 * GET /api/file-structure/file-types
 * Obtiene estadísticas de tipos de archivo
 */
const getFileTypes = async (req, res) => {
  try {
    const fileStructure = getFileStructureFromFile();
    
    if (!fileStructure) {
      return res.status(404).json({
        success: false,
        message: 'No se encontró la estructura de archivos'
      });
    }
    
    res.json({
      success: true,
      data: fileStructure.fileTypes,
      message: 'Tipos de archivo obtenidos'
    });
    
  } catch (error) {
    console.error('❌ Error en getFileTypes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener tipos de archivo',
      error: error.message
    });
  }
};

/**
 * GET /api/file-structure/status
 * Obtiene el estado de la estructura de archivos
 */
const getFileStructureStatus = async (req, res) => {
  try {
    const isUpdated = isFileStructureUpdated();
    const fileStructure = getFileStructureFromFile();
    
    const status = {
      isUpdated,
      lastUpdate: fileStructure?.lastUpdate || null,
      totalFiles: fileStructure?.totalFiles || 0,
      totalLines: fileStructure?.totalLines || 0,
      status: fileStructure?.status || 'No disponible'
    };
    
    res.json({
      success: true,
      data: status,
      message: 'Estado de estructura de archivos obtenido'
    });
    
  } catch (error) {
    console.error('❌ Error en getFileStructureStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado',
      error: error.message
    });
  }
};

module.exports = {
  getFileStructure,
  regenerateFileStructure,
  getFileStructureStats,
  getFileStructureSection,
  getFileTypes,
  getFileStructureStatus
};
