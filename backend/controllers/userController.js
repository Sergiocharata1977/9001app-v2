const bcrypt = require('bcryptjs');
const mongoClient = require('../lib/mongoClient.js');
const { randomUUID } = require('crypto');

/**
 * MODO BÁSICO: SIN RESTRICCIONES DE ROLES
 * Cualquier usuario autenticado puede hacer cualquier operación en su organización
 */

// Obtener todos los usuarios de la organización del usuario actual
const getOrganizationUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    
    let organizationId;
    
    // Super admin puede especificar organización, otros ven la suya
    if (currentUser.role === 'super_admin' && req.query.organization_id) {
      organizationId = req.query.organization_id;
    } else {
      organizationId = currentUser.organization_id;
    }

    console.log(`👥 Obteniendo usuarios para organización ${organizationId}`);

    const result = await mongoClient.execute({
      sql: `SELECT u.id, u.name, u.email, u.role, u.organization_id, u.created_at, u.last_login,
             o.name as organization_name, o.plan
             FROM usuarios u 
             LEFT JOIN organizations o ON u.organization_id = o.id 
             WHERE u.organization_id = ?
             ORDER BY u.created_at DESC`,
      args: [organizationId]
    });

    const users = result.rows.map(user => ({
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      organization_id: Number(user.organization_id),
      organization_name: user.organization_name,
      organization_plan: user.plan,
      created_at: user.created_at,
      last_login: user.last_login
    }));

    console.log(`✅ Devolviendo ${users.length} usuarios`);

    res.json({
      users,
      total: users.length,
      organization_id: Number(organizationId)
    });

  } catch (error) {
    console.error('💥 Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear un nuevo usuario en la organización
const createOrganizationUser = async (req, res) => {
  try {
    const currentUser = req.user;
    const { name, email, password, role } = req.body;

    console.log(`👤 ${currentUser.email} creando usuario: ${email}`);

    // Validar campos requeridos
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Validar roles válidos
    const validRoles = ['admin', 'manager', 'employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol inválido. Roles válidos: admin, manager, employee' });
    }

    let organizationId;
    
    // Super admin puede especificar organización, otros crean en la suya
    if (currentUser.role === 'super_admin' && req.body.organization_id) {
      organizationId = req.body.organization_id;
    } else {
      organizationId = currentUser.organization_id;
    }

    // Verificar si el email ya existe
    const existingUser = await mongoClient.execute({
      sql: 'SELECT id FROM usuarios WHERE email = ?',
      args: [email]
    });

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await mongoClient.execute({
      sql: `INSERT INTO usuarios (name, email, password_hash, role, organization_id, created_at) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [name, email, hashedPassword, role, organizationId, new Date().toISOString()]
    });

    const userId = Number(result.lastInsertRowid);

    // Obtener el usuario completo creado
    const newUserResult = await mongoClient.execute({
      sql: `SELECT u.id, u.name, u.email, u.role, u.organization_id, u.created_at,
             o.name as organization_name, o.plan
             FROM usuarios u 
             LEFT JOIN organizations o ON u.organization_id = o.id 
             WHERE u.id = ?`,
      args: [userId]
    });

    const newUser = newUserResult.rows[0];

    console.log(`✅ Usuario creado: ${name} (${email}) como ${role} en organización ${organizationId}`);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: Number(newUser.id),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organization_id: Number(newUser.organization_id),
        organization_name: newUser.organization_name,
        organization_plan: newUser.plan,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('💥 Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar un usuario de la organización
const updateOrganizationUser = async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = req.params.id;
    const { name, email, role, password } = req.body;

    console.log(`✏️ ${currentUser.email} actualizando usuario ID: ${userId}`);

    // Obtener el usuario a editar
    const userResult = await mongoClient.execute({
      sql: 'SELECT * FROM usuarios WHERE id = ?',
      args: [userId]
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userToEdit = userResult.rows[0];

    // Solo verificar que sea de la misma organización (no roles)
    if (currentUser.role !== 'super_admin' && userToEdit.organization_id !== currentUser.organization_id) {
      return res.status(403).json({ message: 'No puedes editar usuarios de otras organizaciones' });
    }

    // Preparar campos a actualizar
    const updates = [];
    const args = [];

    if (name) {
      updates.push('name = ?');
      args.push(name);
    }

    if (email) {
      // Verificar que el email no exista para otro usuario
      const emailCheck = await mongoClient.execute({
        sql: 'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        args: [email, userId]
      });

      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ message: 'Ya existe otro usuario con ese email' });
      }

      updates.push('email = ?');
      args.push(email);
    }

    if (role) {
      const validRoles = ['admin', 'manager', 'employee'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol inválido' });
      }

      updates.push('role = ?');
      args.push(role);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      args.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    // Agregar campo de actualización
    updates.push('updated_at = ?');
    args.push(new Date().toISOString());
    args.push(userId);

    // Ejecutar actualización
    await mongoClient.execute({
      sql: `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    // Obtener usuario actualizado
    const updatedUserResult = await mongoClient.execute({
      sql: `SELECT u.id, u.name, u.email, u.role, u.organization_id, u.created_at, u.updated_at,
             o.name as organization_name, o.plan
             FROM usuarios u 
             LEFT JOIN organizations o ON u.organization_id = o.id 
             WHERE u.id = ?`,
      args: [userId]
    });

    const updatedUser = updatedUserResult.rows[0];

    console.log(`✅ Usuario actualizado: ${updatedUser.name} (${updatedUser.email})`);

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: Number(updatedUser.id),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        organization_id: Number(updatedUser.organization_id),
        organization_name: updatedUser.organization_name,
        organization_plan: updatedUser.plan,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('💥 Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar un usuario de la organización
const deleteOrganizationUser = async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = req.params.id;

    console.log(`🗑️ ${currentUser.email} eliminando usuario ID: ${userId}`);

    // Obtener el usuario a eliminar
    const userResult = await mongoClient.execute({
      sql: 'SELECT * FROM usuarios WHERE id = ?',
      args: [userId]
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userToDelete = userResult.rows[0];

    // No permitir auto-eliminación
    if (userToDelete.id === currentUser.id) {
      return res.status(403).json({ message: 'No puedes eliminar tu propio usuario' });
    }

    // Solo verificar que sea de la misma organización (no roles)
    if (currentUser.role !== 'super_admin' && userToDelete.organization_id !== currentUser.organization_id) {
      return res.status(403).json({ message: 'No puedes eliminar usuarios de otras organizaciones' });
    }

    // Eliminar tokens de refresh del usuario
    await mongoClient.execute({
      sql: 'DELETE FROM refresh_tokens WHERE user_id = ?',
      args: [userId]
    });

    // Eliminar usuario
    await mongoClient.execute({
      sql: 'DELETE FROM usuarios WHERE id = ?',
      args: [userId]
    });

    console.log(`✅ Usuario eliminado: ${userToDelete.name} (${userToDelete.email})`);

    res.json({
      message: 'Usuario eliminado exitosamente',
      deletedUser: {
        id: Number(userToDelete.id),
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role
      }
    });

  } catch (error) {
    console.error('💥 Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * NIVEL 2: GESTIÓN GLOBAL (SUPER-ADMIN)
 * Super admin puede gestionar organizaciones y sus usuarios
 */

// Obtener todas las organizaciones (solo super-admin)
const getAllOrganizations = async (req, res) => {
  try {
    const currentUser = req.user;

    // Solo super_admin puede ver todas las organizaciones
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: 'Solo el super administrador puede ver todas las organizaciones' });
    }

    const result = await mongoClient.execute({
      sql: `SELECT o.id, o.name, o.plan, o.max_users, o.created_at,
             COUNT(u.id) as user_count,
             COUNT(CASE WHEN u.role = 'admin' THEN 1 END) as admin_count
             FROM organizations o
             LEFT JOIN usuarios u ON o.id = u.organization_id
             GROUP BY o.id, o.name, o.plan, o.max_users, o.created_at
             ORDER BY o.created_at DESC`
    });

    const organizations = result.rows.map(org => ({
      id: Number(org.id),
      name: org.name,
      plan: org.plan,
      max_users: Number(org.max_users),
      current_users: Number(org.user_count),
      admin_count: Number(org.admin_count),
      created_at: org.created_at,
      usage_percentage: Math.round((org.user_count / org.max_users) * 100)
    }));

    res.json({
      organizations,
      total: organizations.length,
      statistics: {
        total_organizations: organizations.length,
        basic_plans: organizations.filter(o => o.plan === 'basic').length,
        premium_plans: organizations.filter(o => o.plan === 'premium').length,
        total_users: organizations.reduce((sum, o) => sum + o.current_users, 0)
      }
    });

  } catch (error) {
    console.error('💥 Error al obtener organizaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear nueva organización (solo super-admin)
const createOrganization = async (req, res) => {
  try {
    const currentUser = req.user;
    const { name, plan, max_users, adminName, adminEmail, adminPassword } = req.body;

    // Solo super_admin puede crear organizaciones
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: 'Solo el super administrador puede crear organizaciones' });
    }

    // Validar campos requeridos
    if (!name || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: 'Nombre de organización, datos del admin y contraseña son requeridos' });
    }

    // Validar plan
    const validPlans = ['basic', 'premium'];
    const organizationPlan = plan || 'basic';
    if (!validPlans.includes(organizationPlan)) {
      return res.status(400).json({ message: 'Plan inválido. Planes válidos: basic, premium' });
    }

    // Verificar si la organización ya existe
    const existingOrg = await mongoClient.execute({
      sql: 'SELECT id FROM organizations WHERE name = ?',
      args: [name]
    });

    if (existingOrg.rows.length > 0) {
      return res.status(409).json({ message: 'Ya existe una organización con ese nombre' });
    }

    // Verificar si el email del admin ya existe
    const existingAdmin = await mongoClient.execute({
      sql: 'SELECT id FROM usuarios WHERE email = ?',
      args: [adminEmail]
    });

    if (existingAdmin.rows.length > 0) {
      return res.status(409).json({ message: 'Ya existe un usuario con ese email' });
    }

    // Determinar max_users basado en el plan
    let maxUsersForPlan;
    if (max_users) {
      maxUsersForPlan = max_users;
    } else {
      maxUsersForPlan = organizationPlan === 'basic' ? 10 : 100;
    }

    // Crear organización
    const orgResult = await mongoClient.execute({
      sql: 'INSERT INTO organizations (name, plan, max_users, created_at) VALUES (?, ?, ?, ?)',
      args: [name, organizationPlan, maxUsersForPlan, new Date().toISOString()]
    });

    const organizationId = Number(orgResult.lastInsertRowid);

    // Crear admin de la organización
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminResult = await mongoClient.execute({
      sql: `INSERT INTO usuarios (name, email, password_hash, role, organization_id, created_at) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [adminName, adminEmail, hashedPassword, 'admin', organizationId, new Date().toISOString()]
    });

    const adminId = Number(adminResult.lastInsertRowid);

    // Configurar features para la organización
    const features = organizationPlan === 'basic' ? 
      ['personal_management', 'department_management', 'position_management', 'process_management', 'document_management', 'basic_dashboard'] :
      ['personal_management', 'department_management', 'position_management', 'process_management', 'document_management', 'basic_dashboard', 'objectives_management', 'indicators_management', 'audit_management', 'findings_management', 'corrective_actions', 'advanced_dashboard', 'ai_assistant'];

    for (const feature of features) {
      await mongoClient.execute({
        sql: 'INSERT INTO organization_features (organization_id, feature_name, is_enabled) VALUES (?, ?, ?)',
        args: [organizationId, feature, true]
      });
    }

    console.log(`✅ Organización creada: ${name} con plan ${organizationPlan} y admin ${adminName}`);

    res.status(201).json({
      message: 'Organización creada exitosamente',
      organization: {
        id: organizationId,
        name,
        plan: organizationPlan,
        max_users: maxUsersForPlan,
        admin: {
          id: adminId,
          name: adminName,
          email: adminEmail,
          role: 'admin'
        }
      }
    });

  } catch (error) {
    console.error('💥 Error al crear organización:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar plan de organización (solo super-admin)
const updateOrganizationPlan = async (req, res) => {
  try {
    const currentUser = req.user;
    const organizationId = req.params.id;
    const { plan, max_users } = req.body;

    // Solo super_admin puede modificar planes
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({ message: 'Solo el super administrador puede modificar planes' });
    }

    // Validar plan
    const validPlans = ['basic', 'premium'];
    if (plan && !validPlans.includes(plan)) {
      return res.status(400).json({ message: 'Plan inválido. Planes válidos: basic, premium' });
    }

    // Obtener organización actual
    const orgResult = await mongoClient.execute({
      sql: 'SELECT * FROM organizations WHERE id = ?',
      args: [organizationId]
    });

    if (orgResult.rows.length === 0) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }

    const organization = orgResult.rows[0];

    // Preparar actualizaciones
    const updates = [];
    const args = [];

    if (plan) {
      updates.push('plan = ?');
      args.push(plan);
    }

    if (max_users) {
      updates.push('max_users = ?');
      args.push(max_users);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }

    updates.push('updated_at = ?');
    args.push(new Date().toISOString());
    args.push(organizationId);

    // Actualizar organización
    await mongoClient.execute({
      sql: `UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`,
      args
    });

    // Si cambió el plan, actualizar features
    if (plan && plan !== organization.plan) {
      // Eliminar features actuales
      await mongoClient.execute({
        sql: 'DELETE FROM organization_features WHERE organization_id = ?',
        args: [organizationId]
      });

      // Agregar nuevas features según el plan
      const features = plan === 'basic' ? 
        ['personal_management', 'department_management', 'position_management', 'process_management', 'document_management', 'basic_dashboard'] :
        ['personal_management', 'department_management', 'position_management', 'process_management', 'document_management', 'basic_dashboard', 'objectives_management', 'indicators_management', 'audit_management', 'findings_management', 'corrective_actions', 'advanced_dashboard', 'ai_assistant'];

      for (const feature of features) {
        await mongoClient.execute({
          sql: 'INSERT INTO organization_features (organization_id, feature_name, is_enabled) VALUES (?, ?, ?)',
          args: [organizationId, feature, true]
        });
      }
    }

    console.log(`✅ Plan actualizado para organización ${organization.name}: ${plan || 'sin cambio'}`);

    res.json({
      message: 'Plan de organización actualizado exitosamente',
      organization: {
        id: Number(organizationId),
        name: organization.name,
        old_plan: organization.plan,
        new_plan: plan || organization.plan,
        old_max_users: organization.max_users,
        new_max_users: max_users || organization.max_users
      }
    });

  } catch (error) {
    console.error('💥 Error al actualizar plan:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  // Nivel 1: Gestión de usuarios por organización
  getOrganizationUsers,
  createOrganizationUser,
  updateOrganizationUser,
  deleteOrganizationUser,
  
  // Nivel 2: Gestión global (super-admin)
  getAllOrganizations,
  createOrganization,
  updateOrganizationPlan
};