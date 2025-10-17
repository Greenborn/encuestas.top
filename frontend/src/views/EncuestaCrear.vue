<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import encuestasService from '@/services/encuestasService'
import sessionModule from '../session/sessionModule';
import { randomColor, isValidHexColor } from '@/utils/helpers'

const router = useRouter()

const formData = ref({
  titulo: '',
  descripcion: '',
  fecha_finalizacion: ''
})

const opciones = ref([
  { texto_opcion: '', color: randomColor() },
  { texto_opcion: '', color: randomColor() }
])

const loading = ref(false)
const error = ref(null)
const errors = ref({})

const agregarOpcion = () => {
  if (opciones.value.length >= 10) {
    alert('Máximo 10 opciones permitidas')
    return
  }
  opciones.value.push({
    texto_opcion: '',
    color: randomColor()
  })
}

const eliminarOpcion = (index) => {
  if (opciones.value.length <= 2) {
    alert('Debe haber al menos 2 opciones')
    return
  }
  opciones.value.splice(index, 1)
}

const validarFormulario = () => {
  errors.value = {}
  
  if (!formData.value.titulo.trim()) {
    errors.value.titulo = 'El título es requerido'
  }
  
  if (!formData.value.descripcion.trim()) {
    errors.value.descripcion = 'La descripción es requerida'
  }
  
  if (!formData.value.fecha_finalizacion) {
    errors.value.fecha_finalizacion = 'La fecha de cierre es requerida'
  } else {
    const fechaCierre = new Date(formData.value.fecha_finalizacion)
    if (fechaCierre <= new Date()) {
      errors.value.fecha_finalizacion = 'La fecha de cierre debe ser futura'
    }
  }
  
  opciones.value.forEach((opcion, index) => {
    if (!opcion.texto_opcion.trim()) {
      errors.value[`opcion_${index}`] = 'El texto de la opción es requerido'
    }
    if (!isValidHexColor(opcion.color)) {
      errors.value[`color_${index}`] = 'Color inválido'
    }
  })
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
    if (!sessionModule.isAuthenticated()) {
      if (sessionModule.saveReturnUrl) {
        sessionModule.saveReturnUrl('/encuestas/nueva');
      } else {
        localStorage.setItem('encuestas_top_return_url', '/encuestas/nueva');
      }
      router.push('/registro-requerido');
      return;
    }
  
  if (!validarFormulario()) {
    return
  }
  
  try {
    loading.value = true
    error.value = null
    
    const payload = {
      ...formData.value,
      opciones: opciones.value
    }
    
    const result = await encuestasService.crearEncuesta(payload)
    
    // Redirigir al detalle de la encuesta creada
    router.push(`/encuestas/${result.id_encuesta}`)
    
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al crear la encuesta. Por favor, intenta nuevamente.'
    console.error('Error creando encuesta:', err)
  } finally {
    loading.value = false
  }
}

const handleCancelar = () => {
  router.push('/encuestas')
}

// Configurar fecha mínima (hoy)
const minDate = new Date().toISOString().split('T')[0]
</script>

