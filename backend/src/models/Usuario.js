const db = require('../config/database');

class Usuario {
  static async crear(datosUsuario) {
    const moment = require('moment-timezone');
    const now = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss');
    datosUsuario.creado_el = now;
    datosUsuario.actualizado_el = now;
    // Asegurar que 'nombre' esté presente
    if (!datosUsuario.nombre) {
      datosUsuario.nombre = datosUsuario.apodo || 'Sin Nombre';
    }
    const [id] = await db('usuario').insert(datosUsuario);
    return this.obtenerPorId(id);
  }

  static async obtenerPorId(id) {
    return await db('usuario')
      .where({ id_usuario: id })
      .first();
  }



  static async obtenerTodos() {
    return await db('usuario').select('*');
  }

  static async actualizar(id, datosActualizados) {
    const moment = require('moment-timezone');
    datosActualizados.actualizado_el = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss');
    await db('usuario')
      .where({ id_usuario: id })
      .update(datosActualizados);
    return this.obtenerPorId(id);
  }

  static async eliminar(id) {
    return await db('usuario')
      .where({ id_usuario: id })
      .del();
  }
}

module.exports = Usuario;
