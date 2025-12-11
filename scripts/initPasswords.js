const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
require('dotenv').config();

/**
 * Script para inicializar las contraseñas de los usuarios de prueba
 */
const initPasswords = async () => {
  try {
    console.log('🔐 Inicializando contraseñas...\n');
    
    // Encriptar contraseñas
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    
    // Actualizar contraseña del admin
    await query(
      'UPDATE usuarios SET password = ? WHERE email = ?',
      [adminPassword, 'admin@vozanimal.com']
    );
    console.log('✅ Contraseña del admin actualizada');
    console.log('   Email: admin@vozanimal.com');
    console.log('   Password: admin123\n');
    
    // Actualizar contraseña del usuario
    await query(
      'UPDATE usuarios SET password = ? WHERE email = ?',
      [userPassword, 'juan@gmail.com']
    );
    console.log('✅ Contraseña del usuario actualizada');
    console.log('   Email: juan@gmail.com');
    console.log('   Password: user123\n');
    
    console.log('🎉 ¡Contraseñas inicializadas correctamente!');
    console.log('\n💡 Ahora puedes hacer login con estas credenciales.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar contraseñas:', error);
    process.exit(1);
  }
};

// Ejecutar
initPasswords();