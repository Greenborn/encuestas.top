<script setup>
import { computed } from 'vue'
import { formatDate, isExpired } from '@/utils/helpers'

const props = defineProps({
  encuesta: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['ver-detalle', 'votar'])

const totalVotos = computed(() => {
  if (!props.encuesta.resultado_preliminar) return 0
  return Object.values(props.encuesta.resultado_preliminar).reduce((sum, votos) => sum + votos, 0)
})

const encuestaExpirada = computed(() => {
  return isExpired(props.encuesta.fecha_finalizacion)
})

const puedeVotar = computed(() => {
  return props.encuesta.puede_votar && !encuestaExpirada.value
})

const handleVerDetalle = () => {
  emit('ver-detalle', props.encuesta)
}

const handleVotar = () => {
  emit('votar', props.encuesta)
}
</script>

<template>
  <div class="encuesta-card">
    <div class="card-header">
      <h3 class="card-titulo">{{ encuesta.titulo }}</h3>
      <span 
        class="badge" 
        :class="encuestaExpirada ? 'bg-danger' : 'bg-success'"
      >
        {{ encuestaExpirada ? '🔒 Finalizada' : '✅ Activa' }}
      </span>
    </div>

    <div class="card-body">
      <p class="card-descripcion">{{ encuesta.descripcion }}</p>

      <div class="card-meta">
        <div class="meta-item">
          <span class="meta-icon">📅</span>
          <span class="meta-text">{{ formatDate(encuesta.fecha_finalizacion) }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-icon">🗳️</span>
          <span class="meta-text">{{ totalVotos }} votos</span>
        </div>
      </div>

      <div class="resultados-preview" v-if="encuesta.resultado_preliminar">
        <div 
          v-for="(votos, opcionId) in encuesta.resultado_preliminar" 
          :key="opcionId"
          class="resultado-barra"
        >
          <div class="resultado-info">
            <span class="resultado-nombre">Opción {{ opcionId }}</span>
            <span class="resultado-votos">{{ votos }}</span>
          </div>
          <div class="progress">
            <div 
              class="progress-bar" 
              role="progressbar" 
              :style="{ width: totalVotos > 0 ? `${(votos / totalVotos) * 100}%` : '0%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <button 
        class="btn btn-outline-primary btn-sm" 
        @click="handleVerDetalle"
      >
        👁️ Ver Detalle
      </button>
      <button 
        v-if="puedeVotar"
        class="btn btn-primary btn-sm" 
        @click="handleVotar"
      >
        🗳️ Votar
      </button>
      <button 
        v-else-if="!encuestaExpirada"
        class="btn btn-secondary btn-sm" 
        disabled
      >
        ✓ Ya votaste
      </button>
    </div>
  </div>
</template>

<style scoped>
.encuesta-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.encuesta-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 87, 183, 0.2);
}

.card-header {
  background: linear-gradient(135deg, #74ACDF 0%, #0057B7 100%);
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 1rem;
}

.card-titulo {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.8rem;
  white-space: nowrap;
}

.card-body {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-descripcion {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.meta-icon {
  font-size: 1.1rem;
}

.resultados-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resultado-barra {
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
}

.resultado-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.resultado-nombre {
  font-weight: 600;
  color: #333;
}

.resultado-votos {
  color: #0057B7;
  font-weight: 700;
}

.progress {
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
}

.progress-bar {
  background: linear-gradient(90deg, #0057B7 0%, #74ACDF 100%);
  transition: width 0.6s ease;
}

.card-footer {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-footer .btn {
  flex: 1;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, #0057B7 0%, #74ACDF 100%);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 87, 183, 0.3);
}

.btn-outline-primary {
  border-color: #74ACDF;
  color: #0057B7;
}

.btn-outline-primary:hover {
  background-color: #74ACDF;
  border-color: #74ACDF;
  color: white;
}
</style>
