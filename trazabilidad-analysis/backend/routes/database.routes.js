const express = require('express');
const router = express.Router();
const DatabaseSetupService = require('../services/databaseSetupService');
const authMiddleware = require('../middleware/authMiddleware');

const dbService = new DatabaseSetupService();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route POST /api/database/create-table
 * @desc Crear tabla personalizada
 */
router.post('/create-table', async (req, res) => {
    try {
        const { tableName, columns } = req.body;
        
        if (!tableName || !columns || !Array.isArray(columns)) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere tableName y columns (array)'
            });
        }

        const result = await dbService.createTable(tableName, columns);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error en create-table:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

/**
 * @route POST /api/database/create-index
 * @desc Crear índice
 */
router.post('/create-index', async (req, res) => {
    try {
        const { tableName, indexName, columns } = req.body;
        
        if (!tableName || !indexName || !columns) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere tableName, indexName y columns'
            });
        }

        const result = await dbService.createIndex(tableName, indexName, columns);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error en create-index:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

/**
 * @route POST /api/database/insert-data
 * @desc Insertar datos en tabla
 */
router.post('/insert-data', async (req, res) => {
    try {
        const { tableName, data } = req.body;
        
        if (!tableName || !data) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere tableName y data'
            });
        }

        const result = await dbService.insertData(tableName, data);
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error en insert-data:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

/**
 * @route GET /api/database/table-exists/:tableName
 * @desc Verificar si tabla existe
 */
router.get('/table-exists/:tableName', async (req, res) => {
    try {
        const { tableName } = req.params;
        
        if (!tableName) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere tableName'
            });
        }

        const result = await dbService.tableExists(tableName);
        res.json(result);
    } catch (error) {
        console.error('Error en table-exists:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

/**
 * @route GET /api/database/table-structure/:tableName
 * @desc Obtener estructura de tabla
 */
router.get('/table-structure/:tableName', async (req, res) => {
    try {
        const { tableName } = req.params;
        
        if (!tableName) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere tableName'
            });
        }

        const result = await dbService.getTableStructure(tableName);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error en table-structure:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

/**
 * @route POST /api/database/setup-crm
 * @desc Configurar tablas CRM
 */
router.post('/setup-crm', async (req, res) => {
    try {
        const result = await dbService.setupCRM();
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error en setup-crm:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

/**
 * @route POST /api/database/insert-crm-data
 * @desc Insertar datos de ejemplo CRM
 */
router.post('/insert-crm-data', async (req, res) => {
    try {
        const result = await dbService.insertCRMData();
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error en insert-crm-data:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

/**
 * @route GET /api/database/info
 * @desc Información general de la base de datos
 */
router.get('/info', async (req, res) => {
    try {
        // Obtener lista de tablas
        const tablesQuery = `SELECT name FROM sqlite_master WHERE type='table'`;
        const tables = await dbService.mongoClient.query(tablesQuery);
        
        res.json({
            success: true,
            message: 'Información de base de datos',
            tables: tables.map(t => t.name),
            totalTables: tables.length
        });
    } catch (error) {
        console.error('Error en database-info:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

module.exports = router;
