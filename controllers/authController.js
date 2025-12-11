const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * REGISTRO DE NUEVO USUARIO
 */
const register = async (req, res) => {
  try {
    const { nombre_completo, email, password, telefono, direccion } = req.body;
    
    // Validar campos requeridos
    if (!nombre_completo || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre completo, email y contraseña son obligatorios'
      });
    }
    
    // Verificar si el email ya existe
    const emailExists = await Usuario.emailExists(email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const userId = await Usuario.create({
      nombre_completo,
      email,
      password: hashedPassword,
      telefono,
      direccion,
      rol: 'usuario' // Por defecto todos son usuarios
    });
    
    // Obtener usuario creado
    const user = await Usuario.findById(userId);
    
    // Generar token
    const token = jwt.sign(
      { 
        id: user.id_usuario, 
        email: user.email, 
        rol: user.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombre_completo,
          email: user.email,
          rol: user.rol
        }
      }
    });
    
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario'
    });
  }
};

/**
 * LOGIN / INICIO DE SESIÓN
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son obligatorios'
      });
    }
    
    // Buscar usuario por email
    const user = await Usuario.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Generar token
    const token = jwt.sign(
      { 
        id: user.id_usuario, 
        email: user.email, 
        rol: user.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombre_completo,
          email: user.email,
          telefono: user.telefono,
          rol: user.rol
        }
      }
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión'
    });
  }
};

/**
 * OBTENER PERFIL DEL USUARIO AUTENTICADO
 */
const getProfile = async (req, res) => {
  try {
    const user = await Usuario.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Obtener estadísticas del usuario
    const stats = await Usuario.getUserStats(req.user.id);
    
    res.json({
      success: true,
      data: {
        user,
        stats
      }
    });
    
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
};

/**
 * ACTUALIZAR PERFIL
 */
const updateProfile = async (req, res) => {
  try {
    const { nombre_completo, telefono, direccion } = req.body;
    
    const updated = await Usuario.update(req.user.id, {
      nombre_completo,
      telefono,
      direccion
    });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'No se pudo actualizar el perfil'
      });
    }
    
    const user = await Usuario.findById(req.user.id);
    
    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: { user }
    });
    
  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
};

/**
 * CAMBIAR CONTRASEÑA
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva son obligatorias'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }
    
    // Obtener usuario con contraseña
    const user = await Usuario.findByEmail(req.user.email);
    
    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }
    
    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña
    await Usuario.updatePassword(req.user.id, hashedPassword);
    
    res.json({
      success: true,
      message: 'Contraseña cambiada exitosamente'
    });
    
  } catch (error) {
    console.error('Error en changePassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};