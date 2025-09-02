const { Router } = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const ActivityLogService = require('../services/activityLogService.js');
const authMiddleware = require('../middleware/authMiddleware.js');
require('dotenv').config();

const router = Router();

// Aplicar autenticación para tener req.user y organization_id
router.use(authMiddleware);

// GET /api/personal - Listar todo el personal
router.get('/', async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id;
    console.log('🔓 Obteniendo personal para organización:', organizationId);
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
    const collection = db.collection('personal');
    
    // Buscar personal por organizationId con lookup a puestos y departamentos
    const personal = await collection.aggregate([
      {
        $match: { organization_id: new ObjectId(organizationId) }
      },
      {
        $lookup: {
          from: 'puestos',
          localField: 'puestoId',
          foreignField: '_id',
          as: 'puesto'
        }
      },
      {
        $unwind: {
          path: '$puesto',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'departamentos',
          localField: 'departamentoId',
          foreignField: '_id',
          as: 'departamento'
        }
      },
      {
        $unwind: {
          path: '$departamento',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();
    
    await client.close();
    
    console.log(`✅ Encontrados ${personal.length} empleados en organización ${organizationId}`);
    res.json(personal);
  } catch (error) {
    console.error('❌ Error obteniendo personal:', error);
    next(error);
  }
});

// GET /api/personal/:id - Obtener un empleado por ID
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id;
    console.log(`🔓 Obteniendo empleado ${id} para organización ${organizationId}`);
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
    const collection = db.collection('personal');
    
    // Buscar empleado por _id y organization_id con lookup a puesto y departamento
    const empleado = await collection.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          organization_id: new ObjectId(organizationId)
        }
      },
      {
        $lookup: {
          from: 'puestos',
          localField: 'puestoId',
          foreignField: '_id',
          as: 'puesto'
        }
      },
      {
        $unwind: {
          path: '$puesto',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'departamentos',
          localField: 'departamentoId',
          foreignField: '_id',
          as: 'departamento'
        }
      },
      {
        $unwind: {
          path: '$departamento',
          preserveNullAndEmptyArrays: true
        }
      }
    ]).toArray();
    
    await client.close();
    
    if (empleado.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    
    console.log(`✅ Empleado ${id} encontrado`);
    res.json(empleado[0]);
  } catch (error) {
    console.error('❌ Error obteniendo empleado:', error);
    next(error);
  }
});

