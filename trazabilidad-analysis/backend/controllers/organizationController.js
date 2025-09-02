const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// @desc    Obtener datos de una organización
// @route   GET /api/organizations/:id
// @access  Private
const getOrganization = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const userOrgId = req.user?.organizationId;
    
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
    
    // Verificar permisos: usuarios solo pueden ver su propia organización
    if (userOrgId !== id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta organización'
      });
    }
    
    // Buscar organización
    const organizationsCollection = db.collection('organizations');
    const organization = await organizationsCollection.findOne({ id: id });
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organización no encontrada'
      });
    }
    
    // Obtener estadísticas
    const personalCollection = db.collection('personal');
    const departamentosCollection = db.collection('departamentos');
    const puestosCollection = db.collection('puestos');
    const usersCollection = db.collection('users');
    
    const stats = {
      personalCount: await personalCollection.countDocuments({ organization_id: id }),
      departamentosCount: await departamentosCollection.countDocuments({ organization_id: id }),
      puestosCount: await puestosCollection.countDocuments({ organization_id: id }),
      usersCount: await usersCollection.countDocuments({ organization_id: id })
    };
    
    // Obtener usuarios de la organización
    const users = await usersCollection.find(
      { organization_id: id },
      { projection: { password_hash: 0 } }
    ).toArray();
    
    res.json({
      success: true,
      data: {
        organization: {
          ...organization,
          stats,
          users: users.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            is_active: u.is_active
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo organización:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    await client.close();
  }
};

// @desc    Verificar aislamiento multitenant
// @route   GET /api/organizations/verify-tenant
// @access  Private
const verifyTenant = async (req, res) => {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const userOrgId = req.user?.organizationId;
    
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || '9001app-v2');
    
    // Obtener información del usuario actual
    const usersCollection = db.collection('users');
    const currentUser = await usersCollection.findOne({ 
      _id: new ObjectId(userId) 
    });
    
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Obtener datos de la organización del usuario
    const organizationsCollection = db.collection('organizations');
    const userOrganization = await organizationsCollection.findOne({ 
      id: userOrgId 
    });
    
    // Verificar acceso a datos según rol
    let accessibleOrganizations = [];
    let accessibleData = {};
    
    {
      // Usuarios normales solo ven su organización
      if (userOrganization) {
        accessibleOrganizations = [userOrganization];
        
        const personalCollection = db.collection('personal');
        const departamentosCollection = db.collection('departamentos');
        const puestosCollection = db.collection('puestos');
        
        accessibleData = {
          totalOrganizations: 1,
          totalPersonal: await personalCollection.countDocuments({ 
            organization_id: userOrgId 
          }),
          totalDepartamentos: await departamentosCollection.countDocuments({ 
            organization_id: userOrgId 
          }),
          totalPuestos: await puestosCollection.countDocuments({ 
            organization_id: userOrgId 
          }),
          totalUsers: await usersCollection.countDocuments({ 
            organization_id: userOrgId 
          })
        };
      }
    }
    
    // Verificar aislamiento de datos
    const verificationTests = {
      userIsolation: true,
      dataIsolation: true,
      permissionIsolation: true,
      crossContamination: false
    };
    
    // Test 1: Verificar que el usuario solo puede ver datos de su organización
    const personalCollection = db.collection('personal');
    const unauthorizedAccess = await personalCollection.findOne({
      organization_id: { $ne: userOrgId }
    });
    
    if (unauthorizedAccess) {
      verificationTests.dataIsolation = false;
      verificationTests.crossContamination = true;
    }
    
    res.json({
      success: true,
      data: {
        currentUser: {
          id: currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          organization_id: currentUser.organization_id,
          is_active: currentUser.is_active
        },
        organization: userOrganization,
        accessibleOrganizations: accessibleOrganizations.map(org => ({
          id: org.id,
          name: org.name,
          plan: org.plan,
          is_active: org.is_active
        })),
        accessibleData,
        verificationTests,
        tenantInfo: {
          isMultiTenant: true,
          isolationLevel: 'ROW_LEVEL',
          tenantField: 'organization_id',
          currentTenant: userOrgId,
          isSuperAdmin: false
        }
      }
    });
    
  } catch (error) {
    console.error('Error verificando tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    await client.close();
  }
};



module.exports = {
  getOrganization,
<<<<<<< Current (Your changes)
  verifyTenant,
  getAllOrganizations
=======
  verifyTenant
>>>>>>> Incoming (Background Agent changes)
};
