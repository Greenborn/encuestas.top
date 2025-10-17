// Inicializa interceptores de sesión en una instancia de axios
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
// Módulo de gestión de sesión reutilizable para JS/TS (framework agnóstico)

// Configuración por defecto (puede ser sobreescrita)
let config = {
  ssoUrl: '',
  appBaseUrl: '',
  storagePrefix: 'app_mascotas_',
};

function setConfig(newConfig) {
  config = { ...config, ...newConfig };
}

function getStorageKey(key) {
  return config.storagePrefix + key;
}

export function getUniqueId() {
  let uniqueId = localStorage.getItem(getStorageKey('unique_id'));
  if (!uniqueId || uniqueId === 'null') {
    uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(getStorageKey('unique_id'), uniqueId);
  }
  return uniqueId;
}

function saveSession({ bearer_token, expires_at, user }) {
  localStorage.setItem(getStorageKey('bearer_token'), bearer_token);
  localStorage.setItem(getStorageKey('expires_at'), expires_at);
  localStorage.setItem(getStorageKey('user'), JSON.stringify(user));
  window.dispatchEvent(new Event(config.storagePrefix + 'login'));
}

function clearSession() {
  localStorage.removeItem(getStorageKey('user'));
  localStorage.removeItem(getStorageKey('bearer_token'));
  getUniqueId();
}

function getSessionData() {
  const usuario = JSON.parse(localStorage.getItem(getStorageKey('user')) || 'null');
  const token = localStorage.getItem(getStorageKey('bearer_token'));
  const uniqueId = getUniqueId();
  let usuario_id = null;
  try {
    if (usuario) {
      usuario_id = usuario.id || usuario.usuario_id || usuario.email || null;
    }
  } catch {}
  return {
    usuario_id,
    token,
    uniqueId,
    usuario,
  };
}

function isAuthenticated() {
  const user = JSON.parse(localStorage.getItem(getStorageKey('user')) || 'null');
  const token = localStorage.getItem(getStorageKey('bearer_token'));
  if (user && token) return true;
  if (token) return true;
  return false;
}

function getSSOUrl() {
  return config.ssoUrl;
}

function getSSOLoginUrl() {
  const base = config.appBaseUrl;
  const uniqueId = getUniqueId();
  return (
    getSSOUrl() + '/auth/google'
    + '?url_redireccion_app=' + encodeURIComponent(base + '/#/login-redirect')
    + '&unique_id=' + uniqueId
  );
}

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
