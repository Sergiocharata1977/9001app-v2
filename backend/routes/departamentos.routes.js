const { Router } = require('express');
const mongoClient = require('../lib/mongoClient.js');
const crypto = require('crypto');
const ActivityLogService = require('../services/activityLogService.js');
const authMiddleware = require('../middleware/authMiddleware.js');

const router = Router();

// Aplicar autenticación para tener req.user y organization_id
router.use(authMiddleware);

// GET /api/departamentos - Listar todos los departamentos
router.get('/', async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id;
    console.log('🔓 Obteniendo departamentos para organización:', organizationId);
    
    // TODO: Considerar un JOIN para obtener el nombre del responsable si es necesario en el listado
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM departamentos WHERE organization_id = ? ORDER BY created_at DESC',
      args: [String(organizationId)]
    });
    
    console.log(`✅ Encontrados ${result.rows.length} departamentos en organización ${organizationId}`);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/departamentos/:id - Obtener un departamento por ID
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id;
    console.log(`🔓 Obteniendo departamento ${id} para organización ${organizationId}`);
    
    const result = await mongoClient.execute({
      sql: 'SELECT * FROM departamentos WHERE id = ? AND organization_id = ?',
      args: [id, String(organizationId)],
    });

    if (result.rows.length === 0) {
      const err = new Error('Departamento no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/departamentos - Crear un nuevo departamento
router.post('/', async (req, res, next) => {
  const { nombre, descripcion, objetivos, organization_id } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  if (!nombre || !organization_id) {
    const err = new Error('Los campos "nombre" y "organization_id" son obligatorios.');
    err.statusCode = 400;
    return next(err);
  }

  try {
    // Verificar si ya existe un departamento con el mismo nombre en la misma organización
    const existing = await mongoClient.execute({
      sql: 'SELECT id FROM departamentos WHERE nombre = ? AND organization_id = ?',
      args: [nombre, organization_id],
    });

    if (existing.rows.length > 0) {
      const err = new Error('Ya existe un departamento con ese nombre en la organización.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Primero verificar si las columnas de timestamp existen
    const columnsInfo = await mongoClient.execute({
      sql: 'PRAGMA table_info(departamentos)',
      args: []
    });

    const hasTimestamps = columnsInfo.rows.some(col => col.name === 'created_at');

    let sql, args;
    if (hasTimestamps) {
      sql = `
        INSERT INTO departamentos (id, nombre, descripcion, objetivos, organization_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
      args = [id, nombre, descripcion || null, objetivos || null, organization_id, now, now];
    } else {
      sql = `
        INSERT INTO departamentos (id, nombre, descripcion, objetivos, organization_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      args = [id, nombre, descripcion || null, objetivos || null, organization_id];
    }

    await mongoClient.execute({ sql, args });

    // Registrar en la bitácora
    await ActivityLogService.registrarCreacion(
      'departamento',
      id,
      { nombre, descripcion, objetivos, organization_id },
      usuario,
      organization_id
    );

    // Devolver el objeto recién creado
    const newDept = {
      id,
      nombre,
      descripcion: descripcion || null,
      objetivos: objetivos || null,
      organization_id,
      ...(hasTimestamps && { created_at: now, updated_at: now })
    };

    res.status(201).json(newDept);

  } catch (error) {
    next(error);
  }
});

// PUT /api/departamentos/:id - Actualizar un departamento (dinámico)
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { nombre, descripcion, responsable, objetivos } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    // Si se proporciona un nombre, verificar que no entre en conflicto con otro departamento
    if (nombre) {
      const existing = await mongoClient.execute({
        sql: 'SELECT id FROM departamentos WHERE nombre = ? AND id != ?',
        args: [nombre, id],
      });
      if (existing.rows.length > 0) {
        const err = new Error('Ya existe otro departamento con ese nombre.');
        err.statusCode = 409;
        return next(err);
      }
    }

    // Obtener datos anteriores para la bitácora
    const prevResult = await mongoClient.execute({
      sql: 'SELECT * FROM departamentos WHERE id = ?',
      args: [id],
    });
    const prevData = prevResult.rows[0] || null;

    const fields = [];
    const args = [];

    if (nombre !== undefined) {
      fields.push('nombre = ?');
      args.push(nombre);
    }
    if (descripcion !== undefined) {
      fields.push('descripcion = ?');
      args.push(descripcion === '' ? null : descripcion);
    }
    if (responsable !== undefined) {
      fields.push('responsable = ?');
      args.push(responsable === '' ? null : responsable);
    }
    if (objetivos !== undefined) {
      fields.push('objetivos = ?');
      args.push(objetivos === '' ? null : objetivos);
    }

    if (fields.length === 0) {
      const err = new Error('No se proporcionaron campos para actualizar.');
      err.statusCode = 400;
      return next(err);
    }

    // Verificar si existe la columna updated_at
    const columnsInfo = await mongoClient.execute({
      sql: 'PRAGMA table_info(departamentos)',
      args: []
    });

    const hasUpdatedAt = columnsInfo.rows.some(col => col.name === 'updated_at');

    if (hasUpdatedAt) {
      fields.push('updated_at = ?');
    args.push(new Date().toISOString());
    }

    args.push(id); // Argumento para el WHERE

    const sql = `UPDATE departamentos SET ${fields.join(', ')} WHERE id = ?`;

    const result = await mongoClient.execute({ sql, args });

    if (result.rowsAffected === 0) {
      const err = new Error('Departamento no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    // Devolver el departamento actualizado
    const updatedDeptResult = await mongoClient.execute({
      sql: 'SELECT * FROM departamentos WHERE id = ?',
      args: [id],
    });
    const updatedDept = updatedDeptResult.rows[0];

    // Registrar en la bitácora
    await ActivityLogService.registrarActualizacion(
      'departamento',
      id,
      prevData,
      updatedDept,
      usuario,
      updatedDept.organization_id
    );

    res.json(updatedDept);

  } catch (error) {
    next(error);
  }
});

// DELETE /api/departamentos/:id - Eliminar un departamento
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    // 1. Verificar si hay puestos asociados
    const puestosCheck = await mongoClient.execute({
      sql: 'SELECT 1 FROM puestos WHERE departamento_id = ? LIMIT 1',
      args: [id],
    });

    if (puestosCheck.rows.length > 0) {
      const err = new Error('No se puede eliminar: El departamento tiene puestos asociados.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    // 2. Verificar si hay personal asociado
    const personalCheck = await mongoClient.execute({
      sql: 'SELECT 1 FROM personal WHERE departamento_id = ? LIMIT 1',
      args: [id],
    });

    if (personalCheck.rows.length > 0) {
      const err = new Error('No se puede eliminar: El departamento tiene personal asociado.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    // Obtener datos anteriores para la bitácora
    const prevResult = await mongoClient.execute({
      sql: 'SELECT * FROM departamentos WHERE id = ?',
      args: [id],
    });
    const prevData = prevResult.rows[0] || null;

    // 3. Si no hay dependencias, proceder con la eliminación
    const result = await mongoClient.execute({
      sql: 'DELETE FROM departamentos WHERE id = ?',
      args: [id],
    });

    if (result.rowsAffected === 0) {
      const err = new Error('Departamento no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    // Registrar en la bitácora
    await ActivityLogService.registrarEliminacion(
      'departamento',
      id,
      prevData,
      usuario,
      prevData?.organization_id || null
    );

    res.json({ message: 'Departamento eliminado exitosamente' });

  } catch (error) {
    next(error);
  }
});

module.exports = router;