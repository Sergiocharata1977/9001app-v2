const { Router } = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const ActivityLogService = require('../services/activityLogService.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const mongoConfig = require('../config/mongodb.config.js');

const router = Router();

// Aplicar autenticación para tener req.user y organization_id
router.use(authMiddleware);

// GET /api/departamentos - Listar todos los departamentos
router.get('/', async (req, res, next) => {
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id;
    console.log('🔓 Obteniendo departamentos para organización:', organizationId);
    
    const client = new MongoClient(mongoConfig.uri);
    await client.connect();
    
    const db = client.db('9001app');
    const collection = db.collection('departamentos');
    
    // Buscar departamentos por organizationId
    const departamentos = await collection.find({
      organizationId: organizationId
    }).sort({ createdAt: -1 }).toArray();
    
    await client.close();
    
    console.log(`✅ Encontrados ${departamentos.length} departamentos en organización ${organizationId}`);
    res.json(departamentos);
  } catch (error) {
    console.error('❌ Error obteniendo departamentos:', error);
    next(error);
  }
});

// GET /api/departamentos/:id - Obtener un departamento por ID
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const organizationId = req.user?.organization_id || req.user?.org_id;
    console.log(`🔓 Obteniendo departamento ${id} para organización ${organizationId}`);
    
    const client = new MongoClient(mongoConfig.uri);
    await client.connect();
    
    const db = client.db('9001app');
    const collection = db.collection('departamentos');
    
    // Buscar departamento por _id y organizationId
    const departamento = await collection.findOne({
      _id: new ObjectId(id),
      organizationId: organizationId
    });

    await client.close();

    if (!departamento) {
      const err = new Error('Departamento no encontrado en tu organización.');
      err.statusCode = 404;
      return next(err);
    }
    res.json(departamento);
  } catch (error) {
    console.error('❌ Error obteniendo departamento:', error);
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
    const client = new MongoClient(mongoConfig.uri);
    await client.connect();
    
    const db = client.db('9001app');
    const collection = db.collection('departamentos');
    
    // Verificar si ya existe un departamento con el mismo nombre en la misma organización
    const existing = await collection.findOne({
      nombre: nombre,
      organizationId: organization_id
    });

    if (existing) {
      const err = new Error('Ya existe un departamento con ese nombre en la organización.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    const now = new Date();
    const newDepartamento = {
      nombre,
      descripcion: descripcion || null,
      objetivos: objetivos || null,
      organizationId: organization_id,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(newDepartamento);
    newDepartamento._id = result.insertedId;

    await client.close();

    // Registrar en la bitácora
    await ActivityLogService.registrarCreacion(
      'departamento',
      result.insertedId.toString(),
      newDepartamento,
      usuario,
      organization_id
    );

    res.status(201).json(newDepartamento);

  } catch (error) {
    console.error('❌ Error creando departamento:', error);
    next(error);
  }
});

// PUT /api/departamentos/:id - Actualizar un departamento
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { nombre, descripcion, responsable, objetivos } = req.body;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const client = new MongoClient(mongoConfig.uri);
    await client.connect();
    
    const db = client.db('9001app');
    const collection = db.collection('departamentos');
    
    // Si se proporciona un nombre, verificar que no entre en conflicto con otro departamento
    if (nombre) {
      const existing = await collection.findOne({
        nombre: nombre,
        _id: { $ne: new ObjectId(id) }
      });
      if (existing) {
        const err = new Error('Ya existe otro departamento con ese nombre.');
        err.statusCode = 409;
        return next(err);
      }
    }

    // Obtener datos anteriores para la bitácora
    const prevData = await collection.findOne({ _id: new ObjectId(id) });

    if (!prevData) {
      const err = new Error('Departamento no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    const updateFields = {};
    if (nombre !== undefined) updateFields.nombre = nombre;
    if (descripcion !== undefined) updateFields.descripcion = descripcion === '' ? null : descripcion;
    if (responsable !== undefined) updateFields.responsable = responsable === '' ? null : responsable;
    if (objetivos !== undefined) updateFields.objetivos = objetivos === '' ? null : objetivos;
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
      const err = new Error('Departamento no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    // Devolver el departamento actualizado
    const updatedDept = await collection.findOne({ _id: new ObjectId(id) });

    await client.close();

    // Registrar en la bitácora
    await ActivityLogService.registrarActualizacion(
      'departamento',
      id,
      prevData,
      updatedDept,
      usuario,
      updatedDept.organizationId
    );

    res.json(updatedDept);

  } catch (error) {
    console.error('❌ Error actualizando departamento:', error);
    next(error);
  }
});

// DELETE /api/departamentos/:id - Eliminar un departamento
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  const usuario = req.user || { id: null, nombre: 'Sistema' };

  try {
    const client = new MongoClient(mongoConfig.uri);
    await client.connect();
    
    const db = client.db('9001app');
    const departamentosCollection = db.collection('departamentos');
    const puestosCollection = db.collection('puestos');
    const personalCollection = db.collection('personal');
    
    // 1. Verificar si hay puestos asociados
    const puestosCheck = await puestosCollection.findOne({
      departamentoId: id
    });

    if (puestosCheck) {
      const err = new Error('No se puede eliminar: El departamento tiene puestos asociados.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    // 2. Verificar si hay personal asociado
    const personalCheck = await personalCollection.findOne({
      departamentoId: id
    });

    if (personalCheck) {
      const err = new Error('No se puede eliminar: El departamento tiene personal asociado.');
      err.statusCode = 409; // Conflict
      return next(err);
    }

    // Obtener datos anteriores para la bitácora
    const prevData = await departamentosCollection.findOne({ _id: new ObjectId(id) });

    if (!prevData) {
      const err = new Error('Departamento no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    // 3. Si no hay dependencias, proceder con la eliminación
    const result = await departamentosCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      const err = new Error('Departamento no encontrado.');
      err.statusCode = 404;
      return next(err);
    }

    await client.close();

    // Registrar en la bitácora
    await ActivityLogService.registrarEliminacion(
      'departamento',
      id,
      prevData,
      usuario,
      prevData.organizationId
    );

    res.json({ message: 'Departamento eliminado exitosamente' });

  } catch (error) {
    console.error('❌ Error eliminando departamento:', error);
    next(error);
  }
});

module.exports = router;