// POST /api/personal - Crear un nuevo empleado
router.post('/', async (req, res, next) => {
  const { 
    nombre, 
    apellido, 
    email, 
    telefono, 
    fecha_ingreso, 
    tipo_personal, 
    puestoId, 
    departamentoId, 
    organization_id 
  } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  if (!nombre || !apellido || !email || !organization_id) {
    const err = new Error('Los campos "nombre", "apellido", "email" y "organization_id" son obligatorios.');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const client = new MongoClient(mongoConfig.uri);
    await client.connect();
    
    const db = client.db('9001app');
    const collection = db.collection('personal');
    
    // Verificar si ya existe un empleado con el mismo email en la misma organización
    const existing = await collection.findOne({
      email: email,
      organizationId: organization_id
    });

    if (existing) {
      const err = new Error('Ya existe un empleado con ese email en la organización.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    const now = new Date();
    const newEmpleado = {
      nombre,
      apellido,
      email,
      telefono: telefono || null,
      fecha_ingreso: fecha_ingreso ? new Date(fecha_ingreso) : now,
      tipo_personal: tipo_personal || 'empleado',
      puestoId: puestoId ? new ObjectId(puestoId) : null,
      departamentoId: departamentoId ? new ObjectId(departamentoId) : null,
      organizationId: organization_id,
      estado: 'activo',
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newEmpleado);
    newEmpleado._id = result.insertedId;

    await client.close();

    // Registrar en la bitácora
    await ActivityLogService.registrarCreacion(
      'personal',
      result.insertedId.toString(),
      newEmpleado,
      usuario,
      organization_id
    );

    res.status(201).json(newEmpleado);

  } catch (error) {
    console.error('❌ Error creando empleado:', error);
    next(error);
  }
});

// PUT /api/personal/:id - Actualizar un empleado
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { 
    nombre, 
    apellido, 
    email, 
    telefono, 
    fecha_ingreso, 
    tipo_personal, 
    puestoId, 
    departamentoId,
    estado 
  } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
    const collection = db.collection('personal');
    
    // Si se proporciona un email, verificar que no entre en conflicto con otro empleado
    if (email) {
      const existing = await collection.findOne({
        email: email,
        _id: { $ne: new ObjectId(id) }
      });
      if (existing) {
        const err = new Error('Ya existe otro empleado con ese email.');
        err.statusCode = 409;
        return next(err);
      }
    }

    // Obtener datos anteriores para la bitácora
    const prevData = await collection.findOne({ _id: new ObjectId(id) });

    if (!prevData) {
      const err = new Error('Empleado no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    const updateFields = {};
    if (nombre !== undefined) updateFields.nombre = nombre;
    if (apellido !== undefined) updateFields.apellido = apellido;
    if (email !== undefined) updateFields.email = email;
    if (telefono !== undefined) updateFields.telefono = telefono === '' ? null : telefono;
    if (fecha_ingreso !== undefined) updateFields.fecha_ingreso = fecha_ingreso ? new Date(fecha_ingreso) : prevData.fecha_ingreso;
    if (tipo_personal !== undefined) updateFields.tipo_personal = tipo_personal;
    if (puestoId !== undefined) updateFields.puestoId = puestoId ? new ObjectId(puestoId) : null;
    if (departamentoId !== undefined) updateFields.departamentoId = departamentoId ? new ObjectId(departamentoId) : null;
    if (estado !== undefined) updateFields.estado = estado;
    updateFields.updatedAt = new Date();

    if (Object.keys(updateFields).length === 0) {
      const err = new Error('No se proporcionaron campos para actualizar.');
      err.statusCode = 400;
      return next(err);
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      const err = new Error('Empleado no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    // Devolver el empleado actualizado
    const updatedEmpleado = await collection.findOne({ _id: new ObjectId(id) });

    await client.close();

    // Registrar en la bitácora
    await ActivityLogService.registrarActualizacion(
      'personal',
      id,
      prevData,
      updatedEmpleado,
      usuario,
      updatedEmpleado.organizationId
    );

    res.json(updatedEmpleado);

  } catch (error) {
    console.error('❌ Error actualizando empleado:', error);
    next(error);
  }
});

// DELETE /api/personal/:id - Eliminar un empleado
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
    const personalCollection = db.collection('personal');
    
    // Obtener datos anteriores para la bitácora
    const prevData = await personalCollection.findOne({ _id: new ObjectId(id) });

    if (!prevData) {
      const err = new Error('Empleado no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    // Verificar si hay evaluaciones asociadas
    const evaluacionesCollection = db.collection('evaluaciones_individuales');
    const evaluacionCheck = await evaluacionesCollection.findOne({
      personalId: id
    });

    if (evaluacionCheck) {
      const err = new Error('No se puede eliminar: El empleado tiene evaluaciones asociadas.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    // Verificar si hay capacitaciones asociadas
    const capacitacionesCollection = db.collection('capacitacion_asistentes');
    const capacitacionCheck = await capacitacionesCollection.findOne({
      personalId: id
    });

    if (capacitacionCheck) {
      const err = new Error('No se puede eliminar: El empleado tiene capacitaciones asociadas.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    // Si no hay dependencias, proceder con la eliminación
    const result = await personalCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      const err = new Error('Empleado no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    await client.close();

    // Registrar en la bitácora
    await ActivityLogService.registrarEliminacion(
      'personal',
      id,
      prevData,
      usuario,
      prevData.organizationId
    );

    res.json({ message: 'Empleado eliminado exitosamente' });

  } catch (error) {
    console.error('❌ Error eliminando empleado:', error);
    next(error);
  }
});

module.exports = router;
