<script setup>
import { ref, computed } from 'vue'
import html2canvas from 'html2canvas'
import { copyToClipboard } from '@/utils/helpers'

const props = defineProps({
  encuesta: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const copiadoExitoso = ref(false)
const descargandoImagen = ref(false)

const urlEncuesta = computed(() => {
  return `https://social.encuesta.top/encuesta/${props.encuesta.id_encuesta}`
})

const handleCopiarEnlace = async () => {
  const success = await copyToClipboard(urlEncuesta.value)
  if (success) {
    copiadoExitoso.value = true
    setTimeout(() => {
      copiadoExitoso.value = false
    }, 2000)
  }
}

const handleCompartirWhatsApp = () => {
  const texto = encodeURIComponent(`¡Votá en esta encuesta! ${props.encuesta.titulo}\n\n${urlEncuesta.value}`)
  window.open(`https://wa.me/?text=${texto}`, '_blank')
}

const handleCompartirTwitter = () => {
  const texto = encodeURIComponent(`¡Votá en esta encuesta! ${props.encuesta.titulo}`)
  const url = encodeURIComponent(urlEncuesta.value)
  window.open(`https://twitter.com/intent/tweet?text=${texto}&url=${url}`, '_blank')
}

const handleCompartirFacebook = () => {
  const url = encodeURIComponent(urlEncuesta.value)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

const graficoRef = ref(null)

const handleDescargarImagen = async () => {
  try {
    descargandoImagen.value = true
    // Captura el área del gráfico y la tabla de resultados
    const graficoEl = graficoRef.value
    if (!graficoEl) throw new Error('No se encontró el gráfico para capturar')
    const canvas = await html2canvas(graficoEl, {
      backgroundColor: null,
      scale: 2
    })
    // Descargar la imagen
    const link = document.createElement('a')
    link.download = `encuesta-${props.encuesta.id_encuesta}-resultados.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('Error al descargar imagen:', error)
    alert('Error al generar la imagen')
  } finally {
    descargandoImagen.value = false
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="modal-backdrop" @click.self="handleClose">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">📤 Compartir Encuesta</h3>
          <button type="button" class="btn-close" @click="handleClose"></button>
        </div>


        <div class="modal-body">
          <div class="encuesta-preview">
            <h4 class="preview-titulo">{{ encuesta.titulo }}</h4>
            <p class="preview-descripcion">{{ encuesta.descripcion }}</p>
          </div>

          <div class="compartir-seccion">
            <h5 class="seccion-titulo">Compartir por enlace</h5>
            <div class="input-group mb-3">
              <input 
                type="text" 
                class="form-control" 
                :value="urlEncuesta" 
                readonly
              >
              <button 
                class="btn btn-outline-primary" 
                type="button"
                @click="handleCopiarEnlace"
              >
                {{ copiadoExitoso ? '✓ Copiado' : '📋 Copiar' }}
              </button>
            </div>
          </div>

          <div class="compartir-seccion">
            <h5 class="seccion-titulo">Compartir en redes sociales</h5>
            <div class="redes-sociales">
              <button 
                class="btn btn-social btn-whatsapp"
                @click="handleCompartirWhatsApp"
              >
                <span class="social-icon">💬</span>
                WhatsApp
              </button>
              <button 
                class="btn btn-social btn-twitter"
                @click="handleCompartirTwitter"
              >
                <span class="social-icon">🐦</span>
                Twitter
              </button>
              <button 
                class="btn btn-social btn-facebook"
                @click="handleCompartirFacebook"
              >
                <span class="social-icon">📘</span>
                Facebook
              </button>
            </div>
          </div>

          <!-- Contenedor del gráfico y tabla para capturar -->
          <div ref="graficoRef">
            <slot name="grafico" />
          </div>

          <div class="compartir-seccion">
            <h5 class="seccion-titulo">Descargar como imagen</h5>
            <button 
              class="btn btn-primary w-100"
              @click="handleDescargarImagen"
              :disabled="descargandoImagen"
            >
              <span v-if="descargandoImagen" class="spinner-border spinner-border-sm me-2"></span>
              {{ descargandoImagen ? 'Generando imagen...' : '💾 Descargar Imagen' }}
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="handleClose"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-dialog {
  max-width: 600px;
  width: 100%;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  background: linear-gradient(135deg, #74ACDF 0%, #0057B7 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.btn-close {
  background: white;
  opacity: 1;
  border-radius: 50%;
  padding: 0.5rem;
}

.modal-body {
  padding: 2rem;
  max-height: 70vh;
  overflow-y: auto;
}

.encuesta-preview {
  background: linear-gradient(135deg, rgba(116, 172, 223, 0.1) 0%, rgba(0, 87, 183, 0.1) 100%);
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  border-left: 4px solid #0057B7;
}

.preview-titulo {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0057B7;
  margin-bottom: 0.5rem;
}

.preview-descripcion {
  color: #666;
  margin: 0;
}

.compartir-seccion {
  margin-bottom: 2rem;
}

.seccion-titulo {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0057B7;
  margin-bottom: 1rem;
}

.input-group .form-control {
  border: 2px solid #74ACDF;
}

.input-group .form-control:focus {
  border-color: #0057B7;
  box-shadow: none;
}

.redes-sociales {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.social-icon {
  font-size: 1.3rem;
}

.btn-whatsapp {
  background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
  color: white;
}

.btn-whatsapp:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
}

.btn-twitter {
  background: linear-gradient(135deg, #1DA1F2 0%, #0d8bd9 100%);
  color: white;
}

.btn-twitter:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(29, 161, 242, 0.3);
}

.btn-facebook {
  background: linear-gradient(135deg, #1877F2 0%, #0d5dbf 100%);
  color: white;
}

.btn-facebook:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 119, 242, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #0057B7 0%, #74ACDF 100%);
  border: none;
  padding: 0.75rem;
  font-weight: 600;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 87, 183, 0.3);
}

.modal-footer {
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 576px) {
  .modal-body {
    padding: 1.5rem;
  }
  
  .redes-sociales {
    grid-template-columns: 1fr;
  }
}
</style>
