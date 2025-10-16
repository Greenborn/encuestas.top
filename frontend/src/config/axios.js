import axios from 'axios'
import { getUniqueId } from './utils/session'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar unique_id a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const uniqueId = getUniqueId()
    
    // Agregar unique_id como query param
    if (!config.params) {
      config.params = {}
    }
    config.params.unique_id = uniqueId
    
    // Agregar JWT token si existe
    const token = localStorage.getItem('encuestas_top_jwt_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('encuestas_top_jwt_token')
      localStorage.removeItem('encuestas_top_user_data')
    }
    return Promise.reject(error)
  }
)

export default apiClient
