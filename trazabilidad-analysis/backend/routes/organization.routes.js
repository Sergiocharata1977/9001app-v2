const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  getOrganization,
  verifyTenant,
  getAllOrganizations
} = require('../controllers/organizationController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de organizaciones
router.get('/verify-tenant', verifyTenant);
router.get('/', getAllOrganizations);
router.get('/:id', getOrganization);

module.exports = router;
