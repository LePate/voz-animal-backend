const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const animalRoutes = require('./routes/animalRoutes');
const solicitudRoutes = require('./routes/solicitudRoutes');
const adopcionRoutes = require('./routes/adopcionRoutes');
const donacionRoutes = require('./routes/donacionRoutes');
const contactoRoutes = require('./routes/contactoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// CORS - Permitir peticiones desde el frontend
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parser - Procesar JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging de peticiones en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// RUTAS DE LA API
// ============================================

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: '🐾 API Voz Animal - Sistema de Adopciones',
    version: '1.0.0',
    status: 'activo'
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/solicitudes', solicitudRoutes);
app.use('/api/adopciones', adopcionRoutes);
app.use('/api/donaciones', donacionRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/usuarios', usuarioRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      console.error('💡 Asegúrate de que MySQL esté corriendo');
      process.exit(1);
    }
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 SERVIDOR INICIADO CORRECTAMENTE');
      console.log('='.repeat(50));
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
      console.log(`📂 Frontend: ${process.env.FRONTEND_URL}`);
      console.log('='.repeat(50) + '\n');
      console.log('💡 Presiona Ctrl+C para detener el servidor\n');
    });
    
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor...');
  process.exit(0);
});

module.exports = app;