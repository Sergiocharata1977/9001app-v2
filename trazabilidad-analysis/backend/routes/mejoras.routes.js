const { Router  } = require('express');
const mongoClient = require('../lib/mongoClient.js');
const { randomUUID  } = require('crypto');
const { ensureTenant, secureQuery, requireRole  } = require('../middleware/tenantMiddleware.js');

// Helper function to convert BigInt to string in objects
function convertBigIntToString(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return String(obj);
  if (Array.isArray(obj)) return obj.map(convertBigIntToString);
  if (typeof obj === 'object') {
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntToString(value);
    }
    return converted;
  }
  return obj;
}

const router = Router();

// Aplicar middleware de tenant a todas las rutas
router.use(ensureTenant);

// GET /api/mejoras - Listar todos los hallazgos
router.get('/', async (req, res) => {
  try {
    const result = await secureQuery(
      `SELECT *
       FROM hallazgos
       WHERE organization_id = ?
       ORDER BY orden ASC, fecha_deteccion DESC NULLS LAST`,
      [req.user.organization_id]
    );
    const convertedRows = convertBigIntToString(result.rows);
    res.json(Array.isArray(convertedRows) ? convertedRows : []);
  } catch (error) {
    console.error('Error al obtener hallazgos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/mejoras/:id - Obtener un hallazgo por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await secureQuery(
      `SELECT *
       FROM hallazgos
       WHERE id = ? AND organization_id = ?`,
      [id, req.user.organization_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hallazgo no encontrado.' });        
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error al obtener el hallazgo ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/mejoras - Crear un nuevo hallazgo (Solo managers y admins)
router.post('/', requireRole('manager'), async (req, res) => {
  const { titulo, descripcion, origen, tipo_hallazgo, prioridad, proceso_id, requisito_incumplido } = req.body;

  if (!titulo || !origen || !tipo_hallazgo || !prioridad || !proceso_id) {
    return res.status(400).json({ error: 'Los campos titulo, origen, tipo_hallazgo, prioridad y proceso_id son obligatorios.' });
  }

  try {
    const id = randomUUID();
    const estado = 'deteccion'; // Estado inicial 'Detección' compatible con Kanban
    const fecha_deteccion = new Date().toISOString();

    // Generar nuevo numeroHallazgo de forma robusta para la organización
    const result = await secureQuery(
      "SELECT numeroHallazgo FROM hallazgos WHERE numeroHallazgo LIKE 'H-%' AND organization_id = ? ORDER BY CAST(SUBSTR(numeroHallazgo, 3) AS INTEGER) DESC LIMIT 1",
      [req.user.organization_id]
    );
    let nextId = 1;
    if (result.rows.length > 0) {
        const lastNumero = result.rows[0].numeroHallazgo;
        const lastId = parseInt(lastNumero.split('-')[1], 10);
        if (!isNaN(lastId)) {
            nextId = lastId + 1;
        }
    }
    const nextNumero = `H-${String(nextId).padStart(3, '0')}`;

    const sql = `
      INSERT INTO hallazgos (
        id, numeroHallazgo, titulo, descripcion, estado, origen, tipo_hallazgo, prioridad, 
        fecha_deteccion, proceso_id, requisito_incumplido, organization_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const args = [
      id, nextNumero, titulo, descripcion || null, estado, origen, tipo_hallazgo, prioridad, 
      fecha_deteccion, proceso_id, requisito_incumplido || null, req.user.organization_id
    ];

    await mongoClient.execute({ sql, args });

    const newHallazgoResult = await secureQuery(
      'SELECT * FROM hallazgos WHERE id = ? AND organization_id = ?',
      [id, req.user.organization_id]
    );

    if (newHallazgoResult.rows.length > 0) {
      const hallazgoData = convertBigIntToString(newHallazgoResult.rows[0]);
      res.status(201).json(hallazgoData);
    } else {
      throw new Error('No se pudo recuperar el hallazgo después de la creación.');
    }
  } catch (error) {
    console.error('Error al crear el hallazgo:', error);
    if (error.message.includes('CHECK constraint failed')) {
      return res.status(400).json({ error: 'Valor inválido para tipo, origen o prioridad.' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/mejoras/:id - Actualizar un hallazgo (Solo managers y admins)
router.put('/:id', requireRole('manager'), async (req, res) => {
  const { id } = req.params;
  let { ...fieldsToUpdate } = req.body;

  // Mapear el campo del frontend al de la BBDD
  if (fieldsToUpdate.descripcion_plan_accion) {
    fieldsToUpdate.accion_inmediata = fieldsToUpdate.descripcion_plan_accion;
    // No es necesario eliminarlo, el filtro de allowedFields se encargará
  }

  console.log(`[PUT /hallazgos/${id}] Received body:`, JSON.stringify(fieldsToUpdate, null, 2));

  if (Object.keys(fieldsToUpdate).length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
  }

  // Añadir campos de timestamp al body si hay cambio de estado
  const timestamp = new Date().toISOString();
  if (fieldsToUpdate.estado) {
    switch (fieldsToUpdate.estado) {
      case 'd2_accion_inmediata_programada':
        fieldsToUpdate.fecha_planificacion_finalizada = timestamp;
        break;
      case 'd3_accion_inmediata_finalizada':
        fieldsToUpdate.fecha_ejecucion_finalizada = timestamp;
        break;
      case 't1_pendiente_ac':
      case 't2_cerrado':
        fieldsToUpdate.fecha_analisis_finalizado = timestamp;
        if (fieldsToUpdate.estado === 't2_cerrado') {
            fieldsToUpdate.fecha_cierre = timestamp;
        }
        break;
    }
  }

  const allowedFields = [
    // Campos generales
    'titulo', 'descripcion', 'estado', 'origen', 'tipo_hallazgo', 'prioridad',
    'fecha_deteccion', 'fecha_cierre', 'proceso_id', 'requisito_incumplido',
    'responsable_id',

    // Campos de Flujo de Trabajo
    'descripcion_plan_accion', // Campo del frontend para la acción inmediata
    'accion_inmediata', // Planificación Acción Inmediata
    'fecha_compromiso_plan_accion', // Planificación Acción Inmediata
    'responsable_plan_accion', // Planificación Acción Inmediata
    'analisis_causa_raiz', // Análisis de Causa
    'decision', // Análisis de Causa
    'descripcion_plan_accion_correctiva', // Análisis de Causa
    'responsable_implementacion_ac', // Análisis de Causa
    'fecha_compromiso_ac', // Análisis de Causa
    'fecha_ejecucion', // Ejecución
    'comentarios_ejecucion', // Ejecución
    'responsable_ejecucion', // Ejecución
    'eficacia_verificacion', // Verificación
    'comentarios_verificacion', // Verificación
    'fecha_planificacion_finalizada',
    'fecha_ejecucion_finalizada',
    'fecha_analisis_finalizado'
  ];

  const fields = Object.keys(fieldsToUpdate)
    .filter(key => allowedFields.includes(key));
  
  console.log(`[PUT /hallazgos/${id}] Filtered fields to update:`, fields);

  if (fields.length === 0) {
      return res.status(400).json({ error: 'Ninguno de los campos proporcionados es actualizable.' });
  }

  const sqlSetParts = fields.map(key => `${key} = ?`);
  const sqlArgs = fields.map(key => fieldsToUpdate[key]);
  sqlArgs.push(id);
  sqlArgs.push(req.user.organization_id);

  const sql = `UPDATE hallazgos SET ${sqlSetParts.join(', ')} WHERE id = ? AND organization_id = ?`;
  console.log(`[PUT /hallazgos/${id}] Executing SQL:`, sql);
  console.log(`[PUT /hallazgos/${id}] With arguments:`, sqlArgs);

  try {
    await mongoClient.execute({
      sql,
      args: sqlArgs,
    });

    const updatedHallazgoResult = await secureQuery(
      'SELECT * FROM hallazgos WHERE id = ? AND organization_id = ?',
      [id, req.user.organization_id]
    );

    res.json(updatedHallazgoResult.rows[0]);
  } catch (error) {
    console.error(`[PUT /hallazgos/${id}] DATABASE ERROR:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/mejoras/orden - Actualizar el orden de los hallazgos (Solo managers y admins)
router.put('/orden', requireRole('manager'), async (req, res) => {
  const { orderedIds } = req.body;

  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ error: 'Se esperaba un array de IDs ordenados.' });
  }

  try {
    const statements = orderedIds.map((id, index) => ({
      sql: 'UPDATE hallazgos SET orden = ? WHERE id = ? AND organization_id = ?',
      args: [index, id, req.user.organization_id],
    }));

    await mongoClient.batch(statements, 'write');

    res.status(200).json({ message: 'Orden de hallazgos actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar el orden de los hallazgos:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el orden.' });
  }
});

// PUT /api/mejoras/:id/estado - Actualizar solo el estado de un hallazgo (Solo managers y admins)
router.put('/:id/estado', requireRole('manager'), async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'El campo estado es obligatorio.' });
  }

  try {
    const result = await mongoClient.execute({
      sql: 'UPDATE hallazgos SET estado = ? WHERE id = ? AND organization_id = ?',
      args: [estado, id, req.user.organization_id],
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Hallazgo no encontrado.' });
    }

    const updatedHallazgoResult = await secureQuery(
      'SELECT * FROM hallazgos WHERE id = ? AND organization_id = ?',
      [id, req.user.organization_id]
    );

    res.status(200).json(updatedHallazgoResult.rows[0]);
  } catch (error) {
    console.error(`Error al actualizar el estado del hallazgo con id ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el estado.' });
  }
});

// DELETE /api/mejoras/:id - Eliminar un hallazgo (Solo admins)
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await mongoClient.execute({ 
      sql: 'DELETE FROM hallazgos WHERE id = ? AND organization_id = ?', 
      args: [id, req.user.organization_id] 
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Hallazgo no encontrado.' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error(`Error al eliminar el hallazgo ${id}:`, error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
