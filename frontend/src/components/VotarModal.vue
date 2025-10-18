<script setup>

import { ref, onMounted } from 'vue'
import encuestasService from '@/services/encuestasService'
import sessionModule from '@/session/sessionModule'
import { useRouter } from 'vue-router'

const props = defineProps({
  encuesta: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'voto-exitoso'])


const opciones = ref([])
const opcionSeleccionada = ref(null)
const loading = ref(false)
const loadingOpciones = ref(true)
const error = ref(null)
const router = useRouter()

const cargarOpciones = async () => {
  try {
    loadingOpciones.value = true
  const data = await encuestasService.getOpciones(props.encuesta.id_encuesta)
  console.log('Respuesta getOpciones:', data)
  console.log('Opciones:', data.opciones)
  opciones.value = data.data.opciones
  } catch (err) {
    error.value = 'Error al cargar las opciones'
    console.error('Error cargando opciones:', err)
  } finally {
    loadingOpciones.value = false
  }
}


const handleVotar = async () => {
  if (!opcionSeleccionada.value) {
    alert('Por favor, selecciona una opción')
    return
  }

  // Si no hay sesión activa, guardar voto pendiente y redirigir a login
  if (!sessionModule.isAuthenticated()) {
    // Guardar en localStorage la encuesta y opción elegida
    localStorage.setItem('encuestas_top_voto_pendiente', JSON.stringify({
      id_encuesta: props.encuesta.id_encuesta,
      id_opcion: opcionSeleccionada.value
    }))
    // Redirigir a login
    router.push('/login')
    return
  }

  try {
    loading.value = true
    error.value = null

    await encuestasService.votar(props.encuesta.id_encuesta, {
      id_opcion: opcionSeleccionada.value
    })

    // Limpiar voto pendiente si existía
    localStorage.removeItem('encuestas_top_voto_pendiente')
    emit('voto-exitoso')
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al registrar el voto. Por favor, intenta nuevamente.'
    console.error('Error votando:', err)
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
}


onMounted(() => {
  cargarOpciones()

  // Si hay sesión activa y hay voto pendiente, emitirlo automáticamente
  if (sessionModule.isAuthenticated()) {
    const votoPendiente = localStorage.getItem('encuestas_top_voto_pendiente')
    if (votoPendiente) {
      try {
        const { id_encuesta, id_opcion } = JSON.parse(votoPendiente)
        if (id_encuesta == props.encuesta.id_encuesta && id_opcion) {
          opcionSeleccionada.value = id_opcion
          handleVotar()
        }
      } catch {}
    }
  }
})
</script>

<template>
  <div class="modal-backdrop" @click.self="handleClose">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">🗳️ Votar en: {{ encuesta.titulo }}</h3>
          <button type="button" class="btn-close" @click="handleClose"></button>
        </div>

        <div class="modal-body">
          <p class="modal-descripcion">{{ encuesta.descripcion }}</p>

          <div v-if="loadingOpciones" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
          </div>

          <div v-else-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <div v-else class="opciones-lista">
            <h4 class="opciones-titulo">Selecciona tu opción:</h4>
            <div 
              v-for="opcion in opciones" 
              :key="opcion.id_opcion"
              class="opcion-item"
              :class="{ 'selected': opcionSeleccionada === opcion.id_opcion }"
              @click="opcionSeleccionada = opcion.id_opcion"
            >
              <div 
                class="opcion-color" 
                :style="{ backgroundColor: opcion.color }"
              ></div>
              <div class="opcion-content">
                <span class="opcion-texto">{{ opcion.texto_opcion }}</span>
                <span v-if="opcionSeleccionada === opcion.id_opcion" class="check-icon">✓</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            @click="handleClose"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            class="btn btn-primary" 
            @click="handleVotar"
            :disabled="loading || !opcionSeleccionada || loadingOpciones"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            {{ loading ? 'Votando...' : '✅ Confirmar Voto' }}
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
  max-height: 60vh;
  overflow-y: auto;
}

.modal-descripcion {
  color: #666;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #74ACDF;
}

.opciones-titulo {
  font-size: 1.2rem;
  font-weight: 700;
  color: #0057B7;
  margin-bottom: 1rem;
}

.opciones-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.opcion-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.opcion-item:hover {
  border-color: #74ACDF;
  background-color: rgba(116, 172, 223, 0.05);
  transform: translateX(5px);
}

.opcion-item.selected {
  border-color: #0057B7;
  background-color: rgba(0, 87, 183, 0.1);
  box-shadow: 0 4px 12px rgba(0, 87, 183, 0.2);
}

.opcion-color {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.opcion-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.opcion-texto {
  font-weight: 600;
  color: #333;
}

.check-icon {
  font-size: 1.5rem;
  color: #0057B7;
  animation: checkPop 0.3s ease;
}

@keyframes checkPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.modal-footer {
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #0057B7 0%, #74ACDF 100%);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 87, 183, 0.3);
}

@media (max-width: 576px) {
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer .btn {
    width: 100%;
  }
}
</style>
