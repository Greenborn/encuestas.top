<script setup>
import { ref, computed, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  resultados: {
    type: Object,
    required: true
  },
  opciones: {
    type: Array,
    required: true
  }
})

const chartCanvas = ref(null)
const chartInstance = ref(null)
const tipoGrafico = ref('pie') // 'pie' o 'bar'

const datosGrafico = computed(() => {
  const labels = []
  const data = []
  const backgroundColor = []

  props.opciones.forEach(opcion => {
    const votos = props.resultados[opcion.id_opcion]?.votos || 0
    labels.push(opcion.texto_opcion)
    data.push(votos)
    backgroundColor.push(opcion.color)
  })

  return { labels, data, backgroundColor }
})

const totalVotos = computed(() => {
  return datosGrafico.value.data.reduce((sum, votos) => sum + votos, 0)
})

const crearGrafico = () => {
  if (!chartCanvas.value) return

  // Destruir gráfico anterior si existe
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  
  const config = {
    type: tipoGrafico.value,
    data: {
      labels: datosGrafico.value.labels,
      datasets: [{
        label: 'Votos',
        data: datosGrafico.value.data,
        backgroundColor: datosGrafico.value.backgroundColor,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || ''
              const value = context.parsed.y || context.parsed || 0
              const percentage = totalVotos.value > 0 
                ? ((value / totalVotos.value) * 100).toFixed(1) 
                : 0
              return `${label}: ${value} votos (${percentage}%)`
            }
          }
        }
      }
    }
  }

  if (tipoGrafico.value === 'bar') {
    config.options.scales = {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  chartInstance.value = new Chart(ctx, config)
}

const cambiarTipoGrafico = (tipo) => {
  tipoGrafico.value = tipo
  crearGrafico()
}

const descargarGrafico = () => {
  if (!chartCanvas.value) return

  const link = document.createElement('a')
  link.download = 'grafico-resultados.png'
  link.href = chartCanvas.value.toDataURL('image/png')
  link.click()
}

onMounted(() => {
  crearGrafico()
})
</script>

<template>
  <div class="grafico-container">
    <div class="grafico-header">
      <div class="total-votos">
        <span class="total-label">Total de votos:</span>
  <span class="total-numero">{{ typeof totalVotos === 'number' ? totalVotos : (totalVotos?.value ?? 0) }}</span>
      </div>
      
      <div class="grafico-controles">
        <div class="btn-group" role="group">
          <button 
            type="button" 
            class="btn btn-sm"
            :class="tipoGrafico === 'pie' ? 'btn-primary' : 'btn-outline-primary'"
            @click="cambiarTipoGrafico('pie')"
          >
            🥧 Torta
          </button>
          <button 
            type="button" 
            class="btn btn-sm"
            :class="tipoGrafico === 'bar' ? 'btn-primary' : 'btn-outline-primary'"
            @click="cambiarTipoGrafico('bar')"
          >
            📊 Barras
          </button>
        </div>
        <button 
          type="button" 
          class="btn btn-sm btn-success ms-2"
          @click="descargarGrafico"
        >
          💾 Descargar
        </button>
      </div>
    </div>

    <div class="grafico-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <div class="resultados-tabla">
      <h4 class="tabla-titulo">Detalle de resultados</h4>
      <div class="tabla-content">
        <div 
          v-for="opcion in opciones" 
          :key="opcion.id_opcion"
          class="tabla-fila"
        >
          <div class="fila-info">
            <div 
              class="fila-color" 
              :style="{ backgroundColor: opcion.color }"
            ></div>
            <span class="fila-nombre">{{ opcion.texto_opcion }}</span>
          </div>
          <div class="fila-stats">
            <span class="fila-votos">{{ resultados[opcion.id_opcion]?.votos || 0 }} votos</span>
            <span class="fila-porcentaje">
              {{ totalVotos > 0 ? ((resultados[opcion.id_opcion]?.votos || 0) / totalVotos * 100).toFixed(1) : 0 }}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grafico-container {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.grafico-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.total-votos {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.total-label {
  font-size: 1.1rem;
  color: #666;
  font-weight: 600;
}

.total-numero {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0057B7;
  background: linear-gradient(135deg, rgba(116, 172, 223, 0.2) 0%, rgba(0, 87, 183, 0.2) 100%);
  padding: 0.25rem 1rem;
  border-radius: 20px;
}

.grafico-controles {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #0057B7 0%, #74ACDF 100%);
  border: none;
}

.btn-outline-primary {
  border-color: #74ACDF;
  color: #0057B7;
}

.btn-outline-primary:hover {
  background-color: #74ACDF;
  border-color: #74ACDF;
}

.grafico-wrapper {
  max-width: 600px;
  margin: 0 auto 2rem;
  padding: 1rem;
}

.resultados-tabla {
  margin-top: 2rem;
  border-top: 2px solid #e9ecef;
  padding-top: 2rem;
}

.tabla-titulo {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0057B7;
  margin-bottom: 1rem;
}

.tabla-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tabla-fila {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.tabla-fila:hover {
  background-color: rgba(116, 172, 223, 0.1);
  transform: translateX(5px);
}

.fila-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.fila-color {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.fila-nombre {
  font-weight: 600;
  color: #333;
}

.fila-stats {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.fila-votos {
  font-weight: 600;
  color: #0057B7;
}

.fila-porcentaje {
  font-weight: 700;
  color: #74ACDF;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  min-width: 60px;
  text-align: center;
}

@media (max-width: 768px) {
  .grafico-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .grafico-controles {
    justify-content: center;
  }
  
  .tabla-fila {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .fila-stats {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
