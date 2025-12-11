const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT
 * Se ejecuta antes de cualquier ruta protegida
 */
const verifyToken = (req, res, next) => {
  // Obtener token del header
  const token = req.headers['authorization']?.split(' ')[1]; // "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No se proporcionó un token de autenticación'
    });
  }
  
  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor inicia sesión nuevamente'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * Middleware para verificar que el usuario sea administrador
 */
const isAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }
  next();
};

/**
 * Middleware para verificar que el usuario sea dueño del recurso o admin
 */
const isOwnerOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.id);
  
  if (req.user.rol === 'admin' || req.user.id === userId) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para acceder a este recurso'
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isOwnerOrAdmin
};