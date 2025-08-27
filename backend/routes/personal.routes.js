const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const { auditMiddleware, auditActions, resourceTypes  } = require('../middleware/auditMiddleware.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// ===========================================
// RUTAS ULTRA SIMPLES SIN RESTRICCIONES
// ===========================================

// Obtener TODO el personal de TODA la base de datos
router.get('/', async (req, res) => {
  try {
    console.log('🔓 Obteniendo personal para organización:', req.user?.organization_id);
    
    const result = await mongoClient.execute({
      sql: `SELECT p.*, o.name as organization_name 
            FROM personal p 
            LEFT JOIN organizations o ON p.organization_id = o.id 
            WHERE p.organization_id = ?
            ORDER BY p.id DESC`,
      args: [String(req.user?.organization_id)]
    });

    console.log(`✅ Encontradas ${result.rows.length} personas en organización ${req.user?.organization_id}`);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length,
      message: `${result.rows.length} personas encontradas en tu organización`
    });
    
  } catch (error) {
    console.error('Error obteniendo personal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener personal',
      error: error.message
    });
  }
});

// NUEVO: Obtener personal con relaciones usando relaciones_sgc
router.get('/con-relaciones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔄 Obteniendo personal con relaciones:', id);
    
    // Obtener datos del personal
    const personalResult = await mongoClient.execute({
      sql: `SELECT p.*, o.name as organization_name 
            FROM personal p 
            LEFT JOIN organizations o ON p.organization_id = o.id 
            WHERE p.id = ? AND p.organization_id = ?`,
      args: [id, req.user?.organization_id]
    });

    if (personalResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Personal no encontrado'
      });
    }

    const personal = personalResult.rows[0];

    // Obtener relaciones de puestos
    const puestosResult = await mongoClient.execute({
      sql: `SELECT r.*, p.nombre as puesto_nombre, p.descripcion as puesto_descripcion
            FROM relaciones_sgc r
            JOIN puestos p ON r.destino_id = p.id
            WHERE r.organization_id = ? 
            AND r.origen_tipo = 'personal' 
            AND r.origen_id = ? 
            AND r.destino_tipo = 'puesto'`,
      args: [req.user?.organization_id, id]
    });

    // Obtener relaciones de departamentos
    const departamentosResult = await mongoClient.execute({
      sql: `SELECT r.*, d.nombre as departamento_nombre, d.descripcion as departamento_descripcion
            FROM relaciones_sgc r
            JOIN departamentos d ON r.destino_id = d.id
            WHERE r.organization_id = ? 
            AND r.origen_tipo = 'personal' 
            AND r.origen_id = ? 
            AND r.destino_tipo = 'departamento'`,
      args: [req.user?.organization_id, id]
    });

    console.log(`✅ Personal ${id} encontrado con ${puestosResult.rows.length} puestos y ${departamentosResult.rows.length} departamentos`);
    
    res.json({
      success: true,
      data: {
        ...personal,
        puestos_relacionados: puestosResult.rows,
        departamentos_relacionados: departamentosResult.rows,
        puesto_actual: puestosResult.rows[0] || null,
        departamento_actual: departamentosResult.rows[0] || null
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo personal con relaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener personal con relaciones',
      error: error.message
    });
  }
});

// NUEVO: Asignar puesto usando relaciones_sgc
router.post('/:id/asignar-puesto', async (req, res) => {
  try {
    const { id } = req.params;
    const { puesto_id } = req.body;
    
    console.log(`🔄 Asignando puesto ${puesto_id} a personal ${id}`);

    if (!puesto_id) {
      return res.status(400).json({
        success: false,
        message: 'puesto_id es requerido'
      });
    }

    // Verificar que el personal existe
    const personalExists = await mongoClient.execute({
      sql: 'SELECT id FROM personal WHERE id = ? AND organization_id = ?',
      args: [id, req.user?.organization_id]
    });

    if (personalExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Personal no encontrado'
      });
    }

    // Verificar que el puesto existe
    const puestoExists = await mongoClient.execute({
      sql: 'SELECT id FROM puestos WHERE id = ? AND organization_id = ?',
      args: [puesto_id, req.user?.organization_id]
    });

    if (puestoExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Puesto no encontrado'
      });
    }

    // Eliminar relaciones anteriores de puestos para este personal
    await mongoClient.execute({
      sql: `DELETE FROM relaciones_sgc 
            WHERE organization_id = ? 
            AND origen_tipo = 'personal' 
            AND origen_id = ? 
            AND destino_tipo = 'puesto'`,
      args: [req.user?.organization_id, id]
    });

    // Crear nueva relación
    const result = await mongoClient.execute({
      sql: `INSERT INTO relaciones_sgc 
            (organization_id, origen_tipo, origen_id, destino_tipo, destino_id, descripcion, fecha_creacion, usuario_creador)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
      args: [
        req.user?.organization_id,
        'personal',
        id,
        'puesto',
        puesto_id,
        'Asignación de puesto al personal',
        req.user?.nombre || 'Sistema'
      ]
    });

    console.log(`✅ Puesto ${puesto_id} asignado a personal ${id}`);
    
    res.json({
      success: true,
      message: 'Puesto asignado exitosamente usando relaciones_sgc',
      data: {
        personal_id: id,
        puesto_id: puesto_id,
        relacion_id: result.lastInsertRowid
      }
    });
    
  } catch (error) {
    console.error('Error asignando puesto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar puesto',
      error: error.message
    });
  }
});

// NUEVO: Asignar departamento usando relaciones_sgc
router.post('/:id/asignar-departamento', async (req, res) => {
  try {
    const { id } = req.params;
    const { departamento_id } = req.body;
    
    console.log(`🔄 Asignando departamento ${departamento_id} a personal ${id}`);

    if (!departamento_id) {
      return res.status(400).json({
        success: false,
        message: 'departamento_id es requerido'
      });
    }

    // Verificar que el personal existe
    const personalExists = await mongoClient.execute({
      sql: 'SELECT id FROM personal WHERE id = ? AND organization_id = ?',
      args: [id, req.user?.organization_id]
    });

    if (personalExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Personal no encontrado'
      });
    }

    // Verificar que el departamento existe
    const departamentoExists = await mongoClient.execute({
      sql: 'SELECT id FROM departamentos WHERE id = ? AND organization_id = ?',
      args: [departamento_id, req.user?.organization_id]
    });

    if (departamentoExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Departamento no encontrado'
      });
    }

    // Eliminar relaciones anteriores de departamentos para este personal
    await mongoClient.execute({
      sql: `DELETE FROM relaciones_sgc 
            WHERE organization_id = ? 
            AND origen_tipo = 'personal' 
            AND origen_id = ? 
            AND destino_tipo = 'departamento'`,
      args: [req.user?.organization_id, id]
    });

    // Crear nueva relación
    const result = await mongoClient.execute({
      sql: `INSERT INTO relaciones_sgc 
            (organization_id, origen_tipo, origen_id, destino_tipo, destino_id, descripcion, fecha_creacion, usuario_creador)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
      args: [
        req.user?.organization_id,
        'personal',
        id,
        'departamento',
        departamento_id,
        'Asignación de departamento al personal',
        req.user?.nombre || 'Sistema'
      ]
    });

    console.log(`✅ Departamento ${departamento_id} asignado a personal ${id}`);
    
    res.json({
      success: true,
      message: 'Departamento asignado exitosamente usando relaciones_sgc',
      data: {
        personal_id: id,
        departamento_id: departamento_id,
        relacion_id: result.lastInsertRowid
      }
    });
    
  } catch (error) {
    console.error('Error asignando departamento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al asignar departamento',
      error: error.message
    });
  }
});

