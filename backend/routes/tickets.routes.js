const express = require('express');
const mongoClient = require('../lib/mongoClient.js');
const authMiddleware = require('../middleware/authMiddleware.js');
const { ensureTenant, secureQuery, logTenantOperation, checkPermission } = require('../middleware/tenantMiddleware.js');

const router = express.Router();

// ✅ OBLIGATORIO: Aplicar middlewares en orden correcto
router.use(authMiddleware);
router.use(ensureTenant);

const TABLE_NAME = 'tickets';

// @route   GET api/tickets
// @desc    Obtener todos los tickets de la organización
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const query = secureQuery(req);
    
    const result = await mongoClient.execute({
      sql: `SELECT * FROM ${TABLE_NAME} WHERE ${query.where()} ORDER BY created_at DESC`,
      args: query.args()
    });

    const tickets = result.rows.map(ticket => ({
      ...ticket,
      comentarios: ticket.comentarios ? JSON.parse(ticket.comentarios) : [],
      archivos: ticket.archivos ? JSON.parse(ticket.archivos) : [],
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

    // Agregar organization_id a los datos del ticket
    const ticketWithOrg = {
      ...newTicketData,
      organization_id: query.organizationId,
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };

    // Preparar los datos para la inserción
    const keys = Object.keys(ticketWithOrg);
    const values = Object.values(ticketWithOrg);
    
    const placeholders = keys.map(() => '?').join(', ');
    const fieldsString = keys.join(', ');
    
    const result = await mongoClient.execute({
      sql: `INSERT INTO ${TABLE_NAME} (${fieldsString}) VALUES (${placeholders}) RETURNING *`,
      args: values
    });
    
    const createdTicket = result.rows[0];
    
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
    
    const result = await mongoClient.execute({
      sql: `SELECT * FROM ${TABLE_NAME} WHERE id = ? AND ${query.where()}`,
      args: [id, ...query.args()]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    const ticket = result.rows[0];
    ticket.comentarios = ticket.comentarios ? JSON.parse(ticket.comentarios) : [];
    ticket.archivos = ticket.archivos ? JSON.parse(ticket.archivos) : [];

    logTenantOperation(req, 'GET_TICKET', { ticketId: id });
    res.json(ticket);
  } catch (error) {
    console.error(`Error al obtener el ticket ${id}:`, error);
    next(error);
  }
});

// @route   PUT api/tickets/:id
// @desc    Actualizar un ticket (solo de la organización)
// @access  Private
router.put('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!checkPermission(req, 'employee')) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }

    const query = secureQuery(req);
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
      updated_by: req.user.id
    };

    // Preparar los datos para la actualización
    const keys = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const result = await mongoClient.execute({
      sql: `UPDATE ${TABLE_NAME} SET ${setClause} WHERE id = ? AND ${query.where()} RETURNING *`,
      args: [...values, id, ...query.args()]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    logTenantOperation(req, 'UPDATE_TICKET', { ticketId: id });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error al actualizar el ticket ${id}:`, error);
    next(error);
  }
});

// @route   DELETE api/tickets/:id
// @desc    Eliminar un ticket (solo de la organización)
// @access  Private
router.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!checkPermission(req, 'manager')) {
      return res.status(403).json({ error: 'Permisos insuficientes - se requiere rol manager o superior' });
    }

    const query = secureQuery(req);
    
    const result = await mongoClient.execute({
      sql: `DELETE FROM ${TABLE_NAME} WHERE id = ? AND ${query.where()}`,
      args: [id, ...query.args()]
    });

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    logTenantOperation(req, 'DELETE_TICKET', { ticketId: id });
    res.status(204).send();
  } catch (error) {
    console.error(`Error al eliminar el ticket ${id}:`, error);
    next(error);
  }
});

module.exports = router;
