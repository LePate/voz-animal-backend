const { query } = require('../config/database');

class Animal {
    /**
     * Obtener todos los animales con filtros opcionales
     */
    static async getAll(filters = {}) {
        let sql = `
      SELECT 
        a.*,
        COUNT(DISTINCT fa.id_foto) as total_fotos,
        COUNT(DISTINCT s.id_solicitud) as total_solicitudes
      FROM animales a
      LEFT JOIN fotos_animales fa ON a.id_animal = fa.id_animal
      LEFT JOIN solicitudes_adopcion s ON a.id_animal = s.id_animal
      WHERE 1=1
    `;

        const params = [];

        // Filtros opcionales
        if (filters.tipo) {
            sql += ' AND a.tipo = ?';
            params.push(filters.tipo);
        }

        if (filters.estado) {
            sql += ' AND a.estado = ?';
            params.push(filters.estado);
        }

        if (filters.sexo) {
            sql += ' AND a.sexo = ?';
            params.push(filters.sexo);
        }

        if (filters.tamanio) {
            sql += ' AND a.tamanio = ?';
            params.push(filters.tamanio);
        }

        if (filters.search) {
            sql += ' AND (a.nombre LIKE ? OR a.raza LIKE ? OR a.descripcion LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        sql += ' GROUP BY a.id_animal ORDER BY a.fecha_ingreso DESC';

        return await query(sql, params);
    }

    /**
     * Obtener animal por ID con todas sus fotos
     */
    static async findById(id) {
        try {
            // Primero obtener el animal
            const sqlAnimal = 'SELECT * FROM animales WHERE id_animal = ?';
            const animales = await query(sqlAnimal, [id]);

            if (animales.length === 0) return null;

            const animal = animales[0];

            // Luego obtener sus fotos
            const sqlFotos = `
      SELECT id_foto, ruta_foto, descripcion, orden
      FROM fotos_animales
      WHERE id_animal = ?
      ORDER BY orden
    `;

            const fotos = await query(sqlFotos, [id]);
            animal.fotos = fotos;

            return animal;
        } catch (error) {
            console.error('Error en findById:', error);
            throw error;
        }
    }
    /**
     * Crear nuevo animal
     */
    static async create(animalData) {
        const sql = `
      INSERT INTO animales (
        nombre, tipo, raza, edad_anos, edad_meses, sexo, tamanio, peso,
        color, descripcion, caracteristicas, historia, estado_salud,
        foto_principal, estado, fecha_ingreso
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const params = [
            animalData.nombre,
            animalData.tipo,
            animalData.raza || null,
            animalData.edad_anos || null,
            animalData.edad_meses || null,
            animalData.sexo,
            animalData.tamanio,
            animalData.peso || null,
            animalData.color || null,
            animalData.descripcion || null,
            animalData.caracteristicas || null,
            animalData.historia || null,
            animalData.estado_salud || null,
            animalData.foto_principal || null,
            animalData.estado || 'disponible',
            animalData.fecha_ingreso || new Date().toISOString().split('T')[0]
        ];

        const result = await query(sql, params);
        return result.insertId;
    }

    /**
     * Actualizar animal
     */
    static async update(id, animalData) {
        const sql = `
      UPDATE animales SET
        nombre = ?, tipo = ?, raza = ?, edad_anos = ?, edad_meses = ?,
        sexo = ?, tamanio = ?, peso = ?, color = ?, descripcion = ?,
        caracteristicas = ?, historia = ?, estado_salud = ?,
        foto_principal = ?, estado = ?
      WHERE id_animal = ?
    `;

        const params = [
            animalData.nombre,
            animalData.tipo,
            animalData.raza,
            animalData.edad_anos,
            animalData.edad_meses,
            animalData.sexo,
            animalData.tamanio,
            animalData.peso,
            animalData.color,
            animalData.descripcion,
            animalData.caracteristicas,
            animalData.historia,
            animalData.estado_salud,
            animalData.foto_principal,
            animalData.estado,
            id
        ];

        const result = await query(sql, params);
        return result.affectedRows > 0;
    }

    /**
     * Eliminar animal (soft delete - cambiar estado)
     */
    static async delete(id) {
        const sql = 'UPDATE animales SET estado = "no_disponible" WHERE id_animal = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Eliminar animal permanentemente
     */
    static async deletePermanent(id) {
        const sql = 'DELETE FROM animales WHERE id_animal = ?';
        const result = await query(sql, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Cambiar estado del animal
     */
    static async changeStatus(id, estado) {
        const sql = 'UPDATE animales SET estado = ? WHERE id_animal = ?';
        const result = await query(sql, [estado, id]);
        return result.affectedRows > 0;
    }

    /**
     * Agregar foto a un animal
     */
    static async addPhoto(id_animal, photoData) {
        const sql = `
      INSERT INTO fotos_animales (id_animal, ruta_foto, descripcion, orden)
      VALUES (?, ?, ?, ?)
    `;

        const params = [
            id_animal,
            photoData.ruta_foto,
            photoData.descripcion || null,
            photoData.orden || 0
        ];

        const result = await query(sql, params);
        return result.insertId;
    }

    /**
     * Eliminar foto de un animal
     */
    static async deletePhoto(id_foto) {
        const sql = 'DELETE FROM fotos_animales WHERE id_foto = ?';
        const result = await query(sql, [id_foto]);
        return result.affectedRows > 0;
    }

    /**
     * Obtener estadísticas generales
     */
    static async getStats() {
        const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
        SUM(CASE WHEN estado = 'adoptado' THEN 1 ELSE 0 END) as adoptados,
        SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
        SUM(CASE WHEN tipo = 'perro' THEN 1 ELSE 0 END) as perros,
        SUM(CASE WHEN tipo = 'gato' THEN 1 ELSE 0 END) as gatos
      FROM animales
      WHERE estado != 'no_disponible'
    `;

        const results = await query(sql);
        return results[0];
    }

    /**
     * Buscar animales similares (por tipo, tamaño, edad)
     */
    static async findSimilar(id, limit = 4) {
        const sql = `
      SELECT a2.*
      FROM animales a1
      JOIN animales a2 ON (
        a2.tipo = a1.tipo 
        AND a2.id_animal != a1.id_animal
        AND a2.estado = 'disponible'
      )
      WHERE a1.id_animal = ?
      ORDER BY 
        CASE WHEN a2.tamanio = a1.tamanio THEN 0 ELSE 1 END,
        ABS(a2.edad_anos - a1.edad_anos)
      LIMIT ?
    `;

        return await query(sql, [id, limit]);
    }
}

module.exports = Animal;