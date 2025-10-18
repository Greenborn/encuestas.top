<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}
</script>

<template>
  <div class="home-container">
    <div class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h1 class="hero-title">
              Votá y Polemizá 🗳️
            </h1>
            <p class="hero-subtitle">
              La forma más divertida de crear encuestas, votar sobre diferentes temas 
              y compartir tu opinión con el mundo.
              <br><br><small class="greenborn-credit">Un desarrollo de <a href="https://greenborn.com.ar" target="_blank" class="greenborn-link">Greenborn Software</a></small>
            </p>
            <div class="hero-buttons">
              <button 
                class="btn btn-primary btn-lg me-3 mb-3" 
                @click="navigateTo('/encuestas')"
              >
                📋 Ver Encuestas
              </button>
              <button 
                class="btn btn-outline-primary btn-lg mb-3" 
                @click="navigateTo('/encuestas/nueva')"
              >
                ➕ Crear Encuesta
              </button>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-illustration">
              <div class="illustration-card">
                📊
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2 class="text-center mb-5">¿Cómo funciona?</h2>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">🔍</div>
              <h3 class="feature-title">Explorá</h3>
              <p class="feature-text">
                Descubrí encuestas públicas sobre temas variados. 
                Desde deportes hasta política, hay algo para todos.
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">🗳️</div>
              <h3 class="feature-title">Votá</h3>
              <p class="feature-text">
                Expresá tu opinión votando en las encuestas que más te interesen. 
                Tu voz cuenta y puede marcar la diferencia.
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">📢</div>
              <h3 class="feature-title">Compartí</h3>
              <p class="feature-text">
                Compartí encuestas con tus amigos y en redes sociales. 
                Generá debate y conocé diferentes opiniones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <div class="container text-center">
        <h2 class="cta-title">¿Listo para participar?</h2>
        <p class="cta-text">
          Creá tu propia encuesta en minutos y empezá a recibir votos.
        </p>
        <button 
          class="btn btn-light btn-lg" 
          @click="navigateTo('/encuestas/nueva')"
        >
          Crear mi primera encuesta 🚀
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #74ACDF 0%, #0057B7 100%);
  color: white;
  padding: 100px 0 80px;
  margin-top: -80px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.3rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  line-height: 1.6;
}

.hero-buttons .btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.hero-buttons .btn-primary {
  background-color: white;
  color: #0057B7;
  border: none;
}

.hero-buttons .btn-primary:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.hero-buttons .btn-outline-primary {
  border-color: white;
  color: white;
}

.hero-buttons .btn-outline-primary:hover {
  background-color: white;
  color: #0057B7;
  transform: translateY(-2px);
}

.hero-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}

.illustration-card {
  background: white;
  border-radius: 20px;
  padding: 60px;
  font-size: 10rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.features-section {
  padding: 80px 0;
  background-color: #f8f9fa;
}

.feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 24px rgba(0, 87, 183, 0.2);
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0057B7;
  margin-bottom: 1rem;
}

.feature-text {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.cta-section {
  background: linear-gradient(135deg, #0057B7 0%, #74ACDF 100%);
  color: white;
  padding: 80px 0;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-text {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.95;
}

.cta-section .btn-light {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cta-section .btn-light:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

@media (max-width: 991px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .illustration-card {
    font-size: 6rem;
    padding: 40px;
    margin-top: 40px;
  }
}

@media (max-width: 576px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-buttons .btn {
    display: block;
    width: 100%;
  }
}


/* Estilos para el crédito de Greenborn */
.greenborn-credit {
  font-size: 0.85em;
}
.greenborn-link {
  color: #5fee0c;
  text-decoration: underline;
  font-size: 0.95em;
}
/* Opcional: color más oscuro al pasar el mouse */
.greenborn-link:hover {
  color: #dfc21c;
}
</style>