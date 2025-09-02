const mongoClient = require('../lib/mongoClient.js');

// @desc    Obtener todos los eventos de una organización
// @route   GET /api/events
// @access  Privado
const getAllEvents = async (req, res) => {
  try {
    const organization_id = req.user.organization_id;
    const result = await db.execute({
      sql: 'SELECT * FROM events WHERE organization_id = ? ORDER BY start_time DESC',
      args: [organization_id],
    });
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @desc    Crear un nuevo evento
// @route   POST /api/events
// @access  Privado
const createEvent = async (req, res) => {
  const { title, description, start_time, end_time, all_day, type } = req.body;
  const { organization_id, id: user_id } = req.user;

  if (!title || !start_time) {
    return res.status(400).json({ message: 'El título y la fecha de inicio son obligatorios' });
  }

  try {
    const result = await db.execute({
      sql: 'INSERT INTO events (title, description, start_time, end_time, all_day, type, organization_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [title, description, start_time, end_time, all_day || false, type || 'otro', organization_id, user_id],
    });
    
    const newEventId = result.lastInsertRowid;
    const newEventResult = await db.execute({
        sql: 'SELECT * FROM events WHERE id = ?',
        args: [newEventId]
    });

    res.status(201).json(newEventResult.rows[0]);
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @desc    Actualizar un evento
// @route   PUT /api/events/:id
// @access  Privado
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, start_time, end_time, all_day, type } = req.body;
  const { organization_id } = req.user;

  try {
    // Primero, verificar que el evento pertenece a la organización del usuario
    const eventResult = await db.execute({
      sql: 'SELECT * FROM events WHERE id = ? AND organization_id = ?',
      args: [id, organization_id],
    });

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: 'Evento no encontrado o no autorizado' });
    }

    // Si existe, actualizarlo
    await db.execute({
      sql: 'UPDATE events SET title = ?, description = ?, start_time = ?, end_time = ?, all_day = ?, type = ? WHERE id = ?',
      args: [title, description, start_time, end_time, all_day, type, id],
    });

    const updatedEventResult = await db.execute({
        sql: 'SELECT * FROM events WHERE id = ?',
        args: [id]
    });

    res.json(updatedEventResult.rows[0]);
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// @desc    Eliminar un evento
// @route   DELETE /api/events/:id
// @access  Privado
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const { organization_id } = req.user;

  try {
    // Verificar que el evento pertenece a la organización antes de eliminar
    const eventResult = await db.execute({
        sql: 'SELECT id FROM events WHERE id = ? AND organization_id = ?',
        args: [id, organization_id]
    });

    if (eventResult.rows.length === 0) {
        return res.status(404).json({ message: 'Evento no encontrado o no autorizado' });
    }

    await db.execute({ 
      sql: 'DELETE FROM events WHERE id = ?', 
      args: [id] 
    });

    res.json({ message: 'Evento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


module.exports = { getAllEvents, createEvent, updateEvent, deleteEvent  };
