import apiClient from '@/config/axios'

/**
 * Servicio para gestión de encuestas
 */
export default {
  /**
   * Obtener lista de encuestas públicas
   */
  async getEncuestas() {
    const response = await apiClient.get('/encuestas')
    return response.data
  },

  /**
   * Obtener detalle de una encuesta
   */
  async getEncuesta(id) {
    const response = await apiClient.get(`/encuestas/${id}`)
    return response.data
  },

  /**
   * Crear nueva encuesta
   */
  async crearEncuesta(data) {
    const response = await apiClient.post('/encuestas', data)
    return response.data
  },

  /**
   * Eliminar encuesta (solo propietario)
   */
  async eliminarEncuesta(id) {
    const response = await apiClient.delete(`/encuestas/${id}`)
    return response.data
  },

  /**
   * Obtener opciones de una encuesta
   */
  async getOpciones(idEncuesta) {
    const response = await apiClient.get(`/encuestas/${idEncuesta}/opciones`)
    return response.data
  },

  /**
   * Agregar opción a una encuesta
   */
  async agregarOpcion(idEncuesta, data) {
    const response = await apiClient.post(`/encuestas/${idEncuesta}/opciones`, data)
    return response.data
  },

  /**
   * Votar por una opción
   */
  async votar(idEncuesta, data) {
    const response = await apiClient.post(`/encuestas/${idEncuesta}/votar`, data)
    return response.data
  },

  /**
   * Obtener resultados de una encuesta
   */
  async getResultados(idEncuesta) {
    const response = await apiClient.get(`/encuestas/${idEncuesta}/resultados`)
    return response.data
  }
}
