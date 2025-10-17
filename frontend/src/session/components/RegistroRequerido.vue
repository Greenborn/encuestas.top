<template>
  <div class="container py-5">
    <div class="card mx-auto" style="max-width: 500px;">
      <div class="card-body text-center">
        <h2 class="card-title mb-3" style="color: #0d6efd;">¡Solo para Miembros!</h2>
        <p class="card-text mb-4">
          Para poder reportar la vista de una mascota perdida o registrar una búsqueda, primero necesitas registrarte. Es un proceso muy sencillo que demora solo unos segundos y solo necesitas una cuenta de Google.
        </p>
        <div class="alert alert-info mb-4">
          <strong>¿Por qué pedimos registro?</strong><br>
          Esto nos ayuda a mitigar publicaciones automatizadas y mejorar la experiencia de uso para todos.
        </div>
        <p class="mb-4">Haz clic en el botón de registro y sigue los pasos. ¡Así de fácil!</p>
        <button class="btn btn-primary btn-lg w-100" @click="irARegistro">
          Ingresar con Google
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import sessionModule from '../../session/sessionModule';
function irARegistro() {
  window.location.href = sessionModule.getSSOLoginUrl();
}
</script>
<style scoped>
.container {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card {
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.10);
  border-radius: 1rem;
}
</style>
