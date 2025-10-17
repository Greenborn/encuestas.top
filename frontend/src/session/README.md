# Módulo de Sesión Frontend

Este módulo encapsula la gestión de sesión y autenticación en la aplicación Vue, integrando Single Sign-On (SSO), manejo de tokens, y vistas protegidas. Está diseñado para ser extensible, seguro y fácil de mantener.

---

## Estructura de Archivos

```
src/session/
  components/
    LoginRedirect.vue         # Redirección y gestión de login SSO
    MiPerfil.vue              # Vista de perfil de usuario autenticado
    RegistroRequerido.vue     # Solicitud de registro previo a acciones protegidas
  sessionRoutes.js            # Rutas de sesión para el router principal
  index.js                    # Barril de exportación
  README.md                   # Documentación del módulo
```

---

## Integración en el Router Principal

Importa las rutas de sesión y agrégalas al array de rutas de Vue Router:

```js
// src/router/index.js
import { sessionRoutes } from '../session';

const routes = [
  // ...otras rutas...
  ...sessionRoutes,
  // ...otras rutas...
];
```

---

## Componentes

### 1. LoginRedirect.vue

- **Función:** Procesa la autenticación SSO, guarda la sesión y redirige al usuario.
- **Props:** No requiere props.
- **Eventos:** Muestra mensajes de éxito/error según el resultado de autenticación.
- **Flujo:** Lee parámetros de la URL (`token`, `unique_id`), llama al endpoint de login, guarda la sesión y redirige.

### 2. MiPerfil.vue

- **Función:** Muestra información del usuario autenticado.
- **Props:** No requiere props.
- **Datos:** Obtiene el usuario desde `sessionModule.getSessionData()`.
- **Eventos:** Carga el perfil al montar el componente.

### 3. RegistroRequerido.vue

- **Función:** Solicita registro antes de acceder a acciones protegidas.
- **Props:** No requiere props.
- **Acción:** Botón que redirige al login SSO usando `sessionModule.getSSOLoginUrl()`.

---

## sessionModule.js

Módulo agnóstico para gestión de sesión:

- **Configuración:**  
  - `setConfig({ ssoUrl, appBaseUrl, storagePrefix })`
- **Gestión de sesión:**  
  - `saveSession({ bearer_token, expires_at, user })`
  - `clearSession()`
  - `getSessionData()`
  - `isAuthenticated()`
- **SSO:**  
  - `getSSOUrl()`
  - `getSSOLoginUrl()`
  - `verificarSesion()`
  - `logout()`
- **Interceptors:**  
  - `initSessionInterceptors(api)` para Axios

---

## Ejemplo de Configuración

```js
import sessionModule from './services/sessionModule';

sessionModule.setConfig({
  ssoUrl: 'https://sso.misitio.com',
  appBaseUrl: 'https://app.misitio.com',
  storagePrefix: 'app_mascotas_',
});
```

---

## Flujos de Autenticación

1. **Login SSO:**  
   - Usuario hace clic en "Ingresar con Google".
   - Redirige a SSO, retorna a `/login-redirect` con `token` y `unique_id`.
   - `LoginRedirect.vue` procesa el login y guarda la sesión.

2. **Verificación de sesión:**  
   - `sessionModule.verificarSesion()` valida el token con el backend SSO.

3. **Logout:**  
   - `sessionModule.logout()` elimina la sesión local y llama al endpoint SSO.

---

## Seguridad

- Tokens y datos de usuario se almacenan en `localStorage` con prefijo configurable.
- Todas las rutas protegidas requieren autenticación (`meta.requiresAuth`).
- Los endpoints SSO usan `Bearer token` y `unique_id` para mayor seguridad.

---

## Extensibilidad

- Puedes agregar más vistas de sesión en `components/` y rutas en `sessionRoutes.js`.
- El módulo es compatible con cualquier framework JS/TS que use localStorage y fetch/Axios.

---

## Ejemplo de Uso Avanzado

### Proteger una ruta personalizada

```js
{
  path: '/mi-area-privada',
  name: 'AreaPrivada',
  component: AreaPrivada,
  meta: { requiresAuth: true }
}
```

En el guard de router:

```js
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !sessionModule.isAuthenticated()) {
    next('/registro-requerido');
  } else {
    next();
  }
});
```

---

## Props, Eventos y Métodos de Componentes

### LoginRedirect.vue

- **Props:** Ninguna
- **Métodos internos:**  
  - Procesa login SSO, guarda sesión, redirige.
- **Eventos:**  
  - Mensaje de éxito/error en pantalla.

### MiPerfil.vue

- **Props:** Ninguna
- **Datos:**  
  - `usuario`: Obtenido de sesión.
- **Eventos:**  
  - Carga perfil al montar.

### RegistroRequerido.vue

- **Props:** Ninguna
- **Métodos internos:**  
  - `irARegistro()`: Redirige a SSO.

---

## Ejemplo de Interceptor Axios

```js
import axios from 'axios';
import sessionModule from './services/sessionModule';

const api = axios.create({ baseURL: '/api' });
sessionModule.initSessionInterceptors(api);
```

---

## Manejo de Errores

- Todos los componentes muestran mensajes claros ante errores de autenticación o conexión.
- El módulo expone eventos para login/logout que pueden ser escuchados globalmente.

---

## Referencias y Enlaces

- [Vue Router Docs](https://router.vuejs.org/)
- [Single Sign-On (SSO) Conceptos](https://auth0.com/docs/get-started/authentication-and-authorization-flow/sso)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)

---