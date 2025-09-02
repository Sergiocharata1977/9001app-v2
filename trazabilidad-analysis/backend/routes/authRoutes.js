const express = require('express');
const { register, login, refreshToken, logout, verifyToken } = require('../controllers/authController.js');
const authenticateToken = require('../middleware/authMiddleware.js');
const { auditLogin, auditLogout, auditRegister } = require('../middleware/auditMiddleware.js');

const router = express.Router();

// @route   POST api/auth/register
// @desc    Registrar usuario
// @access  Public
router.post('/register', auditRegister, register);

// @route   POST api/auth/login
// @desc    Iniciar sesión y obtener tokens
// @access  Public
router.post('/login', login);

// @route   POST api/auth/refresh
// @desc    Renovar access token usando refresh token
// @access  Public
router.post('/refresh', refreshToken);

// @route   POST api/auth/logout
// @desc    Cerrar sesión
// @access  Private
router.post('/logout', authenticateToken, auditLogout, logout);

// @route   GET api/auth/verify
// @desc    Verificar si el token es válido
// @access  Private
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;
