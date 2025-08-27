const mongoClient = require('../lib/mongoClient.js');

// Obtener la configuración actual
const getConfiguracion = async (req, res) => {
  try {
    const organizationId = req.user?.organization_id || 1; // Default a 1 si no hay usuario
    const result = await mongoClient.execute(
      'SELECT * FROM direccion_configuracion WHERE organization_id = ?', 
      [organizationId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se encontró la configuración para esta organización.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener la configuración de dirección:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar la configuración
const updateConfiguracion = async (req, res) => {
  const { 
    politica_calidad, 
    alcance, 
    estrategia,
    organigrama_url,
    mapa_procesos_url,
    compromiso_titulo,
    compromiso_descripcion,
    compromiso_satisfaccion,
    compromiso_calidad: compromiso_calidad_text,
    compromiso_mejora,
    compromiso_personal
  } = req.body;
  
  const organizationId = req.user?.organization_id || 1;
  const now = new Date().toISOString();

  try {
    const result = await mongoClient.execute({
      sql: `
        UPDATE direccion_configuracion
        SET 
          politica_calidad = ?,
          alcance = ?,
          estrategia = ?,
          organigrama_url = ?,
          mapa_procesos_url = ?,
          compromiso_titulo = ?,
          compromiso_descripcion = ?,
          compromiso_satisfaccion = ?,
          compromiso_calidad = ?,
          compromiso_mejora = ?,
          compromiso_personal = ?,
          updated_at = ?
        WHERE organization_id = ?;
      `,
      args: [
        politica_calidad, 
        alcance, 
        estrategia,
        organigrama_url,
        mapa_procesos_url,
        compromiso_titulo,
        compromiso_descripcion,
        compromiso_satisfaccion,
        compromiso_calidad_text,
        compromiso_mejora,
        compromiso_personal,
        now,
        organizationId
      ]
    });

    if (result.rowsAffected === 0) {
        return res.status(404).json({ message: 'No se encontró la configuración para actualizar.' });
    }

    // Obtener la configuración actualizada para devolverla
    const updatedConfig = await mongoClient.execute(
      'SELECT * FROM direccion_configuracion WHERE organization_id = ?',
      [organizationId]
    );

    res.status(200).json(updatedConfig.rows[0]);
  } catch (error) {
    console.error('Error al actualizar la configuración de dirección:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
