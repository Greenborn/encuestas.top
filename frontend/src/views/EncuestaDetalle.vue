<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import encuestasService from '@/services/encuestasService'
import sessionModule from '../session/sessionModule';
import { formatDate, isExpired } from '@/utils/helpers'
import GraficoResultados from '@/components/GraficoResultados.vue'
import CompartirModal from '@/components/CompartirModal.vue'
import VotarModal from '@/components/VotarModal.vue'
import ConfirmarVotoModal from '@/components/ConfirmarVotoModal.vue'

const router = useRouter()
const route = useRoute()



const encuesta = ref(null)
const loading = ref(true)
const error = ref(null)
const showCompartirModal = ref(false)
const showVotarModal = ref(false)
const puedeVotar = ref(false)
const votoPendienteProcesado = ref(false)
const showConfirmarVotoModal = ref(false)
const opcionPendiente = ref(null)

const cargarDatos = async () => {
  try {
    loading.value = true
    error.value = null
    const id = route.params.id
    const encuestaData = await encuestasService.getEncuesta(id)
  encuesta.value = encuestaData.data
  puedeVotar.value = encuestaData.data && encuestaData.data.puede_votar
  } catch (err) {
    error.value = 'Error al cargar la encuesta. Por favor, intenta nuevamente.'
    console.error('Error cargando encuesta:', err)
  } finally {
    loading.value = false
  }
}


const handleVotar = () => {
  // Si no hay sesión, mostrar modal de votar (el modal se encarga de guardar voto pendiente y redirigir a login)
  showVotarModal.value = true
}


const handleVotoExitoso = () => {
  showVotarModal.value = false
  cargarDatos() // Recargar datos
}

const handleCompartir = () => {
  showCompartirModal.value = true
}

const handleVolver = () => {
  router.push('/encuestas')
}


onMounted(() => {
  cargarDatos()
})

// Mostrar modal de confirmación de voto tras login cuando encuesta y opciones estén listas
watch(
  [() => encuesta.value, () => encuesta.value && encuesta.value.opciones],
  ([enc, opciones]) => {
    const votoPendiente = localStorage.getItem('encuestas_top_voto_pendiente')
    const returnId = localStorage.getItem('encuestas_top_return_id')
    if (
      sessionModule.isAuthenticated() &&
      votoPendiente &&
      returnId &&
      !votoPendienteProcesado.value &&
      String(returnId) === String(route.params.id) &&
      enc && enc.opciones && enc.opciones.length > 0
    ) {
      try {
        const { id_encuesta, id_opcion } = JSON.parse(votoPendiente)
        if (id_encuesta == route.params.id && id_opcion) {
          const opcion = enc.opciones.find(o => o.id_opcion == id_opcion)
          if (opcion) {
            opcionPendiente.value = opcion
            showConfirmarVotoModal.value = true
          }
        }
      } catch {}
    }
  },
  { immediate: true }
)

const confirmarVotoPendiente = async () => {
  const votoPendiente = localStorage.getItem('encuestas_top_voto_pendiente')
  if (!votoPendiente) return
  try {
    const { id_encuesta, id_opcion } = JSON.parse(votoPendiente)
    votoPendienteProcesado.value = true
    await encuestasService.votar(id_encuesta, { id_opcion })
    localStorage.removeItem('encuestas_top_voto_pendiente')
    localStorage.removeItem('encuestas_top_return_id')
    showConfirmarVotoModal.value = false
    cargarDatos()
  } catch {
    // Si falla, no borrar el voto pendiente para reintentar
    showConfirmarVotoModal.value = false
  }
}

const cancelarVotoPendiente = () => {
  localStorage.removeItem('encuestas_top_voto_pendiente')
  localStorage.removeItem('encuestas_top_return_id')
  showConfirmarVotoModal.value = false
  // Redirigir a la encuesta
  router.replace(`/encuestas/${route.params.id}`)
}
</script>

