const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

/**
 * RUTAS PÚBLICAS (no requieren autenticación)
 */

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', authController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', authController.login);

/**
 * RUTAS PROTEGIDAS (requieren autenticación)
 */

// GET /api/auth/profile - Obtener perfil del usuario autenticado
router.get('/profile', verifyToken, authController.getProfile);

// PUT /api/auth/profile - Actualizar perfil
router.put('/profile', verifyToken, authController.updateProfile);

// PUT /api/auth/change-password - Cambiar contraseña
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;