import MongoDBConnection from '../config/mongodb';

// @desc    Obtener todos los productos de la organización
// @route   GET /api/productos
// @access  Private
const getProductos = async (req, res) => {
  try {
    const organization_id = req.user?.organization_id;
    console.log(`🔍 Obteniendo productos para organización ${organization_id}...`);

    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    const result = await tursoClient.execute({
      sql: `
        SELECT 
          id, nombre, descripcion, codigo, estado, tipo, categoria,
          responsable, fecha_creacion, fecha_revision, version,
          especificaciones, requisitos_calidad, proceso_aprobacion,
          documentos_asociados, observaciones, created_at, updated_at
        FROM productos 
        WHERE organization_id = ? 
        ORDER BY created_at DESC
      `,
      args: [organization_id]
    });

    console.log(`✅ ${result.rows.length} productos encontrados`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error obteniendo productos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener productos' });
  }
};

// @desc    Obtener un producto específico
// @route   GET /api/productos/:id
// @access  Private
const getProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;
    console.log(`🔍 Obteniendo producto ${id} para organización ${organization_id}...`);

    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    const result = await tursoClient.execute({
      sql: `
        SELECT 
          id, nombre, descripcion, codigo, estado, tipo, categoria,
          responsable, fecha_creacion, fecha_revision, version,
          especificaciones, requisitos_calidad, proceso_aprobacion,
          documentos_asociados, observaciones, created_at, updated_at
        FROM productos 
        WHERE id = ? AND organization_id = ?
      `,
      args: [id, organization_id]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    console.log(`✅ Producto ${id} encontrado`);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('❌ Error obteniendo producto:', error);
    res.status(500).json({ success: false, message: 'Error al obtener producto' });
  }
};

// @desc    Crear un nuevo producto
// @route   POST /api/productos
// @access  Private
const createProducto = async (req, res) => {
  try {
    const organization_id = req.user?.organization_id;
    const {
      nombre, descripcion, codigo, estado, tipo, categoria,
      responsable, fecha_creacion, fecha_revision, version,
      especificaciones, requisitos_calidad, proceso_aprobacion,
      documentos_asociados, observaciones
    } = req.body;

    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    console.log(`🔍 Creando producto para organización ${organization_id}...`);

    // Validar campos requeridos
    if (!nombre || !estado || !tipo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre, estado y tipo son campos requeridos' 
      });
    }

    // Verificar si el código ya existe (si se proporciona)
    if (codigo) {
      const existingResult = await tursoClient.execute({
        sql: 'SELECT id FROM productos WHERE codigo = ? AND organization_id = ?',
        args: [codigo, organization_id]
      });

      if (existingResult.rows.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: 'Ya existe un producto con ese código en esta organización' 
        });
      }
    }

    const result = await tursoClient.execute({
      sql: `
        INSERT INTO productos (
          organization_id, nombre, descripcion, codigo, estado, tipo, categoria,
          responsable, fecha_creacion, fecha_revision, version,
          especificaciones, requisitos_calidad, proceso_aprobacion,
          documentos_asociados, observaciones, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        RETURNING *
      `,
      args: [
        organization_id, nombre, descripcion, codigo, estado, tipo, categoria,
        responsable, fecha_creacion, fecha_revision, version,
        especificaciones, requisitos_calidad, proceso_aprobacion,
        documentos_asociados, observaciones
      ]
    });

    console.log(`✅ Producto creado con ID: ${result.rows[0].id}`);
    res.status(201).json({ 
      success: true, 
      data: result.rows[0], 
      message: 'Producto creado exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error creando producto:', error);
    res.status(500).json({ success: false, message: 'Error al crear producto' });
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/productos/:id
// @access  Private
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;
    const {
      nombre, descripcion, codigo, estado, tipo, categoria,
      responsable, fecha_creacion, fecha_revision, version,
      especificaciones, requisitos_calidad, proceso_aprobacion,
      documentos_asociados, observaciones
    } = req.body;

    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }

    console.log(`🔍 Actualizando producto ${id} para organización ${organization_id}...`);

    // Verificar que el producto existe y pertenece a la organización
    const existingResult = await tursoClient.execute({
      sql: 'SELECT id FROM productos WHERE id = ? AND organization_id = ?',
      args: [id, organization_id]
    });

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    // Verificar si el código ya existe en otro producto (si se está cambiando)
    if (codigo) {
      const duplicateResult = await tursoClient.execute({
        sql: 'SELECT id FROM productos WHERE codigo = ? AND organization_id = ? AND id != ?',
        args: [codigo, organization_id, id]
      });

      if (duplicateResult.rows.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: 'Ya existe otro producto con ese código en esta organización' 
        });
      }
    }

    const result = await tursoClient.execute({
      sql: `
        UPDATE productos SET 
          nombre = ?, descripcion = ?, codigo = ?, estado = ?, tipo = ?, categoria = ?,
          responsable = ?, fecha_creacion = ?, fecha_revision = ?, version = ?,
          especificaciones = ?, requisitos_calidad = ?, proceso_aprobacion = ?,
          documentos_asociados = ?, observaciones = ?, updated_at = datetime('now')
        WHERE id = ? AND organization_id = ?
        RETURNING *
      `,
      args: [
        nombre, descripcion, codigo, estado, tipo, categoria,
        responsable, fecha_creacion, fecha_revision, version,
        especificaciones, requisitos_calidad, proceso_aprobacion,
        documentos_asociados, observaciones, id, organization_id
      ]
    });

    console.log(`✅ Producto ${id} actualizado`);
    res.json({ 
      success: true, 
      data: result.rows[0], 
      message: 'Producto actualizado exitosamente' 
    });
  } catch (error) {
    console.error('❌ Error actualizando producto:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar producto' });
  }
};

// @desc    Eliminar un producto
// @route   DELETE /api/productos/:id
// @access  Private
const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }
    
    console.log(`🔍 Eliminando producto ${id} de organización ${organization_id}...`);

    // Verificar que el producto existe y pertenece a la organización
    const existingResult = await tursoClient.execute({
      sql: 'SELECT id FROM productos WHERE id = ? AND organization_id = ?',
      args: [id, organization_id]
    });

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    await tursoClient.execute({
      sql: 'DELETE FROM productos WHERE id = ? AND organization_id = ?',
      args: [id, organization_id]
    });

    console.log(`✅ Producto ${id} eliminado`);
    res.json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando producto:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar producto' });
  }
};

// @desc    Obtener historial de cambios de un producto
// @route   GET /api/productos/:id/historial
// @access  Private
const getHistorialProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const organization_id = req.user?.organization_id;
    
    if (!organization_id) {
      return res.status(403).json({
        success: false,
        message: 'No se pudo determinar la organización del usuario.'
      });
    }
    
    console.log(`🔍 Obteniendo historial del producto ${id}...`);

    const result = await tursoClient.execute({
      sql: `
        SELECT 
          id, campo_modificado, valor_anterior, valor_nuevo,
          usuario_responsable, fecha_cambio
        FROM productos_historial 
        WHERE producto_id = ? AND organization_id = ?
        ORDER BY fecha_cambio DESC
      `,
      args: [id, organization_id]
    });

    console.log(`✅ ${result.rows.length} cambios encontrados en el historial`);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);
    res.status(500).json({ success: false, message: 'Error al obtener historial' });
  }
}; 

module.exports = {
  getProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
  getHistorialProducto
}; 