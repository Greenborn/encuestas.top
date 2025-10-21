/**
 * Inicializa interceptores de sesión en una instancia de axios.
 * Agrega el token y unique_id a cada request automáticamente.
 * @param {object} api - Instancia de axios
 */
function initSessionInterceptors(api) {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem(getStorageKey('bearer_token'));
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      let uniqueId = getUniqueId();
      if (!config.params) config.params = {};
      config.params.unique_id = uniqueId;
      return config;
    },
    (error) => Promise.reject(error)
  );
}
// sessionModule.js
/**
 * Módulo de gestión de sesión reutilizable para JS/TS (framework agnóstico)
 */

// Configuración por defecto (puede ser sobreescrita)
let config = {
  ssoUrl: '',
  appBaseUrl: '',
  storagePrefix: 'app_mascotas_',
};

/**
 * Configura los parámetros del módulo de sesión (SSO, base URL, prefijo de storage).
 * @param {object} newConfig - Configuración personalizada
 */
function setConfig(newConfig) {
  config = { ...config, ...newConfig };
}

/**
 * Obtiene la clave completa para localStorage usando el prefijo configurado.
 * @param {string} key - Clave base
 * @returns {string} Clave con prefijo
 */
function getStorageKey(key) {
  return config.storagePrefix + key;
}

/**
 * Obtiene o genera un identificador único para la sesión del usuario.
 * @returns {string} uniqueId
 */
export function getUniqueId() {
  let uniqueId = localStorage.getItem(getStorageKey('unique_id'));
  if (!uniqueId || uniqueId === 'null') {
    uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(getStorageKey('unique_id'), uniqueId);
  }
  return uniqueId;
}

/**
 * Guarda los datos de sesión en localStorage.
 * @param {object} params - Datos de sesión
 * @param {string} params.bearer_token - Token de autenticación
 * @param {string} params.expires_at - Fecha de expiración
 * @param {object} params.user - Datos mínimos del usuario
 */
function saveSession({ bearer_token, expires_at, user }) {
  localStorage.setItem(getStorageKey('bearer_token'), bearer_token);
  localStorage.setItem(getStorageKey('expires_at'), expires_at);
  // Guardar solo datos mínimos del usuario, sin email ni name
  if (user) {
    const minimalUser = { ...user };
    delete minimalUser.email;
    delete minimalUser.name;
    localStorage.setItem(getStorageKey('user'), JSON.stringify(minimalUser));
  } else {
    localStorage.setItem(getStorageKey('user'), 'null');
  }
  window.dispatchEvent(new Event(config.storagePrefix + 'login'));
}

/**
 * Elimina los datos de sesión del localStorage y regenera el uniqueId.
 */
function clearSession() {
  localStorage.removeItem(getStorageKey('user'));
  localStorage.removeItem(getStorageKey('bearer_token'));
  getUniqueId();
}

/**
 * Obtiene los datos actuales de la sesión desde localStorage.
 * @returns {object} Datos de sesión (usuario_id, token, uniqueId, usuario)
 */
function getSessionData() {
  const usuario = JSON.parse(localStorage.getItem(getStorageKey('user')) || 'null');
  const token = localStorage.getItem(getStorageKey('bearer_token'));
  const uniqueId = getUniqueId();
  let usuario_id = null;
  try {
    if (usuario) {
      usuario_id = usuario.id || usuario.usuario_id || null;
    }
  } catch {}
  return {
    usuario_id,
    token,
    uniqueId,
    usuario,
  };
}

/**
 * Verifica si el usuario está autenticado (token y usuario presentes).
 * @returns {boolean} true si autenticado, false si no
 */
function isAuthenticated() {
  const user = JSON.parse(localStorage.getItem(getStorageKey('user')) || 'null');
  const token = localStorage.getItem(getStorageKey('bearer_token'));
  if (user && token) return true;
  if (token) return true;
  return false;
}

/**
 * Devuelve la URL base del servicio SSO configurado.
 * @returns {string} URL SSO
 */
function getSSOUrl() {
  return config.ssoUrl;
}

/**
 * Construye la URL de login para Google SSO con redirección y uniqueId.
 * @returns {string} URL de login SSO
 */
function getSSOLoginUrl() {
  const base = config.appBaseUrl;
  const uniqueId = getUniqueId();
  return (
    getSSOUrl() + '/auth/google'
    + '?url_redireccion_app=' + encodeURIComponent(base + '/#/login-redirect')
    + '&unique_id=' + uniqueId
  );
}

/**
 * Verifica el estado de la sesión actual contra el servicio SSO.
 * @returns {Promise<object>} Respuesta del servicio SSO
 */
async function verificarSesion() {
  const verifyUrl = getSSOUrl() + '/auth/verify';
  const token = localStorage.getItem(getStorageKey('bearer_token'));
  const uniqueId = getUniqueId();
  if (!token || !uniqueId) return { activa: false };
  try {
    const response = await fetch(`${verifyUrl}?unique_id=${uniqueId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    return { activa: false };
  }
}

/**
 * Realiza logout en el servicio SSO y limpia la sesión local.
 * @returns {Promise<void>}
 */
async function logout() {
  const token = localStorage.getItem(getStorageKey('bearer_token'));
  const uniqueId = getUniqueId();
  const ssoUrl = getSSOUrl();
  try {
    await fetch(`${ssoUrl}/auth/logout?unique_id=${uniqueId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch {}
  clearSession();
  // Disparar evento personalizado de logout
  window.dispatchEvent(new Event((config.storagePrefix || 'app_encuestas_') + 'logout'));
}

export default {
  setConfig,
  getSessionData,
  saveSession,
  clearSession,
  isAuthenticated,
  getSSOUrl,
  getSSOLoginUrl,
  verificarSesion,
  logout,
  getUniqueId,
  initSessionInterceptors,
};
