import axios from 'axios'
import sessionModule from '../session/sessionModule'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Usar el interceptor del módulo de sesión
sessionModule.initSessionInterceptors(apiClient);

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido: limpiar sesión global y disparar evento
      import('../session/sessionModule').then((mod) => {
        if (mod.default && mod.default.clearSession) {
          mod.default.clearSession();
          // Disparar evento de logout
          window.dispatchEvent(new Event('app_encuestas_logout'));
        }
      });
    }
    return Promise.reject(error)
  }
)

export default apiClient
