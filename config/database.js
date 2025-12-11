const mysql = require('mysql2');
require('dotenv').config();

// Crear pool de conexiones usando DATABASE_URL o variables individuales
const pool = mysql.createPool(
  process.env.DATABASE_URL || {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  }
);

// Convertir a promesas para usar async/await
const promisePool = pool.promise();

// Función para verificar la conexión
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Conexión exitosa a MySQL');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error.message);
    console.error('💡 Verifica tus credenciales');
    return false;
  }
};

// Función auxiliar para ejecutar queries
const query = async (sql, params) => {
  try {
    const [results] = await promisePool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
};

module.exports = {
  pool: promisePool,
  testConnection,
  query
};