const { Router } = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const ActivityLogService = require('../services/activityLogService.js');
const authMiddleware = require('../middleware/authMiddleware.js');
require('dotenv').config();

const router = Router();

// Aplicar autenticación para tener req.user y organization_id
router.use(authMiddleware);

// GET /api/puestos - Listar todos los puestos
router.get('/', async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id;
    console.log('🔓 Obteniendo puestos para organización:', organizationId);
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
    const collection = db.collection('puestos');
    
    // Buscar puestos por organizationId con lookup a departamento
    const puestos = await collection.aggregate([
      {
        $match: { organization_id: new ObjectId(organizationId) }
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
    
    console.log(`✅ Encontrados ${puestos.length} puestos en organización ${organizationId}`);
    res.json(puestos);
  } catch (error) {
    console.error('❌ Error obteniendo puestos:', error);
    next(error);
  }
});

// GET /api/puestos/:id - Obtener un puesto por ID
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id;
    console.log(`🔓 Obteniendo puesto ${id} para organización ${organizationId}`);
    
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
    const collection = db.collection('puestos');
    
    // Buscar puesto por _id y organizationId con lookup a departamento
    const puesto = await collection.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          organizationId: organizationId
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

    if (puesto.length === 0) {
      const err = new Error('Puesto no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }
    res.json(puesto[0]);
  } catch (error) {
    console.error('❌ Error obteniendo puesto:', error);
    next(error);
  }
});

// POST /api/puestos - Crear un nuevo puesto
router.post('/', async (req, res, next) => {
  const { nombre, descripcion, responsabilidades, requisitos, departamentoId, organization_id } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  if (!nombre || !organization_id) {
    const err = new Error('Los campos "nombre" y "organization_id" son obligatorios.');
    err.statusCode = 400;
    return next(err);
  }

  try {
    const client = new MongoClient(mongoConfig.uri);
    await client.connect();
    
    const db = client.db('9001app');
    const collection = db.collection('puestos');
    
    // Verificar si ya existe un puesto con el mismo nombre en la misma organización
    const existing = await collection.findOne({
      nombre: nombre,
      organizationId: organization_id
    });

    if (existing) {
      const err = new Error('Ya existe un puesto con ese nombre en la organización.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    const now = new Date();
    const newPuesto = {
      nombre,
      descripcion: descripcion || null,
      responsabilidades: responsabilidades || null,
      requisitos: requisitos || null,
      departamentoId: departamentoId ? new ObjectId(departamentoId) : null,
      organizationId: organization_id,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newPuesto);
    newPuesto._id = result.insertedId;

    await client.close();

    // Registrar en la bitácora
    await ActivityLogService.registrarCreacion(
      'puesto',
      result.insertedId.toString(),
      newPuesto,
      usuario,
      organization_id
    );

    res.status(201).json(newPuesto);

  } catch (error) {
    console.error('❌ Error creando puesto:', error);
    next(error);
  }
});

// PUT /api/puestos/:id - Actualizar un puesto
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { nombre, descripcion, responsabilidades, requisitos, departamentoId } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const client = new MongoClient(mongoConfig.uri);
    await client.connect();
    
    const db = client.db('9001app');
    const collection = db.collection('puestos');
    
    // Si se proporciona un nombre, verificar que no entre en conflicto con otro puesto
    if (nombre) {
      const existing = await collection.findOne({
        nombre: nombre,
        _id: { $ne: new ObjectId(id) }
      });
      if (existing) {
        const err = new Error('Ya existe otro puesto con ese nombre.');
        err.statusCode = 409;
        return next(err);
      }
    }

    // Obtener datos anteriores para la bitácora
    const prevData = await collection.findOne({ _id: new ObjectId(id) });

    if (!prevData) {
      const err = new Error('Puesto no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    const updateFields = {};
    if (nombre !== undefined) updateFields.nombre = nombre;
    if (descripcion !== undefined) updateFields.descripcion = descripcion === '' ? null : descripcion;
    if (responsabilidades !== undefined) updateFields.responsabilidades = responsabilidades === '' ? null : responsabilidades;
    if (requisitos !== undefined) updateFields.requisitos = requisitos === '' ? null : requisitos;
    if (departamentoId !== undefined) updateFields.departamentoId = departamentoId ? new ObjectId(departamentoId) : null;
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
      const err = new Error('Puesto no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    // Devolver el puesto actualizado
    const updatedPuesto = await collection.findOne({ _id: new ObjectId(id) });

    await client.close();

    // Registrar en la bitácora
    await ActivityLogService.registrarActualizacion(
      'puesto',
      id,
      prevData,
      updatedPuesto,
      usuario,
      updatedPuesto.organizationId
    );

    res.json(updatedPuesto);

  } catch (error) {
    console.error('❌ Error actualizando puesto:', error);
    next(error);
  }
});

// DELETE /api/puestos/:id - Eliminar un puesto
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const client = new MongoClient(mongoConfig.uri);
    await client.connect();
    
    const db = client.db('9001app');
    const puestosCollection = db.collection('puestos');
    const personalCollection = db.collection('personal');
    
    // 1. Verificar si hay personal asociado
    const personalCheck = await personalCollection.findOne({
      puestoId: id
    });

    if (personalCheck) {
      const err = new Error('No se puede eliminar: El puesto tiene personal asociado.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    // Obtener datos anteriores para la bitácora
    const prevData = await puestosCollection.findOne({ _id: new ObjectId(id) });

    if (!prevData) {
      const err = new Error('Puesto no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    // 2. Si no hay dependencias, proceder con la eliminación
    const result = await puestosCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      const err = new Error('Puesto no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    await client.close();

    // Registrar en la bitácora
    await ActivityLogService.registrarEliminacion(
      'puesto',
      id,
      prevData,
      usuario,
      prevData.organizationId
    );

    res.json({ message: 'Puesto eliminado exitosamente' });

  } catch (error) {
    console.error('❌ Error eliminando puesto:', error);
    next(error);
  }
});

module.exports = router;