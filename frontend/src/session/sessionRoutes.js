// Rutas de sesión para fácil importación en el router principal

export default [
  {
    path: '/login-redirect',
    name: 'LoginRedirect',
    component: () => import('./components/LoginRedirect.vue'),
    meta: { session: true }
  },
  {
    path: '/mi-perfil',
    name: 'MiPerfil',
    component: () => import('./components/MiPerfil.vue'),
    meta: { requiresAuth: true, session: true }
  },
  {
    path: '/registro-requerido',
    name: 'RegistroRequerido',
    component: () => import('./components/RegistroRequerido.vue'),
    meta: { session: true }
  }
];
