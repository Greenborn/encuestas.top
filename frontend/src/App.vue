<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
</script>

<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <RouterView />
    </main>
    <footer class="footer mt-5 py-3 bg-light">
      <div class="container text-center">
        <span class="text-muted">
          © 2025 Encuestas.top - 
          <a href="https://greenborn.com.ar/politica-privacidad.html" target="_blank" rel="noopener">Política de Privacidad</a> - 
          <a href="https://greenborn.com.ar/condiciones-servicio.html" target="_blank" rel="noopener">Condiciones de Servicio</a>
        </span>
      </div>
    </footer>
  </div>
</template>

<style>
.main-content {
  min-height: calc(100vh - 150px);
  padding-top: 80px;
}

.footer {
  border-top: 1px solid #dee2e6;
}
</style>
