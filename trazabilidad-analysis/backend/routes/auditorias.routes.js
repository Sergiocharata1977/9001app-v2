const express = require('express');
const { 
  // Funciones principales
  getAllAuditorias,
  getAuditoriaById,
  createAuditoria,
  updateAuditoria,
  deleteAuditoria,
  
  // Funciones SGC
  getParticipantesSGC,
  addParticipanteSGC,
  getDocumentosSGC,
  addDocumentoSGC,
  getNormasSGC,
  addNormaSGC,
  
  // Funciones legacy
  getAspectos,
  addAspecto,
  updateAspecto,
  deleteAspecto,
  addRelacion,
  getRelaciones,
  deleteRelacion,
  getRegistrosRelacionables
 } = require('../controllers/auditoriasController.js');

const router = express.Router();

// ===============================================
// RUTAS DE AUDITORÍAS - SGC PRO
// ===============================================

// Rutas principales de auditorías
router.get('/', getAllAuditorias);
router.get('/:id', getAuditoriaById);
router.post('/', createAuditoria);
router.put('/:id', updateAuditoria);
router.delete('/:id', deleteAuditoria);

// Rutas de aspectos de auditoría
router.get('/:auditoriaId/aspectos', getAspectos);
router.post('/:auditoriaId/aspectos', addAspecto);
router.put('/:auditoriaId/aspectos/:aspectoId', updateAspecto);
router.delete('/:auditoriaId/aspectos/:aspectoId', deleteAspecto);

// Rutas de relaciones de auditoría
router.get('/:auditoriaId/relaciones', getRelaciones);
router.post('/:auditoriaId/relaciones', addRelacion);
router.delete('/relaciones/:relacionId', deleteRelacion);

// Ruta para obtener registros relacionables
router.get('/registros-relacionables/:tipo', getRegistrosRelacionables);

// ===============================================
// RUTAS SGC - PARTICIPANTES, DOCUMENTOS Y NORMAS
// ===============================================

// Rutas de participantes SGC
router.get('/:auditoriaId/sgc/participantes', getParticipantesSGC);
router.post('/:auditoriaId/sgc/participantes', addParticipanteSGC);

// Rutas de documentos SGC
router.get('/:auditoriaId/sgc/documentos', getDocumentosSGC);
router.post('/:auditoriaId/sgc/documentos', addDocumentoSGC);

// Rutas de normas SGC
router.get('/:auditoriaId/sgc/normas', getNormasSGC);
router.post('/:auditoriaId/sgc/normas', addNormaSGC);

module.exports = router; 