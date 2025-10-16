const axios = require('axios');

/**
 * Middleware de autenticación que valida tokens con el servicio SSO
 * @param {boolean} required - Si la autenticación es requerida
 */
const authMiddleware = (required = true) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      const uniqueId = req.query.unique_id;

      // Si no es requerida la autenticación y no hay token, continuar
      if (!required && !authHeader) {
        req.user = null;
        return next();
      }

      // Si es requerida la autenticación, validar que existan los parámetros
      if (required && (!authHeader || !uniqueId)) {
        return res.status(401).json({
          success: false,
          message: 'Token de autorización y unique_id son requeridos',
          error: 'MISSING_AUTH_PARAMS'
        });
      }

      // Extraer el token del header Authorization
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        if (required) {
          return res.status(401).json({
            success: false,
            message: 'Token de autorización requerido',
            error: 'MISSING_TOKEN'
          });
        } else {
          req.user = null;
          return next();
        }
      }

      // Verificar el token con el servicio SSO
      const ssoResponse = await axios.get(`${process.env.SSO_SERVICE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          unique_id: uniqueId
        }
      });

      if (ssoResponse.data.success && ssoResponse.data.data.valid) {
        // Token válido, agregar información del usuario al request
        req.user = ssoResponse.data.data.user;
        req.tokenData = ssoResponse.data.data;
        next();
      } else {
        return res.status(401).json({
          success: false,
          message: 'Token inválido o expirado',
          error: 'INVALID_TOKEN'
        });
      }

    } catch (error) {
      console.error('Error en middleware de autenticación:', error.message);
      
      // Manejar errores específicos del SSO
      if (error.response) {
        const ssoError = error.response.data;
        
        if (ssoError.error === 'UNIQUE_ID_MISMATCH') {
          return res.status(401).json({
            success: false,
            message: 'unique_id no coincide con la sesión',
            error: 'UNIQUE_ID_MISMATCH'
          });
        }
        
        if (ssoError.error === 'GOOGLE_SESSION_EXPIRED') {
          return res.status(401).json({
            success: false,
            message: 'Sesión de Google expirada, re-autenticación requerida',
            error: 'GOOGLE_SESSION_EXPIRED',
            require_reauth: true
          });
        }
      }

      if (required) {
        return res.status(401).json({
          success: false,
          message: 'Error al verificar autenticación',
          error: 'AUTH_VERIFICATION_ERROR'
        });
      } else {
        req.user = null;
        next();
      }
    }
  };
};

module.exports = authMiddleware;