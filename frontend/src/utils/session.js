/**
 * Genera un UUID v4
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Obtiene o crea un unique_id para el usuario
 */
export function getUniqueId() {
  const key = 'encuestas_top_unique_id'
  let uniqueId = localStorage.getItem(key)
  
  if (!uniqueId) {
    uniqueId = generateUUID()
    localStorage.setItem(key, uniqueId)
  }
  
  return uniqueId
}

/**
 * Guarda la URL actual antes de redirigir al SSO
 */
export function saveReturnUrl(url) {
  localStorage.setItem('encuestas_top_return_url', url)
}

/**
 * Obtiene y limpia la URL de retorno guardada
 */
export function getAndClearReturnUrl() {
  const url = localStorage.getItem('encuestas_top_return_url')
  localStorage.removeItem('encuestas_top_return_url')
  return url || '/'
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated() {
  const token = localStorage.getItem('encuestas_top_jwt_token')
  const userData = localStorage.getItem('encuestas_top_user_data')
  return !!(token && userData)
}

/**
 * Guarda los datos de sesión del usuario
 */
export function saveUserSession(token, userData) {
  localStorage.setItem('encuestas_top_jwt_token', token)
  localStorage.setItem('encuestas_top_user_data', JSON.stringify(userData))
}

/**
 * Obtiene los datos del usuario autenticado
 */
export function getUserData() {
  const userData = localStorage.getItem('encuestas_top_user_data')
  return userData ? JSON.parse(userData) : null
}

/**
 * Cierra la sesión del usuario
 */
export function logout() {
  localStorage.removeItem('encuestas_top_jwt_token')
  localStorage.removeItem('encuestas_top_user_data')
}
