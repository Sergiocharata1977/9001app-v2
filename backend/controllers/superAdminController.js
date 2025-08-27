const mongodbClient = require('../lib/mongodbClient.js');
const { randomUUID  } = require('crypto');
const bcrypt = require('bcryptjs');

// Obtener todas las organizaciones (solo super admin)
const getAllOrganizations = async (req, res) => {
  try {
    const result = await mongodbClient.execute(`
      SELECT 
        o.id,
        o.name,
        o.created_at,
        COUNT(u.id) as user_count,
        MAX(u.created_at) as last_user_created
      FROM organizations o
      LEFT JOIN usuarios u ON o.id = u.organization_id
      GROUP BY o.id, o.name, o.created_at
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener organizaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener detalles de una organización específica
const getOrganizationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Información básica de la organización
    const orgResult = await mongodbClient.execute({
      sql: 'SELECT * FROM organizations WHERE id = ?',
      args: [id]
    });

    if (orgResult.rows.length === 0) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }

    // Usuarios de la organización
    const usersResult = await mongodbClient.execute({
      sql: 'SELECT id, name, email, role, created_at FROM usuarios WHERE organization_id = ? ORDER BY created_at DESC',
      args: [id]
    });

    // Estadísticas de la organización
    const statsResult = await mongodbClient.execute({
      sql: `
        SELECT 
          (SELECT COUNT(*) FROM usuarios WHERE organization_id = ?) as total_users,
          (SELECT COUNT(*) FROM documentos WHERE organization_id = ?) as total_documents,
          (SELECT COUNT(*) FROM hallazgos WHERE organization_id = ?) as total_hallazgos,
          (SELECT COUNT(*) FROM audit_logs WHERE organization_id = ?) as total_audit_logs
      `,
      args: [id, id, id, id]
    });

    res.json({
      organization: orgResult.rows[0],
      users: usersResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener detalles de organización:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear una nueva organización con usuario admin
const createOrganization = async (req, res) => {
  try {
    const { organizationName, adminName, adminEmail, adminPassword } = req.body;

    if (!organizationName || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si ya existe una organización con ese nombre
    const existingOrg = await mongodbClient.execute({
      sql: 'SELECT id FROM organizations WHERE name = ?',
      args: [organizationName]
    });

    if (existingOrg.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe una organización con ese nombre' });
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await mongodbClient.execute({
      sql: 'SELECT id FROM usuarios WHERE email = ?',
      args: [adminEmail]
    });

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese email' });
    }

    // Crear organización
    const organizationId = randomUUID();
    await mongodbClient.execute({
      sql: 'INSERT INTO organizations (id, name, created_at) VALUES (?, ?, ?)',
      args: [organizationId, organizationName, new Date().toISOString()]
    });

    // Crear usuario admin
    const userId = randomUUID();
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await mongodbClient.execute({
      sql: 'INSERT INTO usuarios (id, name, email, password, role, organization_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [userId, adminName, adminEmail, hashedPassword, 'admin', organizationId, new Date().toISOString()]
    });

    res.status(201).json({
      message: 'Organización creada exitosamente',
      organization: {
        id: organizationId,
        name: organizationName,
        admin: {
          id: userId,
          name: adminName,
          email: adminEmail,
          role: 'admin'
        }
      }
    });
  } catch (error) {
    console.error('Error al crear organización:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar una organización
const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }

    // Verificar que la organización existe
    const existingOrg = await mongodbClient.execute({
      sql: 'SELECT id FROM organizations WHERE id = ?',
      args: [id]
    });

    if (existingOrg.rows.length === 0) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }

    // Verificar que no existe otra organización con el mismo nombre
    const nameCheck = await mongodbClient.execute({
      sql: 'SELECT id FROM organizations WHERE name = ? AND id != ?',
      args: [name, id]
    });

    if (nameCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe una organización con ese nombre' });
    }

    // Actualizar organización
    await mongodbClient.execute({
      sql: 'UPDATE organizations SET name = ? WHERE id = ?',
      args: [name, id]
    });

    res.json({ message: 'Organización actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar organización:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Desactivar una organización (soft delete)
const deactivateOrganization = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la organización existe
    const existingOrg = await mongodbClient.execute({
      sql: 'SELECT id FROM organizations WHERE id = ?',
      args: [id]
    });

    if (existingOrg.rows.length === 0) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }

    // Desactivar todos los usuarios de la organización
    await mongodbClient.execute({
      sql: 'UPDATE usuarios SET active = false WHERE organization_id = ?',
      args: [id]
    });

    // Marcar organización como inactiva
    await mongodbClient.execute({
      sql: 'UPDATE organizations SET active = false WHERE id = ?',
      args: [id]
    });

    res.json({ message: 'Organización desactivada exitosamente' });
  } catch (error) {
    console.error('Error al desactivar organización:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener estadísticas del sistema completo
const getSystemStats = async (req, res) => {
  try {
    // Estadísticas generales
    const generalStats = await mongodbClient.execute(`
      SELECT 
        (SELECT COUNT(*) FROM organizations) as total_organizations,
        (SELECT COUNT(*) FROM usuarios) as total_users,
        (SELECT COUNT(*) FROM documentos) as total_documents,
        (SELECT COUNT(*) FROM hallazgos) as total_hallazgos,
        (SELECT COUNT(*) FROM audit_logs) as total_audit_logs
    `);

    // Organizaciones más activas (por número de usuarios)
    const activeOrgs = await mongodbClient.execute(`
      SELECT 
        o.name,
        COUNT(u.id) as user_count
      FROM organizations o
      LEFT JOIN usuarios u ON o.id = u.organization_id
      GROUP BY o.id, o.name
      ORDER BY user_count DESC
      LIMIT 10
    `);

    // Actividad reciente (últimos 30 días)
    const recentActivity = await mongodbClient.execute(`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as activity_count
      FROM audit_logs
      WHERE timestamp >= date('now', '-30 days')
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `);

    // Distribución de roles
    const roleDistribution = await mongodbClient.execute(`
      SELECT 
        role,
        COUNT(*) as count
      FROM usuarios
      GROUP BY role
      ORDER BY count DESC
    `);

    res.json({
      general: generalStats.rows[0],
      activeOrganizations: activeOrgs.rows,
      recentActivity: recentActivity.rows,
      roleDistribution: roleDistribution.rows
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del sistema:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener logs de auditoría de todo el sistema
const getSystemAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, organizationId, action, dateFrom, dateTo } = req.query;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email,
        o.name as organization_name
      FROM audit_logs al
      LEFT JOIN usuarios u ON al.user_id = u.id
      LEFT JOIN organizations o ON al.organization_id = o.id
      WHERE 1=1
    `;
    
    const args = [];

    if (organizationId) {
      sql += ' AND al.organization_id = ?';
      args.push(organizationId);
    }

    if (action) {
      sql += ' AND al.action = ?';
      args.push(action);
    }

    if (dateFrom) {
      sql += ' AND al.timestamp >= ?';
      args.push(dateFrom);
    }

    if (dateTo) {
      sql += ' AND al.timestamp <= ?';
      args.push(dateTo);
    }

    sql += ' ORDER BY al.timestamp DESC LIMIT ? OFFSET ?';
    args.push(parseInt(limit), offset);

    const result = await mongodbClient.execute({ sql, args });

    // Contar total para paginación
    let countSql = 'SELECT COUNT(*) as total FROM audit_logs WHERE 1=1';
    const countArgs = [];

    if (organizationId) {
      countSql += ' AND organization_id = ?';
      countArgs.push(organizationId);
    }

    if (action) {
      countSql += ' AND action = ?';
      countArgs.push(action);
    }

    if (dateFrom) {
      countSql += ' AND timestamp >= ?';
      countArgs.push(dateFrom);
    }

    if (dateTo) {
      countSql += ' AND timestamp <= ?';
      countArgs.push(dateTo);
    }

    const countResult = await mongodbClient.execute({ sql: countSql, args: countArgs });
    const total = countResult.rows[0].total;

    res.json({
      logs: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener logs del sistema:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 