<template>
  <div class="encuesta-crear-container">
    <div class="container">
      <div class="crear-card">
        <div class="card-header">
          <h1 class="titulo">➕ Crear Nueva Encuesta</h1>
          <p class="subtitulo">Creá tu encuesta y compartila con el mundo</p>
        </div>

        <div class="card-body">
          <div v-if="error" class="alert alert-danger" role="alert">
            {{ error }}
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="mb-4">
              <label for="titulo" class="form-label fw-bold">Título *</label>
              <input
                id="titulo"
                v-model="formData.titulo"
                type="text"
                class="form-control form-control-lg"
                :class="{ 'is-invalid': errors.titulo }"
                placeholder="Ej: ¿Cuál es el mejor equipo de fútbol?"
                maxlength="200"
              >
              <div v-if="errors.titulo" class="invalid-feedback">
                {{ errors.titulo }}
              </div>
            </div>

            <div class="mb-4">
              <label for="descripcion" class="form-label fw-bold">Descripción *</label>
              <textarea
                id="descripcion"
                v-model="formData.descripcion"
                class="form-control"
                :class="{ 'is-invalid': errors.descripcion }"
                rows="4"
                placeholder="Describe tu encuesta..."
                maxlength="1000"
              ></textarea>
              <div v-if="errors.descripcion" class="invalid-feedback">
                {{ errors.descripcion }}
              </div>
            </div>

            <div class="mb-4">
              <label for="fecha_finalizacion" class="form-label fw-bold">Fecha de Cierre *</label>
              <input
                id="fecha_finalizacion"
                v-model="formData.fecha_finalizacion"
                type="datetime-local"
                class="form-control"
                :class="{ 'is-invalid': errors.fecha_finalizacion }"
                :min="minDate"
              >
              <div v-if="errors.fecha_finalizacion" class="invalid-feedback">
                {{ errors.fecha_finalizacion }}
              </div>
            </div>

            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <label class="form-label fw-bold mb-0">Opciones *</label>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-primary"
                  @click="agregarOpcion"
                  :disabled="opciones.length >= 10"
                >
                  ➕ Agregar Opción
                </button>
              </div>

              <div
                v-for="(opcion, index) in opciones"
                :key="index"
                class="opcion-item mb-3"
              >
                <div class="row g-2">
                  <div class="col-md-8">
                    <input
                      v-model="opcion.texto_opcion"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': errors[`opcion_${index}`] }"
                      :placeholder="`Opción ${index + 1}`"
                      maxlength="200"
                    >
                    <div v-if="errors[`opcion_${index}`]" class="invalid-feedback">
                      {{ errors[`opcion_${index}`] }}
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="input-group">
                      <input
                        v-model="opcion.color"
                        type="color"
                        class="form-control form-control-color"
                        :class="{ 'is-invalid': errors[`color_${index}`] }"
                        title="Elige un color"
                      >
                      <input
                        v-model="opcion.color"
                        type="text"
                        class="form-control"
                        placeholder="#FFFFFF"
                        maxlength="7"
                      >
                    </div>
                  </div>
                  <div class="col-md-1">
                    <button
                      v-if="opciones.length > 2"
                      type="button"
                      class="btn btn-outline-danger w-100"
                      @click="eliminarOpcion(index)"
                      title="Eliminar opción"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="alert alert-info">
              <strong>💡 Tip:</strong> Asegurate de que las opciones sean claras y las fechas de cierre realistas.
            </div>

            <div class="d-flex gap-3 justify-content-end">
              <button
                type="button"
                class="btn btn-outline-secondary btn-lg"
                @click="handleCancelar"
                :disabled="loading"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary btn-lg"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Creando...' : '✅ Crear Encuesta' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.encuesta-crear-container {
  padding: 2rem 0 4rem;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.crear-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;
}

.card-header {
  background: linear-gradient(135deg, #74ACDF 0%, #0057B7 100%);
  color: white;
  padding: 2.5rem;
  text-align: center;
}

.titulo {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitulo {
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.95;
}

.card-body {
  padding: 2.5rem;
}

.form-label {
  color: #0057B7;
  margin-bottom: 0.5rem;
}

.form-control:focus {
  border-color: #74ACDF;
  box-shadow: 0 0 0 0.2rem rgba(116, 172, 223, 0.25);
}

.opcion-item {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.opcion-item:hover {
  border-color: #74ACDF;
}

.form-control-color {
  width: 60px;
  height: 38px;
  padding: 0.25rem;
}

.btn-primary {
  background: linear-gradient(135deg, #0057B7 0%, #74ACDF 100%);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 87, 183, 0.3);
}

@media (max-width: 768px) {
  .titulo {
    font-size: 1.8rem;
  }
  
  .card-header,
  .card-body {
    padding: 1.5rem;
  }
  
  .d-flex.gap-3 {
    flex-direction: column;
  }
  
  .d-flex.gap-3 .btn {
    width: 100%;
  }
}
</style>
