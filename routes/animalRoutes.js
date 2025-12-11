// ============================================
// routes/animalRoutes.js
// ============================================
const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animalController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

/**
 * RUTAS PÚBLICAS
 */

// GET /api/animales - Obtener todos los animales (con filtros)
router.get('/', animalController.getAll);

// GET /api/animales/stats - Estadísticas generales
router.get('/stats', animalController.getStats);

// GET /api/animales/:id - Obtener animal por ID
router.get('/:id', animalController.getById);

/**
 * RUTAS PROTEGIDAS - SOLO ADMIN
 */

// POST /api/animales - Crear nuevo animal
router.post('/', 
  verifyToken, 
  isAdmin, 
  uploadSingle, 
  handleUploadError,
  animalController.create
);

// PUT /api/animales/:id - Actualizar animal
router.put('/:id', 
  verifyToken, 
  isAdmin, 
  uploadSingle, 
  handleUploadError,
  animalController.update
);

// DELETE /api/animales/:id - Eliminar animal (soft delete)
router.delete('/:id', 
  verifyToken, 
  isAdmin, 
  animalController.deleteAnimal
);

// PATCH /api/animales/:id/status - Cambiar estado
router.patch('/:id/status', 
  verifyToken, 
  isAdmin, 
  animalController.changeStatus
);

// POST /api/animales/:id/fotos - Agregar foto
router.post('/:id/fotos', 
  verifyToken, 
  isAdmin, 
  uploadSingle, 
  handleUploadError,
  animalController.addPhoto
);

// DELETE /api/animales/fotos/:id_foto - Eliminar foto
router.delete('/fotos/:id_foto', 
  verifyToken, 
  isAdmin, 
  animalController.deletePhoto
);

module.exports = router;