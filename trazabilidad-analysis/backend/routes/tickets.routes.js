const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const { ensureTenant, secureQuery, logTenantOperation, checkPermission } = require('../middleware/tenantMiddleware.js');
const crypto = require('crypto');

const router = express.Router();

// ✅ OBLIGATORIO: Aplicar middlewares en orden correcto
router.use(authMiddleware);
router.use(ensureTenant);

const COLLECTION_NAME = 'tickets';

// @route   GET api/tickets
// @desc    Obtener todos los tickets de la organización
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const query = secureQuery(req);
    const collection = mongoClient.collection(COLLECTION_NAME);
    
    const result = await collection.find(
      { organization_id: query.organizationId },
      { sort: { created_at: -1 } }
    ).toArray();

    const tickets = result.map(ticket => ({
      ...ticket,
      comentarios: ticket.comentarios || [],
      archivos: ticket.archivos || [],
    }));

    logTenantOperation(req, 'GET_TICKETS', { count: tickets.length });
    res.json(tickets);
    console.log(`Se encontraron ${tickets.length} tickets para la organización ${query.organizationId}.`);
  } catch (error) {
    console.error('Error al obtener tickets desde la base de datos:', error);
    next(error);
  }
});

// @route   POST api/tickets
// @desc    Crear un nuevo ticket en la organización
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    if (!checkPermission(req, 'employee')) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    const newTicketData = req.body;
    const query = secureQuery(req);
    
    // Validación de los datos de entrada
    if (!newTicketData.titulo || !newTicketData.descripcion) {
      return res.status(400).json({ message: 'Los campos "titulo" y "descripcion" son obligatorios.' });
    }

    const collection = mongoClient.collection(COLLECTION_NAME);

    // Agregar organization_id a los datos del ticket
    const ticketWithOrg = {
      id: crypto.randomUUID(),
      ...newTicketData,
      organization_id: query.organizationId,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date(),
      comentarios: newTicketData.comentarios || [],
      archivos: newTicketData.archivos || []
    };

    const result = await collection.insertOne(ticketWithOrg);
    
    const createdTicket = { ...ticketWithOrg, _id: result.insertedId };
    
    logTenantOperation(req, 'CREATE_TICKET', { ticketId: createdTicket.id, titulo: newTicketData.titulo });
    console.log('Ticket creado y guardado en la base de datos:', createdTicket);
    res.status(201).json(createdTicket);
  } catch (error) {
    console.error('Error al crear ticket en la base de datos:', error);
    next(error);
  }
});

// @route   GET api/tickets/:id
// @desc    Obtener un ticket por ID (solo de la organización)
// @access  Private
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const query = secureQuery(req);
    const collection = mongoClient.collection(COLLECTION_NAME);
    
    const result = await collection.findOne({
      id: id,
      organization_id: query.organizationId
    });

    if (!result) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    const ticket = {
      ...result,
      comentarios: result.comentarios || [],
      archivos: result.archivos || []
    };

    logTenantOperation(req, 'GET_TICKET', { ticketId: id });
    res.json(ticket);
  } catch (error) {
    console.error('Error al obtener ticket desde la base de datos:', error);
    next(error);
  }
});

// @route   PUT api/tickets/:id
// @desc    Actualizar un ticket por ID (solo de la organización)
// @access  Private
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!checkPermission(req, 'employee')) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    const query = secureQuery(req);
    const collection = mongoClient.collection(COLLECTION_NAME);
    
    // Verificar que el ticket existe y pertenece a la organización
    const existingTicket = await collection.findOne({
      id: id,
      organization_id: query.organizationId
    });

    if (!existingTicket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    // Preparar datos para actualización
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    // Mantener campos que no deben actualizarse
    delete updateData.id;
    delete updateData.organization_id;
    delete updateData.created_by;
    delete updateData.created_at;

    const result = await collection.updateOne(
      { id: id, organization_id: query.organizationId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    // Obtener el ticket actualizado
    const updatedTicket = await collection.findOne({
      id: id,
      organization_id: query.organizationId
    });

    logTenantOperation(req, 'UPDATE_TICKET', { ticketId: id });
    res.json(updatedTicket);
  } catch (error) {
    console.error('Error al actualizar ticket en la base de datos:', error);
    next(error);
  }
});

// @route   DELETE api/tickets/:id
// @desc    Eliminar un ticket por ID (solo de la organización)
// @access  Private
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!checkPermission(req, 'admin')) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    const query = secureQuery(req);
    const collection = mongoClient.collection(COLLECTION_NAME);
    
    const result = await collection.deleteOne({
      id: id,
      organization_id: query.organizationId
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    logTenantOperation(req, 'DELETE_TICKET', { ticketId: id });
    res.json({ message: 'Ticket eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar ticket de la base de datos:', error);
    next(error);
  }
});

module.exports = router;
