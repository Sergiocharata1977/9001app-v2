const mongoClient = require('../lib/mongoClient.js');

// Listar todas las competencias de la organización del usuario
const getCompetencias = async (req, res) => {
  try {
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    console.log(`🔎 [Competencias] Obteniendo competencias para organización: ${organization_id}`);
    
    const result = await mongoClient.execute({ 
      sql: 'SELECT * FROM competencias WHERE organization_id = ? ORDER BY created_at DESC',
      args: [organization_id]
    });
    
    console.log(`✅ [Competencias] Encontradas ${result.rows.length} competencias para organización ${organization_id}`);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ [Competencias] Error al obtener competencias:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener competencias', 
      details: error.message 
    });
  }
};

// Crear una competencia
const createCompetencia = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }
    
    if (!nombre) {
      return res.status(400).json({ 
        success: false,
        error: 'El nombre es obligatorio' 
      });
    }
    
    const result = await mongoClient.execute({
      sql: 'INSERT INTO competencias (nombre, descripcion, organization_id, created_at, updated_at) VALUES (?, ?, ?, datetime("now"), datetime("now"))',
      args: [nombre, descripcion || '', organization_id]
    });
    
    console.log(`✅ [Competencias] Competencia creada con ID: ${result.lastInsertRowid}`);
    
    res.status(201).json({ 
      success: true,
      data: { 
        id: Number(result.lastInsertRowid), 
        nombre, 
        descripcion, 
        organization_id: organization_id 
      },
      message: 'Competencia creada exitosamente'
    });
  } catch (error) {
    console.error('❌ [Competencias] Error al crear competencia:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear competencia', 
      details: error.message 
    });
  }
};

// Actualizar una competencia
const updateCompetencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }
    
    if (!nombre) {
      return res.status(400).json({ 
        success: false,
        error: 'El nombre es obligatorio' 
      });
    }
    
    // Verificar que la competencia pertenece a la organización
    const existingResult = await mongoClient.execute({
      sql: 'SELECT id FROM competencias WHERE id = ? AND organization_id = ?',
      args: [id, organization_id]
    });
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Competencia no encontrada' 
      });
    }
    
    await mongoClient.execute({
      sql: 'UPDATE competencias SET nombre = ?, descripcion = ?, updated_at = datetime("now") WHERE id = ? AND organization_id = ?',
      args: [nombre, descripcion || '', id, organization_id]
    });
    
    console.log(`✅ [Competencias] Competencia ${id} actualizada`);
    
    res.json({ 
      success: true,
      data: { id, nombre, descripcion },
      message: 'Competencia actualizada exitosamente'
    });
  } catch (error) {
    console.error('❌ [Competencias] Error al actualizar competencia:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar competencia', 
      details: error.message 
    });
  }
};

// Eliminar una competencia
const deleteCompetencia = async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }
    
    // Verificar que la competencia pertenece a la organización
    const existingResult = await mongoClient.execute({
      sql: 'SELECT id FROM competencias WHERE id = ? AND organization_id = ?',
      args: [id, organization_id]
    });
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Competencia no encontrada' 
      });
    }
    
    await mongoClient.execute({
      sql: 'DELETE FROM competencias WHERE id = ? AND organization_id = ?',
      args: [id, organization_id]
    });
    
    console.log(`✅ [Competencias] Competencia ${id} eliminada`);
    
    res.json({ 
      success: true,
      message: 'Competencia eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ [Competencias] Error al eliminar competencia:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al eliminar competencia', 
      details: error.message 
    });
  }
};

module.exports = {
  getCompetencias,
  createCompetencia,
  updateCompetencia,
  deleteCompetencia
};