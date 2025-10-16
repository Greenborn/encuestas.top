/**
 * Formatea una fecha a formato legible
 */
export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Valida si una fecha está vencida
 */
export function isExpired(dateString) {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err)
    return false
  }
}

/**
 * Valida un código de color hexadecimal
 */
export function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color)
}

/**
 * Genera un color aleatorio
 */
export function randomColor() {
  const colors = [
    '#74ACDF', // Azul celeste bandera
    '#0057B7', // Azul oscuro bandera
    '#FF6B6B', // Rojo coral
    '#4ECDC4', // Verde azulado
    '#FFE66D', // Amarillo
    '#A8E6CF', // Verde menta
    '#FF8B94', // Rosa salmón
    '#C7CEEA', // Lila
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
