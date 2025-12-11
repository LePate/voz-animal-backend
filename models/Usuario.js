const { query } = require('../config/database');

class Usuario {
  /**
   * Buscar usuario por email
   */
  static async findByEmail(email) {
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND estado = "activo"';
    const results = await query(sql, [email]);
    return results[0];
  }

  /**
   * Buscar usuario por ID
   */
  static async findById(id) {
    const sql = 'SELECT id_usuario, nombre_completo, email, telefono, direccion, rol, fecha_registro, estado FROM usuarios WHERE id_usuario = ?';
    const results = await query(sql, [id]);
    return results[0];
  }

  /**
   * Crear nuevo usuario
   */
  static async create(userData) {
    const sql = `
      INSERT INTO usuarios (nombre_completo, email, password, telefono, direccion, rol)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      userData.nombre_completo,
      userData.email,
      userData.password,
      userData.telefono || null,
      userData.direccion || null,
      userData.rol || 'usuario'
    ];
    
    const result = await query(sql, params);
    return result.insertId;
  }

  /**
   * Actualizar usuario
   */
  static async update(id, userData) {
    const sql = `
      UPDATE usuarios 
      SET nombre_completo = ?, telefono = ?, direccion = ?
      WHERE id_usuario = ?
    `;
    const params = [
      userData.nombre_completo,
      userData.telefono,
      userData.direccion,
      id
    ];
    
    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  /**
   * Actualizar contraseña
   */
  static async updatePassword(id, newPassword) {
    const sql = 'UPDATE usuarios SET password = ? WHERE id_usuario = ?';
    const result = await query(sql, [newPassword, id]);
    return result.affectedRows > 0;
  }

  /**
   * Obtener todos los usuarios (solo admin)
   */
  static async getAll() {
    const sql = `
      SELECT id_usuario, nombre_completo, email, telefono, direccion, rol, fecha_registro, estado
      FROM usuarios
      ORDER BY fecha_registro DESC
    `;
    return await query(sql);
  }

  /**
   * Cambiar estado del usuario (activar/desactivar)
   */
  static async changeStatus(id, estado) {
    const sql = 'UPDATE usuarios SET estado = ? WHERE id_usuario = ?';
    const result = await query(sql, [estado, id]);
    return result.affectedRows > 0;
  }

  /**
   * Eliminar usuario (soft delete)
   */
  static async delete(id) {
    return await this.changeStatus(id, 'inactivo');
  }

  /**
   * Verificar si el email ya existe
   */
  static async emailExists(email, excludeId = null) {
    let sql = 'SELECT id_usuario FROM usuarios WHERE email = ?';
    const params = [email];
    
    if (excludeId) {
      sql += ' AND id_usuario != ?';
      params.push(excludeId);
    }
    
    const results = await query(sql, params);
    return results.length > 0;
  }

  /**
   * Obtener estadísticas del usuario
   */
  static async getUserStats(userId) {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM solicitudes_adopcion WHERE id_usuario = ?) as total_solicitudes,
        (SELECT COUNT(*) FROM solicitudes_adopcion WHERE id_usuario = ? AND estado = 'aprobada') as solicitudes_aprobadas,
        (SELECT COUNT(*) FROM adopciones WHERE id_usuario = ?) as total_adopciones,
        (SELECT COUNT(*) FROM donaciones WHERE id_usuario = ?) as total_donaciones,
        (SELECT IFNULL(SUM(monto), 0) FROM donaciones WHERE id_usuario = ?) as total_donado
    `;
    const results = await query(sql, [userId, userId, userId, userId, userId]);
    return results[0];
  }
}

module.exports = Usuario;