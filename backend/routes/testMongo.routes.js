const express = require('express');
const router = express.Router();
const testMongoController = require('../controllers/testMongoController.js');

// Rutas para probar MongoDB (sin autenticación para diagnóstico)

// GET /api/test-mongo/database - Información de la base de datos
router.get('/database', testMongoController.getDatabaseInfo);

// GET /api/test-mongo/collection/:collectionName - Datos de una colección específica
router.get('/collection/:collectionName', testMongoController.getCollectionData);

// GET /api/test-mongo/planes - Obtener planes desde MongoDB
router.get('/planes', testMongoController.getPlanes);

// GET /api/test-mongo/organizations - Obtener organizaciones desde MongoDB
router.get('/organizations', testMongoController.getOrganizations);

// GET /api/test-mongo/users - Obtener usuarios desde MongoDB
router.get('/users', testMongoController.getUsers);

module.exports = router;