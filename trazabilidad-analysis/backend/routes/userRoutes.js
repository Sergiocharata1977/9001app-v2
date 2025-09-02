const express = require('express');
const {
  // Nivel 1: Gestión de usuarios por organización
  getOrganizationUsers,
  createOrganizationUser,
  updateOrganizationUser,
  deleteOrganizationUser,
  

} = require('../controllers/userController.js');
const { auditCreateUser, auditUpdateUser, auditDeleteUser } = require('../middleware/auditMiddleware.js');

const router = express.Router();

// NOTA: El middleware básico de autenticación se aplica en index.js
// Aquí no necesitamos middleware adicional por ahora

console.log('📋 Configurando rutas de usuarios BÁSICAS (sin restricciones de roles)');

// ===============================================
// NIVEL 1: GESTIÓN DE USUARIOS POR ORGANIZACIÓN
// ===============================================

// @route   GET /api/users
// @desc    Obtener todos los usuarios de la organización actual
// @access  Private (Todos los usuarios autenticados)
router.get('/', getOrganizationUsers);

// @route   POST /api/users
// @desc    Crear un nuevo usuario en la organización
// @access  Private (Todos los usuarios autenticados)
router.post('/', 
  auditCreateUser,
  createOrganizationUser
);

// @route   PUT /api/users/:id
// @desc    Actualizar un usuario de la organización
// @access  Private (Todos los usuarios autenticados)
router.put('/:id', 
  auditUpdateUser,
  updateOrganizationUser
);

// @route   DELETE /api/users/:id
// @desc    Eliminar un usuario de la organización
// @access  Private (Todos los usuarios autenticados)
router.delete('/:id', 
  auditDeleteUser,
  deleteOrganizationUser
);

// @route   GET /api/users/profile
// @desc    Obtener perfil del usuario actual
// @access  Private (Todos los usuarios autenticados)
router.get('/profile', (req, res) => {
  // El middleware de autenticación ya agregó el usuario al req
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        organization_id: req.user.organization_id,
        organization_name: req.user.organization_name,
        organization_plan: req.user.organization_plan
      }
    }
  });
});



module.exports = router;
