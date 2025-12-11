const Animal = require('../models/Animal');
const path = require('path');
const fs = require('fs');

/**
 * OBTENER TODOS LOS ANIMALES (con filtros)
 */
const getAll = async (req, res) => {
  try {
    const filters = {
      tipo: req.query.tipo,
      estado: req.query.estado,
      sexo: req.query.sexo,
      tamanio: req.query.tamanio,
      search: req.query.search
    };
    
    const animales = await Animal.getAll(filters);
    
    res.json({
      success: true,
      data: animales,
      total: animales.length
    });
  } catch (error) {
    console.error('Error en getAll:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener animales'
    });
  }
};

/**
 * OBTENER ANIMAL POR ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const animal = await Animal.findById(id);
    
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      });
    }
    
    // Obtener animales similares
    const similares = await Animal.findSimilar(id);
    
    res.json({
      success: true,
      data: {
        animal,
        similares
      }
    });
  } catch (error) {
    console.error('Error en getById:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener animal'
    });
  }
};

/**
 * CREAR NUEVO ANIMAL (Solo Admin)
 */
const create = async (req, res) => {
  try {
    const animalData = req.body;
    
    // Validaciones básicas
    if (!animalData.nombre || !animalData.tipo || !animalData.sexo || !animalData.tamanio) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, tipo, sexo y tamaño son obligatorios'
      });
    }
    
    // Si se subió una imagen, guardar la ruta
    if (req.file) {
      animalData.foto_principal = `/uploads/animales/${req.file.filename}`;
    }
    
    const animalId = await Animal.create(animalData);
    const animal = await Animal.findById(animalId);
    
    res.status(201).json({
      success: true,
      message: 'Animal creado exitosamente',
      data: animal
    });
  } catch (error) {
    console.error('Error en create:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear animal'
    });
  }
};

/**
 * ACTUALIZAR ANIMAL (Solo Admin)
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const animalData = req.body;
    
    // Verificar que el animal existe
    const animalExistente = await Animal.findById(id);
    if (!animalExistente) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      });
    }
    
    // Si se subió una nueva imagen
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (animalExistente.foto_principal) {
        const oldImagePath = path.join(__dirname, '..', animalExistente.foto_principal);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      animalData.foto_principal = `/uploads/animales/${req.file.filename}`;
    } else {
      // Mantener la foto anterior
      animalData.foto_principal = animalExistente.foto_principal;
    }
    
    const updated = await Animal.update(id, animalData);
    
    if (!updated) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el animal'
      });
    }
    
    const animal = await Animal.findById(id);
    
    res.json({
      success: true,
      message: 'Animal actualizado exitosamente',
      data: animal
    });
  } catch (error) {
    console.error('Error en update:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar animal'
    });
  }
};

/**
 * ELIMINAR ANIMAL (Soft Delete - Solo Admin)
 */
const deleteAnimal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const animal = await Animal.findById(id);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      });
    }
    
    const deleted = await Animal.delete(id);
    
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo eliminar el animal'
      });
    }
    
    res.json({
      success: true,
      message: 'Animal eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error en deleteAnimal:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar animal'
    });
  }
};

/**
 * CAMBIAR ESTADO DEL ANIMAL (Solo Admin)
 */
const changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const estadosValidos = ['disponible', 'adoptado', 'reservado', 'no_disponible'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }
    
    const updated = await Animal.changeStatus(id, estado);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Animal no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Estado actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error en changeStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado'
    });
  }
};

/**
 * AGREGAR FOTO A UN ANIMAL (Solo Admin)
 */
const addPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }
    
    const photoData = {
      ruta_foto: `/uploads/animales/${req.file.filename}`,
      descripcion: req.body.descripcion,
      orden: req.body.orden || 0
    };
    
    const photoId = await Animal.addPhoto(id, photoData);
    
    res.status(201).json({
      success: true,
      message: 'Foto agregada exitosamente',
      data: {
        id_foto: photoId,
        ...photoData
      }
    });
  } catch (error) {
    console.error('Error en addPhoto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar foto'
    });
  }
};

/**
 * ELIMINAR FOTO (Solo Admin)
 */
const deletePhoto = async (req, res) => {
  try {
    const { id_foto } = req.params;
    
    // Obtener la ruta de la foto antes de eliminar
    const sql = 'SELECT ruta_foto FROM fotos_animales WHERE id_foto = ?';
    const { query } = require('../config/database');
    const results = await query(sql, [id_foto]);
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Foto no encontrada'
      });
    }
    
    const ruta_foto = results[0].ruta_foto;
    
    // Eliminar de la base de datos
    const deleted = await Animal.deletePhoto(id_foto);
    
    if (deleted) {
      // Eliminar archivo físico
      const imagePath = path.join(__dirname, '..', ruta_foto);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.json({
      success: true,
      message: 'Foto eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error en deletePhoto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar foto'
    });
  }
};

/**
 * OBTENER ESTADÍSTICAS
 */
const getStats = async (req, res) => {
  try {
    const stats = await Animal.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error en getStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteAnimal,
  changeStatus,
  addPhoto,
  deletePhoto,
  getStats
};