const { Router  } = require('express');
const { randomUUID  } = require('crypto');
const mongoClient = require('../lib/mongoClient.js');

// Helper function to convert BigInt to string in objects
function convertBigIntToString(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return String(obj);
  if (Array.isArray(obj)) return obj.map(convertBigIntToString);
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        obj[key] = convertBigIntToString(obj[key]);
      }
    }
  }
  return obj;
}

const router = Router();

// POST /api/acciones - Crear una nueva acción de mejora
router.post('/', async (req, res) => {
  const { 
    hallazgo_id, 
    descripcion_accion, 
    responsable_accion, 
    fecha_plan_accion,
    titulo,
    prioridad = 'media'
  } = req.body;

  if (!hallazgo_id || !descripcion_accion) {
    return res.status(400).json({ error: 'hallazgo_id y descripcion_accion son campos requeridos.' });
  }

  try {
    // Generar numeroAccion secuencial (AM-001, AM-002, etc.)
    const lastAccionResult = await mongoClient.execute("SELECT numeroAccion FROM acciones ORDER BY numeroAccion DESC LIMIT 1");
    let nextNumeroAccion = 'AM-001';
    if (lastAccionResult.rows.length > 0) {
      const lastNumero = lastAccionResult.rows[0].numeroAccion;
      const lastId = parseInt(lastNumero.split('-')[1]);
      nextNumeroAccion = `AM-${String(lastId + 1).padStart(3, '0')}`;
    }

    const id = randomUUID();
    const estadoInicial = 'p1_planificacion_accion'; // Estado inicial por defecto

    const result = await mongoClient.execute({
      sql: `INSERT INTO acciones (id, hallazgo_id, numeroAccion, estado, descripcion_accion, responsable_accion, fecha_plan_accion, eficacia, titulo, prioridad)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, hallazgo_id, nextNumeroAccion, estadoInicial, descripcion_accion, responsable_accion, fecha_plan_accion, 'Pendiente', titulo, prioridad],
    });

    // Devolver la acción recién creada
    const newAccionResult = await mongoClient.execute({
        sql: 'SELECT * FROM acciones WHERE id = ?',
        args: [id],
    });

    if (newAccionResult.rows.length === 0) {
        return res.status(404).json({ error: 'No se pudo encontrar la acción recién creada.' });
    }

    const accionData = convertBigIntToString(newAccionResult.rows[0]);
    res.status(201).json(accionData);

  } catch (error) {
    console.error('Error al crear la acción de mejora:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear la acción de mejora.' });
  }
});

// GET /api/acciones - Obtener todas las acciones (o filtradas por hallazgo_id)
router.get('/', async (req, res) => {
    const { hallazgo_id } = req.query;
    let query;
    let args = [];

    if (hallazgo_id) {
        query = "SELECT * FROM acciones WHERE hallazgo_id = ? ORDER BY numeroAccion";
        args = [hallazgo_id];
    } else {
        query = "SELECT * FROM acciones ORDER BY numeroAccion";
    }

    try {
        const result = await mongoClient.execute({ sql: query, args });
        const data = result.rows.map(row => convertBigIntToString(row));
        res.json(data);
    } catch (error) {
        console.error('Error al obtener las acciones de mejora:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// PUT /api/acciones/:id - Actualizar una acción de mejora
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        // Construir la consulta SQL dinámicamente basada en los campos enviados
        const fields = [];
        const args = [];
        
        // Campos permitidos para actualización
        const allowedFields = [
            'estado', 'descripcion_accion', 'responsable_accion', 'fecha_plan_accion',
            'fecha_ejecucion', 'evidencia_accion', 'fecha_verificacion_finalizada',
            'resultado_verificacion', 'eficacia', 'observaciones', 'titulo', 'prioridad',
            'comentarios_ejecucion', 'descripcion_verificacion', 'responsable_verificacion',
            'fecha_plan_verificacion', 'comentarios_verificacion'
        ];
        
        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                fields.push(`${key} = ?`);
                args.push(value);
            }
        }
        
        if (fields.length === 0) {
            return res.status(400).json({ error: 'No hay campos válidos para actualizar.' });
        }
        
        args.push(id); // Para el WHERE
        
        const updateQuery = `UPDATE acciones SET ${fields.join(', ')} WHERE id = ?`;
        
        const result = await mongoClient.execute({
            sql: updateQuery,
            args: args
        });
        
        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Acción no encontrada.' });
        }
        
        // Devolver la acción actualizada
        const updatedAccionResult = await mongoClient.execute({
            sql: 'SELECT * FROM acciones WHERE id = ?',
            args: [id]
        });
        
        const accionData = convertBigIntToString(updatedAccionResult.rows[0]);
        res.json(accionData);
        
    } catch (error) {
        console.error('Error al actualizar la acción de mejora:', error);
        res.status(500).json({ error: 'Error interno del servidor al actualizar la acción de mejora.' });
    }
});

// DELETE /api/acciones/:id - Eliminar una acción de mejora
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await mongoClient.execute({
            sql: 'DELETE FROM acciones WHERE id = ?',
            args: [id]
        });
        
        if (result.rowsAffected === 0) {
            return res.status(404).json({ error: 'Acción no encontrada.' });
        }
        
        res.json({ message: 'Acción eliminada con éxito.' });
        
    } catch (error) {
        console.error('Error al eliminar la acción de mejora:', error);
        res.status(500).json({ error: 'Error interno del servidor al eliminar la acción de mejora.' });
    }
});

// GET /api/acciones/:id - Obtener una acción específica por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await mongoClient.execute({
            sql: 'SELECT * FROM acciones WHERE id = ?',
            args: [id]
        });
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Acción no encontrada.' });
        }
        
        const accionData = convertBigIntToString(result.rows[0]);
        res.json(accionData);
        
    } catch (error) {
        console.error('Error al obtener la acción de mejora:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;