<template>
  <div class="encuesta-detalle-container">
    <div class="container">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando encuesta...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-3" @click="cargarDatos">
          Reintentar
        </button>
      </div>

      <div v-else-if="encuesta">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <button class="btn btn-outline-secondary" @click="handleVolver">
            ← Volver a encuestas
          </button>
          <button class="btn btn-outline-primary" @click="handleCompartir">
            📤 Compartir
          </button>
        </div>

        <div class="encuesta-card">
          <div class="card-header">
            <h1 class="encuesta-titulo">{{ encuesta.titulo }}</h1>
            <p class="encuesta-descripcion">{{ encuesta.descripcion }}</p>
            <div class="encuesta-meta mb-2">
              <span class="badge bg-info me-2">
                📅 Cierre: {{ formatDate(encuesta.fecha_finalizacion) }}
              </span>
              <span 
                class="badge" 
                :class="isExpired(encuesta.fecha_finalizacion) ? 'bg-danger' : 'bg-success'"
              >
                {{ isExpired(encuesta.fecha_finalizacion) ? '🔒 Finalizada' : '✅ Activa' }}
              </span>
            </div>
            <div class="encuesta-info bg-light text-dark rounded p-3 mt-2">
              <div><strong>🗓️ Creación:</strong> {{ formatDate(encuesta.fecha_creacion) }}</div>
            </div>
          </div>

          <div class="card-body">


            <div v-if="(!isExpired(encuesta.fecha_finalizacion) && (!encuesta.ya_voto || !sessionModule.isAuthenticated())) || puedeVotar" class="alert alert-info d-flex justify-content-between align-items-center">
              <span>¿Ya votaste? Elegí tu opción y participá 🗳️</span>
              <button class="btn btn-primary" @click="handleVotar">
                Votar Ahora
              </button>
            </div>

            <div v-else-if="!isExpired(encuesta.fecha_finalizacion) && encuesta.ya_voto && sessionModule.isAuthenticated()" class="alert alert-warning">
              Ya has votado en esta encuesta 👍
            </div>

            <div v-else-if="isExpired(encuesta.fecha_finalizacion)" class="alert alert-danger">
              La encuesta ha finalizado. Ya no se puede votar.
            </div>

            <h3 class="resultados-titulo">📊 Resultados</h3>
            
            <GraficoResultados 
              v-if="encuesta && encuesta.opciones && encuesta.opciones.length > 0"
              :resultados="encuesta.resultado_preliminar"
              :opciones="encuesta.opciones"
            />

            <div v-else class="text-center text-muted py-4">
              No hay votos todavía. ¡Sé el primero en votar!
            </div>
          </div>
        </div>
      </div>
    </div>

    <CompartirModal
      v-if="showCompartirModal && encuesta"
      :encuesta="encuesta"
      @close="showCompartirModal = false"
    >
      <template #grafico>
        <GraficoResultados 
          v-if="encuesta && encuesta.opciones && encuesta.opciones.length > 0"
          :resultados="encuesta.resultado_preliminar"
          :opciones="encuesta.opciones"
        />
      </template>
    </CompartirModal>

    <VotarModal
      v-if="showVotarModal && encuesta"
      :encuesta="encuesta"
      @close="showVotarModal = false"
      @voto-exitoso="handleVotoExitoso"
    />

    <ConfirmarVotoModal
      v-if="showConfirmarVotoModal && opcionPendiente"
      :opcion="opcionPendiente"
      @confirm="confirmarVotoPendiente"
      @cancel="cancelarVotoPendiente"
    />
  </div>
</template>

<style scoped>
.encuesta-detalle-container {
  padding: 2rem 0 4rem;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.encuesta-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #74ACDF 0%, #0057B7 100%);
  color: white;
  padding: 2.5rem;
}

.encuesta-titulo {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.encuesta-descripcion {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  opacity: 0.95;
}

.encuesta-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.encuesta-meta .badge {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
}

.card-body {
  padding: 2.5rem;
}

.resultados-titulo {
  color: #0057B7;
  font-weight: 700;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

@media (max-width: 768px) {
  .encuesta-titulo {
    font-size: 1.8rem;
  }
  
  .card-header,
  .card-body {
    padding: 1.5rem;
  }
}
</style>
