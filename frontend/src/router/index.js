import { createRouter, createWebHashHistory } from 'vue-router'
import { sessionRoutes } from '../session';
import sessionModule from '../session/sessionModule';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'Inicio' }
  },
  {
    path: '/encuestas',
    name: 'EncuestasLista',
    component: () => import('@/views/EncuestasLista.vue'),
    meta: { title: 'Encuestas Públicas' }
  },
  {
    path: '/encuestas/nueva',
    name: 'EncuestaCrear',
    component: () => import('@/views/EncuestaCrear.vue'),
    meta: { title: 'Crear Encuesta', requiresAuth: true }
  },
  {
    path: '/encuestas/:id',
    name: 'EncuestaDetalle',
    component: () => import('@/views/EncuestaDetalle.vue'),
    meta: { title: 'Detalle de Encuesta' }
  },
  {
    path: '/encuestas/:id/resultados',
    name: 'EncuestaResultados',
    component: () => import('@/views/EncuestaDetalle.vue'),
    meta: { title: 'Resultados de Encuesta' }
  },
  {
    path: '/restringida',
    name: 'Restringida',
    component: () => import('@/views/Restringida.vue'),
    meta: { title: 'Área Restringida' }
  },
  // Rutas de sesión del módulo
  ...sessionRoutes,
  {
    path: '/login',
    name: 'Login',
    beforeEnter: () => {
      // Redirigir directamente al SSO de Google
      window.location.href = sessionModule.getSSOLoginUrl ? sessionModule.getSSOLoginUrl() : (import.meta.env.VITE_SSO_GOOGLE_URL || 'https://auth.greenborn.com.ar/auth/google');
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Guard global para rutas protegidas usando sessionModule
router.beforeEach((to, from, next) => {
  // Actualizar título de la página
  document.title = to.meta.title ? `${to.meta.title} - Encuestas.top` : 'Encuestas.top';
  // Verificar autenticación para rutas protegidas
  if (to.meta.requiresAuth && !sessionModule.isAuthenticated()) {
    // Guardar la URL de destino para redirigir después del login
    if (sessionModule.saveReturnUrl) {
      sessionModule.saveReturnUrl(to.fullPath);
    } else {
      localStorage.setItem('encuestas_top_return_url', to.fullPath);
    }
    // Redirigir a página de registro requerido
    next('/registro-requerido');
  } else {
    next();
  }
});

export default router