// Obtener personal por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔓 Obteniendo personal ${id} sin restricciones`);
    
    const result = await mongoClient.execute({
      sql: `SELECT p.*, o.name as organization_name 
            FROM personal p 
            LEFT JOIN organizations o ON p.organization_id = o.id 
            WHERE p.id = ?`,
      args: [id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Personal no encontrado'
      });
    }

    console.log(`✅ Personal ${id} encontrado`);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error obteniendo personal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener personal',
      error: error.message
    });
  }
});

// Crear nuevo personal
router.post('/', async (req, res) => {
  try {
    const { 
      nombre, 
      apellido, 
      dni, 
      email, 
      telefono, 
      puesto, 
      departamento,
      fecha_ingreso,
      estado,
      organization_id
    } = req.body;

    console.log('🔓 Creando persona sin restricciones');
    
    const result = await mongoClient.execute({
      sql: `INSERT INTO personal (
        nombre, apellido, dni, email, telefono, puesto, departamento, 
        fecha_ingreso, estado, organization_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        nombre, apellido, dni, email, telefono, puesto, departamento,
        fecha_ingreso, estado, organization_id || req.user?.organization_id
      ]
    });

    console.log(`✅ Persona creada con ID: ${result.lastInsertRowid}`);
    
    res.status(201).json({
      success: true,
      message: 'Personal creado exitosamente',
      data: {
        id: result.lastInsertRowid,
        nombre,
        apellido,
        dni,
        email,
        telefono,
        puesto,
        departamento,
        fecha_ingreso,
        estado
      }
    });
    
  } catch (error) {
    console.error('Error creando personal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear personal',
      error: error.message
    });
  }
});

// Actualizar persona
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nombre, 
      apellido, 
      dni, 
      email, 
      telefono, 
      puesto, 
      departamento,
      fecha_ingreso,
      estado
    } = req.body;

    console.log(`🔓 Actualizando persona ${id} sin restricciones`);
    
    const result = await mongoClient.execute({
      sql: `UPDATE personal SET 
        nombre = ?, apellido = ?, dni = ?, email = ?, telefono = ?, 
        puesto = ?, departamento = ?, fecha_ingreso = ?, estado = ?, 
        updated_at = datetime('now')
        WHERE id = ?`,
      args: [
        nombre, apellido, dni, email, telefono, puesto, departamento,
        fecha_ingreso, estado, id
      ]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    console.log(`✅ Persona ${id} actualizada`);
    
    res.json({
      success: true,
      message: 'Persona actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error actualizando persona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar persona',
      error: error.message
    });
  }
});

// Eliminar persona
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔓 Eliminando persona ${id} sin restricciones`);
    
    // Primero eliminar todas las relaciones de este personal
    await mongoClient.execute({
      sql: `DELETE FROM relaciones_sgc 
            WHERE organization_id = ? 
            AND (origen_tipo = 'personal' AND origen_id = ?) 
            OR (destino_tipo = 'personal' AND destino_id = ?)`,
      args: [req.user?.organization_id, id, id]
    });

    // Luego eliminar el personal
    const result = await mongoClient.execute({
      sql: 'DELETE FROM personal WHERE id = ?',
      args: [id]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    console.log(`✅ Persona ${id} eliminada junto con sus relaciones`);
    
    res.json({
      success: true,
      message: 'Persona eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('Error eliminando persona:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar persona',
      error: error.message
    });
  }
});

module.exports = router;
