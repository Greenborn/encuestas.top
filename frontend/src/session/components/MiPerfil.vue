<template>
  <div>
  <h1 class="mb-4 text-center">Mi Perfil</h1>
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Información del Usuario</h5>
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
        <div v-else>
          <p class="card-text">
            <strong>Nombre:</strong> {{ usuario.name || 'No disponible' }}
          </p>
          <p class="card-text">
            <strong>Email:</strong> {{ usuario.email || 'No disponible' }}
          </p>
          <p class="card-text">
            <strong>Teléfono:</strong> {{ usuario.telefono || 'No disponible' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import sessionModule from '../../session/sessionModule'
const usuario = ref({
  nombre: 'Usuario Demo',
  email: 'usuario@ejemplo.com',
  telefono: '+54 11 1234-5678'
})
const loading = ref(false)
const cargarPerfil = async () => {
  loading.value = true;
  try {
    const session = sessionModule.getSessionData();
    if (session && session.usuario_id && session.usuario) {
      usuario.value = session.usuario;
    }
  } catch (err) {
    console.error('Error al cargar perfil desde sessionModule:', err);
  } finally {
    loading.value = false;
  }
}
onMounted(() => {
  const session = sessionModule.getSessionData();
  if (session && session.usuario_id && session.usuario) {
    usuario.value = session.usuario;
  }
  cargarPerfil();
});
</script>
<style scoped>
h1 {
  color: #0d6efd;
}
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}
</style>
