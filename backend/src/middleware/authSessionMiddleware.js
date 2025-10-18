const axios = require('axios');

/**
 * Middleware para verificar autenticación por sesión.
 * - Verifica el token en el header Authorization
 * - Verifica el unique_id en query param
 * - Realiza petición a servicio externo de autenticación
 */
async function authSessionMiddleware(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const uniqueId = req.query.unique_id;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token de autenticación requerido' });
    }
    if (!uniqueId) {
      return res.status(400).json({ success: false, message: 'unique_id requerido en query param' });
    }
    const token = authHeader.replace('Bearer ', '');
    const authServiceUrl = process.env.URL_AUTH_SERVICE || 'https://auth.greenborn.com.ar';
    const url = `${authServiceUrl.replace(/\/$/, '')}/auth/verify?unique_id=${encodeURIComponent(uniqueId)}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });
    if (response.data && response.data.success && response.data.data && response.data.data.valid) {
      // Adjuntar datos de usuario a req y verificar/crear usuario en base de datos
      const usuarioSSO = response.data.data.user;
      req.user = usuarioSSO;
      // Verificar/crear usuario en base de datos
      const Usuario = require('../models/Usuario');
      let usuarioDb = await Usuario.obtenerPorId(usuarioSSO.id);
      if (!usuarioDb) {
        // Crear usuario si no existe
        await Usuario.crear({
          id_usuario: usuarioSSO.id,
          apodo: usuarioSSO.name
        });
      }
      next();
    } else {
      return res.status(401).json({ success: false, message: response.data.message || 'Token inválido', ...response.data });
    }
  } catch (err) {
    if (err.response && err.response.data) {
      return res.status(401).json(err.response.data);
    }
    return res.status(500).json({ success: false, message: 'Error de autenticación', error: err.message });
  }
}

// Middleware opcional: si no hay sesión, sigue sin error
async function authSessionMiddlewareOpcional(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const uniqueId = req.query.unique_id;
    if (!authHeader || !authHeader.startsWith('Bearer ') || !uniqueId) {
      // No hay sesión, continuar sin usuario
      return next();
    }
    const token = authHeader.replace('Bearer ', '');
    const authServiceUrl = process.env.URL_AUTH_SERVICE || 'https://auth.greenborn.com.ar';
    const url = `${authServiceUrl.replace(/\/$/, '')}/auth/verify?unique_id=${encodeURIComponent(uniqueId)}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });
    if (response.data && response.data.success && response.data.data && response.data.data.valid) {
      // Adjuntar datos de usuario a req y verificar/crear usuario en base de datos
      const usuarioSSO = response.data.data.user;
      req.user = usuarioSSO;
      const Usuario = require('../models/Usuario');
      let usuarioDb = await Usuario.obtenerPorId(usuarioSSO.id);
      if (!usuarioDb) {
        await Usuario.crear({
          id_usuario: usuarioSSO.id,
          apodo: usuarioSSO.name
        });
      }
    }
    // Si la sesión no es válida, simplemente sigue sin usuario
    return next();
  } catch (err) {
    // Si hay error, sigue sin usuario
    return next();
  }
}

module.exports = authSessionMiddleware;
module.exports.authSessionMiddlewareOpcional = authSessionMiddlewareOpcional;
