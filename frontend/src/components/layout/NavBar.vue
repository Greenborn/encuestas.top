<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import sessionModule from '../../session/sessionModule';

const router = useRouter()
const isAuth = ref(false)
const userData = ref(null)
const userPhoto = ref('')
const showMobileMenu = ref(false)

const updateAuthStatus = () => {
  isAuth.value = sessionModule.isAuthenticated();
  const session = sessionModule.getSessionData ? sessionModule.getSessionData() : null;
  // El objeto puede ser { usuario, usuario_id, token, uniqueId }
  const user = session && (session.usuario || session.user);
  userData.value = user || null;
  if (user && user.profile_img_base64) {
    userPhoto.value = `data:image/jpeg;base64,${user.profile_img_base64}`;
  } else {
    userPhoto.value = '';
  }
}

const handleLogout = () => {
  if (sessionModule.logout) sessionModule.logout();
  updateAuthStatus();
  closeMobileMenu();
  router.push('/');
}

const handleLogin = () => {
  if (sessionModule.saveReturnUrl) {
    sessionModule.saveReturnUrl(router.currentRoute.value.fullPath);
  } else {
    localStorage.setItem('encuestas_top_return_url', router.currentRoute.value.fullPath);
  }
  window.location.href = sessionModule.getSSOLoginUrl();
}

const handleCreateEncuesta = () => {
  if (!isAuth.value) {
    if (sessionModule.saveReturnUrl) {
      sessionModule.saveReturnUrl('/encuestas/nueva');
    } else {
      localStorage.setItem('encuestas_top_return_url', '/encuestas/nueva');
    }
    router.push('/registro-requerido');
  } else {
    router.push('/encuestas/nueva');
  }
  closeMobileMenu();
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
  const navbarCollapse = document.getElementById('navbarNav')
  if (navbarCollapse && navbarCollapse.classList.contains('show')) {
    const bsCollapse = window.bootstrap.Collapse.getInstance(navbarCollapse)
    if (bsCollapse) {
      bsCollapse.hide()
    }
  }
}

const navigateTo = (path) => {
  router.push(path)
  closeMobileMenu()
}

onMounted(() => {
  updateAuthStatus()
  // Escuchar eventos de storage para sincronizar entre pestañas
  window.addEventListener('storage', updateAuthStatus)
  // Escuchar evento personalizado de login/logout (genérico)
  window.addEventListener('app_encuestas_login', updateAuthStatus)
  window.addEventListener('app_encuestas_logout', updateAuthStatus)
})

onUnmounted(() => {
  window.removeEventListener('storage', updateAuthStatus)
  window.removeEventListener('app_encuestas_login', updateAuthStatus)
  window.removeEventListener('app_encuestas_logout', updateAuthStatus)
})
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top shadow-sm">
    <div class="container">
      <router-link to="/" class="navbar-brand d-flex align-items-center" @click="closeMobileMenu">
        <span class="brand-icon">📊</span>
        <span class="brand-text">Encuestas<span class="brand-dot">.top</span></span>
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav" 
        aria-controls="navbarNav" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a 
              class="nav-link" 
              href="#" 
              @click.prevent="navigateTo('/')"
            >
              🏠 Inicio
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="nav-link" 
              href="#" 
              @click.prevent="navigateTo('/encuestas')"
            >
              📋 Encuestas
            </a>
          </li>
          <li class="nav-item">
            <a 
              class="nav-link" 
              href="#" 
              @click.prevent="handleCreateEncuesta"
            >
              ➕ Crear Encuesta
            </a>
          </li>
          <li class="nav-item">
            <a 
              v-if="!isAuth" 
              class="nav-link btn-login" 
              href="#" 
              @click.prevent="handleLogin"
            >
              🔐 Iniciar Sesión
            </a>
            <div v-else class="nav-link dropdown d-flex align-items-center">
              <a
                class="dropdown-toggle text-decoration-none d-flex align-items-center"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span v-if="userPhoto" class="profile-img me-2">
                  <img :src="userPhoto" alt="Foto de perfil" />
                </span>
                {{ userData?.nombre || userData?.name || 'Usuario' }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                    🚪 Cerrar Sesión
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
  border-bottom: 3px solid #74ACDF;
}

.brand-icon {
  font-size: 1.8rem;
  margin-right: 0.5rem;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0057B7;
}

.brand-dot {
  color: #74ACDF;
}

.nav-link {
  font-weight: 500;
  color: #333;
  transition: all 0.3s ease;
  margin: 0 0.25rem;
  padding: 0.5rem 1rem !important;
}

.nav-link:hover {
  color: #0057B7;
  background-color: rgba(116, 172, 223, 0.1);
  border-radius: 0.375rem;
}

.btn-login {
  background: linear-gradient(135deg, #0057B7 0%, #74ACDF 100%);
  color: white !important;
  border-radius: 0.375rem;
  padding: 0.5rem 1.5rem !important;
}

.btn-login:hover {
  background: linear-gradient(135deg, #004494 0%, #5a93c8 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 87, 183, 0.3);
}

.dropdown-menu {
  border: 1px solid #74ACDF;
}

.dropdown-item:hover {
  background-color: rgba(116, 172, 223, 0.1);
  color: #0057B7;
}

.profile-img img {
  width: 2rem;
  height: 2rem;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #74ACDF;
  background: #fff;
  display: block;
}

@media (max-width: 991px) {
  .nav-link {
    margin: 0.25rem 0;
  }
  
  .btn-login {
    margin-top: 0.5rem;
  }
}
</style>
