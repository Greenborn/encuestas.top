<template>
  <div class="restringida-container">
    <div class="container">
      <div class="restringida-card">
        <div class="icon-section">
          🔒
        </div>
        <h1 class="titulo">Área Restringida</h1>
        <p class="mensaje">
          Esta función está disponible solo para usuarios registrados.<br>
          Por favor, registrate con tu cuenta de Google para continuar.
        </p>
        <button class="btn btn-primary btn-lg mb-4" @click="irARegistro">
          🔐 Ingresar con Google
        </button>
        <div class="info-section">
          <h3 class="info-titulo">¿Por qué necesito registrarme?</h3>
          <ul class="info-lista">
            <li>✅ Reportar mascotas perdidas o avistadas</li>
            <li>✅ Crear y gestionar tus publicaciones</li>
            <li>✅ Mejorar la seguridad y experiencia de la comunidad</li>
            <li>✅ Acceder a funciones exclusivas para miembros</li>
          </ul>
        </div>
        <div class="links-section">
          <p class="text-muted mb-2">
            Al registrarte, aceptás nuestros términos y condiciones
          </p>
          <div class="d-flex gap-3 justify-content-center flex-wrap">
            <a 
              href="https://greenborn.com.ar/politica-privacidad.html" 
              target="_blank" 
              rel="noopener"
              class="link-legal"
            >
              📋 Política de Privacidad
            </a>
            <span class="text-muted">|</span>
            <a 
              href="https://greenborn.com.ar/condiciones-servicio.html" 
              target="_blank" 
              rel="noopener"
              class="link-legal"
            >
              📜 Condiciones de Servicio
            </a>
          </div>
        </div>
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
.restringida-container {
  padding: 2rem 0 4rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
}

.restringida-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.icon-section {
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.titulo {
  font-size: 2.5rem;
  font-weight: 700;
  color: #0057B7;
  margin-bottom: 1rem;
}

.mensaje {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.btn-primary {
  background: linear-gradient(135deg, #0057B7 0%, #74ACDF 100%);
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0, 87, 183, 0.3);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 87, 183, 0.4);
}

.info-section {
  background: linear-gradient(135deg, rgba(116, 172, 223, 0.1) 0%, rgba(0, 87, 183, 0.1) 100%);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.info-titulo {
  font-size: 1.3rem;
  font-weight: 700;
  color: #0057B7;
  margin-bottom: 1rem;
}

.info-lista {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.info-lista li {
  font-size: 1.1rem;
  color: #333;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(116, 172, 223, 0.2);
}

.info-lista li:last-child {
  border-bottom: none;
}

.links-section {
  padding-top: 2rem;
  border-top: 1px solid #dee2e6;
}

.link-legal {
  color: #0057B7;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.link-legal:hover {
  color: #74ACDF;
  text-decoration: underline;
}

@media (max-width: 576px) {
  .restringida-card {
    padding: 2rem 1.5rem;
  }
  
  .titulo {
    font-size: 2rem;
  }
  
  .mensaje {
    font-size: 1rem;
  }
  
  .icon-section {
    font-size: 4rem;
  }
}
</style>
