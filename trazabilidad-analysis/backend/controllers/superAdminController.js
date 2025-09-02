"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeUserRole = exports.getOrganizationUsers = exports.deleteOrganization = exports.updateOrganization = exports.createOrganization = exports.getAllOrganizations = exports.getDashboardStats = void 0;
const mongodb_1 = require("mongodb");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
/**
 * Obtener estadísticas del dashboard de super admin
 */
const getDashboardStats = async (req, res) => {
    const client = new mongodb_1.MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
        // Colecciones
        const organizationsCollection = db.collection('organizations');
        const usersCollection = db.collection('users');
        const personalCollection = db.collection('personal');
        const departamentosCollection = db.collection('departamentos');
        const puestosCollection = db.collection('puestos');
        const documentosCollection = db.collection('documentos');
        // Estadísticas generales
        const totalOrganizations = await organizationsCollection.countDocuments({});
        const activeOrganizations = await organizationsCollection.countDocuments({ is_active: true });
        const totalUsers = await usersCollection.countDocuments({});
        const activeUsers = await usersCollection.countDocuments({ is_active: true });
        const totalPersonal = await personalCollection.countDocuments({});
        const totalDepartamentos = await departamentosCollection.countDocuments({});
        const totalPuestos = await puestosCollection.countDocuments({});
        const totalDocumentos = await documentosCollection.countDocuments({});
        // Organizaciones por plan
        const organizationsByPlan = await organizationsCollection.aggregate([
            { $group: { _id: '$plan', count: { $sum: 1 } } }
        ]).toArray();
        const planStats = {};
        organizationsByPlan.forEach((item) => {
            planStats[item._id || 'basic'] = item.count;
        });
        // Actividad reciente (últimas 10 acciones)
        const recentUsers = await usersCollection
            .find({})
            .sort({ created_at: -1 })
            .limit(5)
            .toArray();
        const recentOrgs = await organizationsCollection
            .find({})
            .sort({ created_at: -1 })
            .limit(5)
            .toArray();
        const recentActivity = [
            ...recentUsers.map(u => ({
                type: 'user_created',
                description: `Nuevo usuario: ${u.name} (${u.email})`,
                timestamp: u.created_at || new Date(),
                organizationId: u.organization_id
            })),
            ...recentOrgs.map(o => ({
                type: 'org_created',
                description: `Nueva organización: ${o.name}`,
                timestamp: o.created_at || new Date(),
                organizationId: o._id.toString()
            }))
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
        const stats = {
            totalOrganizations,
            activeOrganizations,
            totalUsers,
            activeUsers,
            totalPersonal,
            totalDepartamentos,
            totalPuestos,
            totalDocumentos,
            organizationsByPlan: planStats,
            recentActivity
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error obteniendo estadísticas del dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
    finally {
        await client.close();
    }
};
exports.getDashboardStats = getDashboardStats;
/**
 * Obtener todas las organizaciones con estadísticas
 */
const getAllOrganizations = async (req, res) => {
    const client = new mongodb_1.MongoClient(process.env.MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
        const organizationsCollection = db.collection('organizations');
        const usersCollection = db.collection('users');
        const personalCollection = db.collection('personal');
        const departamentosCollection = db.collection('departamentos');
        const puestosCollection = db.collection('puestos');
        const documentosCollection = db.collection('documentos');
        const procesosCollection = db.collection('procesos');
        // Obtener todas las organizaciones
        const organizations = await organizationsCollection.find({}).toArray();
        // Agregar estadísticas a cada organización
        const organizationsWithStats = await Promise.all(organizations.map(async (org) => {
            const orgId = org.id || org._id.toString();
            const stats = {
                usersCount: await usersCollection.countDocuments({ organization_id: orgId }),
                personalCount: await personalCollection.countDocuments({ organization_id: orgId }),
                departamentosCount: await departamentosCollection.countDocuments({ organization_id: orgId }),
                puestosCount: await puestosCollection.countDocuments({ organization_id: orgId }),
                documentosCount: await documentosCollection.countDocuments({ organization_id: orgId }),
                procesosCount: await procesosCollection.countDocuments({ organization_id: orgId })
            };
            return {
                _id: org._id,
                id: orgId,
                name: org.name,
                plan: org.plan || 'basic',
                is_active: org.is_active !== false,
                created_at: org.created_at,
                updated_at: org.updated_at,
                stats
            };
        }));
        res.json({
            success: true,
            data: organizationsWithStats
        });
    }
    catch (error) {
        console.error('Error obteniendo organizaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
    finally {
        await client.close();
    }
};
exports.getAllOrganizations = getAllOrganizations;
/**
 * Crear una nueva organización
 */
const createOrganization = async (req, res) => {
    const client = new mongodb_1.MongoClient(process.env.MONGODB_URI);
    try {
        const { name, plan = 'basic', adminEmail, adminName, adminPassword } = req.body;
        // Validaciones
        if (!name || !adminEmail || !adminName || !adminPassword) {
            res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
            return;
        }
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
        const organizationsCollection = db.collection('organizations');
        const usersCollection = db.collection('users');
        // Verificar si ya existe una organización con ese nombre
        const existingOrg = await organizationsCollection.findOne({ name });
        if (existingOrg) {
            res.status(400).json({
                success: false,
                message: 'Ya existe una organización con ese nombre'
            });
            return;
        }
        // Verificar si el email del admin ya existe
        const existingUser = await usersCollection.findOne({ email: adminEmail });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con ese email'
            });
            return;
        }
        // Crear la organización
        const orgId = new mongodb_1.ObjectId().toString();
        const newOrganization = {
            _id: new mongodb_1.ObjectId(),
            id: orgId,
            name,
            plan,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
            settings: {
                max_users: plan === 'enterprise' ? 1000 : plan === 'professional' ? 100 : 10,
                features: getFeaturesByPlan(plan)
            }
        };
        await organizationsCollection.insertOne(newOrganization);
        // Crear el usuario administrador
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 10);
        const newAdmin = {
            _id: new mongodb_1.ObjectId(),
            name: adminName,
            email: adminEmail,
            password_hash: hashedPassword,
            role: 'admin',
            organization_id: orgId,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        };
        await usersCollection.insertOne(newAdmin);
        res.status(201).json({
            success: true,
            message: 'Organización creada exitosamente',
            data: {
                organization: newOrganization,
                admin: {
                    id: newAdmin._id,
                    name: newAdmin.name,
                    email: newAdmin.email,
                    role: newAdmin.role
                }
            }
        });
    }
    catch (error) {
        console.error('Error creando organización:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
    finally {
        await client.close();
    }
};
exports.createOrganization = createOrganization;
/**
 * Actualizar una organización
 */
const updateOrganization = async (req, res) => {
    const client = new mongodb_1.MongoClient(process.env.MONGODB_URI);
    try {
        const { id } = req.params;
        const { name, plan, is_active } = req.body;
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
        const organizationsCollection = db.collection('organizations');
        // Construir objeto de actualización
        const updateData = { updated_at: new Date() };
        if (name !== undefined)
            updateData.name = name;
        if (plan !== undefined) {
            updateData.plan = plan;
            updateData['settings.max_users'] = plan === 'enterprise' ? 1000 : plan === 'professional' ? 100 : 10;
            updateData['settings.features'] = getFeaturesByPlan(plan);
        }
        if (is_active !== undefined)
            updateData.is_active = is_active;
        const result = await organizationsCollection.updateOne({ id: id }, { $set: updateData });
        if (result.matchedCount === 0) {
            res.status(404).json({
                success: false,
                message: 'Organización no encontrada'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Organización actualizada exitosamente'
        });
    }
    catch (error) {
        console.error('Error actualizando organización:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
    finally {
        await client.close();
    }
};
exports.updateOrganization = updateOrganization;
/**
 * Eliminar una organización (soft delete)
 */
const deleteOrganization = async (req, res) => {
    const client = new mongodb_1.MongoClient(process.env.MONGODB_URI);
    try {
        const { id } = req.params;
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
        const organizationsCollection = db.collection('organizations');
        const usersCollection = db.collection('users');
        // Desactivar la organización (soft delete)
        const result = await organizationsCollection.updateOne({ id: id }, {
            $set: {
                is_active: false,
                deleted_at: new Date(),
                updated_at: new Date()
            }
        });
        if (result.matchedCount === 0) {
            res.status(404).json({
                success: false,
                message: 'Organización no encontrada'
            });
            return;
        }
        // Desactivar todos los usuarios de la organización
        await usersCollection.updateMany({ organization_id: id }, {
            $set: {
                is_active: false,
                updated_at: new Date()
            }
        });
        res.json({
            success: true,
            message: 'Organización eliminada exitosamente'
        });
    }
    catch (error) {
        console.error('Error eliminando organización:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
    finally {
        await client.close();
    }
};
exports.deleteOrganization = deleteOrganization;
/**
 * Obtener usuarios de una organización específica
 */
const getOrganizationUsers = async (req, res) => {
    const client = new mongodb_1.MongoClient(process.env.MONGODB_URI);
    try {
        const { id } = req.params;
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
        const usersCollection = db.collection('users');
        const users = await usersCollection.find({ organization_id: id }, { projection: { password_hash: 0 } }).toArray();
        res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Error obteniendo usuarios de la organización:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
    finally {
        await client.close();
    }
};
exports.getOrganizationUsers = getOrganizationUsers;
/**
 * Cambiar rol de un usuario
 */
const changeUserRole = async (req, res) => {
    const client = new mongodb_1.MongoClient(process.env.MONGODB_URI);
    try {
        const { userId } = req.params;
        const { role } = req.body;
        // Validar rol
        const validRoles = ['admin', 'manager', 'employee', 'user'];
        if (!validRoles.includes(role)) {
            res.status(400).json({
                success: false,
                message: 'Rol inválido'
            });
            return;
        }
        await client.connect();
        const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
        const usersCollection = db.collection('users');
        const result = await usersCollection.updateOne({ _id: new mongodb_1.ObjectId(userId) }, {
            $set: {
                role,
                updated_at: new Date()
            }
        });
        if (result.matchedCount === 0) {
            res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Rol actualizado exitosamente'
        });
    }
    catch (error) {
        console.error('Error cambiando rol del usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
    finally {
        await client.close();
    }
<<<<<<< Current (Your changes)

    const countResult = await mongoClient.execute({ sql: countSql, args: countArgs });
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
=======
};
exports.changeUserRole = changeUserRole;
/**
 * Helper: Obtener features por plan
 */
function getFeaturesByPlan(plan) {
    const features = {
        basic: ['documentos', 'procesos', 'personal'],
        professional: ['documentos', 'procesos', 'personal', 'auditorias', 'indicadores', 'capacitaciones'],
        enterprise: ['documentos', 'procesos', 'personal', 'auditorias', 'indicadores', 'capacitaciones', 'crm', 'analytics', 'api']
    };
    return features[plan] || features.basic;
}
>>>>>>> Incoming (Background Agent changes)
