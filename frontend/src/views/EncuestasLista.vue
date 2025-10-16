<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import encuestasService from '@/services/encuestasService'
import EncuestaCard from '@/components/EncuestaCard.vue'
import VotarModal from '@/components/VotarModal.vue'

const router = useRouter()
const encuestas = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const selectedEncuesta = ref(null)
const showVotarModal = ref(false)

const encuestasFiltradas = computed(() => {
  if (!searchQuery.value) {
    return encuestas.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return encuestas.value.filter(encuesta => 
    encuesta.titulo.toLowerCase().includes(query) ||
    encuesta.descripcion.toLowerCase().includes(query)
  )
})

const cargarEncuestas = async () => {
  try {
    loading.value = true
    error.value = null
    const data = await encuestasService.getEncuestas()
    encuestas.value = data
  } catch (err) {
    error.value = 'Error al cargar las encuestas. Por favor, intenta nuevamente.'
    console.error('Error cargando encuestas:', err)
  } finally {
    loading.value = false
  }
}

const handleVerDetalle = (encuesta) => {
  router.push(`/encuestas/${encuesta.id_encuesta}`)
}

const handleVotar = (encuesta) => {
  selectedEncuesta.value = encuesta
  showVotarModal.value = true
}

const handleVotoExitoso = () => {
  showVotarModal.value = false
  cargarEncuestas() // Recargar para actualizar resultados
}

const handleCrearEncuesta = () => {
  router.push('/encuestas/nueva')
}

onMounted(() => {
  cargarEncuestas()
})
</script>

<template>
  <div class="encuestas-lista-container">
    <div class="container">
      <div class="header-section">
        <h1 class="page-title">📋 Encuestas Públicas</h1>
        <p class="page-subtitle">Explorá y votá en las encuestas más populares</p>
      </div>

      <div class="toolbar-section">
        <div class="row align-items-center">
          <div class="col-md-8 mb-3 mb-md-0">
            <div class="search-box">
              <input 
                v-model="searchQuery"
                type="text" 
                class="form-control form-control-lg" 
                placeholder="🔍 Buscar encuestas por título o descripción..."
              >
            </div>
          </div>
          <div class="col-md-4 text-md-end">
            <button 
              class="btn btn-primary btn-lg w-100 w-md-auto" 
              @click="handleCrearEncuesta"
            >
              ➕ Nueva Encuesta
            </button>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-3 text-muted">Cargando encuestas...</p>
      </div>

      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
        <button class="btn btn-sm btn-outline-danger ms-3" @click="cargarEncuestas">
          Reintentar
        </button>
      </div>

      <div v-else-if="encuestasFiltradas.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>{{ searchQuery ? 'No se encontraron encuestas' : 'No hay encuestas disponibles' }}</h3>
        <p v-if="searchQuery" class="text-muted">
          Intenta con otros términos de búsqueda
        </p>
        <p v-else class="text-muted">
          Sé el primero en crear una encuesta
        </p>
        <button class="btn btn-primary mt-3" @click="handleCrearEncuesta">
          Crear la primera encuesta
        </button>
      </div>

      <div v-else class="encuestas-grid">
        <EncuestaCard
          v-for="encuesta in encuestasFiltradas"
          :key="encuesta.id_encuesta"
          :encuesta="encuesta"
          @ver-detalle="handleVerDetalle"
          @votar="handleVotar"
        />
      </div>
    </div>

    <VotarModal
      v-if="showVotarModal && selectedEncuesta"
      :encuesta="selectedEncuesta"
      @close="showVotarModal = false"
      @voto-exitoso="handleVotoExitoso"
    />
  </div>
</template>

<style scoped>
.encuestas-lista-container {
  padding: 2rem 0 4rem;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0057B7;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #666;
}

.toolbar-section {
  margin-bottom: 2rem;
}

.search-box input {
  border: 2px solid #74ACDF;
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
}

.search-box input:focus {
  border-color: #0057B7;
  box-shadow: 0 0 0 0.2rem rgba(0, 87, 183, 0.25);
}

.btn-primary {
  background: linear-gradient(135deg, #0057B7 0%, #74ACDF 100%);
  border: none;
  border-radius: 50px;
  padding: 0.75rem 2rem;
  font-weight: 600;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 87, 183, 0.3);
}

.encuestas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #0057B7;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

@media (max-width: 576px) {
  .page-title {
    font-size: 2rem;
  }
  
  .encuestas-grid {
    grid-template-columns: 1fr;
  }
}
</style>
