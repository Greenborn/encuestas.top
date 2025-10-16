# Frontend
Miniaplicacion de encuestas, con interacción social
- Los usuarios públicos se registrarán con cuenta de Google, usando servicio SSO propio
- Los usuarios registrados podrán publicar encuestas
- Los usuarios públicos podrán consultar encuestas
- Los usuarios registrados podrán votar en la encuesta (rate limit por usuario)
- Los usuarios públicos podrán compartir la encuesta y su resultado

## Tecnologías
- Lenguaje: JavaScript - se prohibe el uso de TypeScript (Wakala)
- Framework: Vue3, Bootstrap 5
- Librerías Extras: Axios - OpenLayers
- Componentes: se debe usar composition API con "script setup"
- Opciones extras: usa # routes

## Integración con Backend
- El frontend consumirá los endpoints REST definidos en el backend para encuestas, opciones y votos.
- La autenticación se realiza mediante SSO y JWT, delegando el manejo de sesiones al servicio externo.
- Los endpoints protegidos requieren el parámetro `unique_id` y JWT.
- El endpoint de votación aplica rate limit por usuario (configurable desde backend).

## Configuraciones mínimas
- URL base del backend
- Clave de API para OpenLayers (si aplica)
- Parámetros de autenticación SSO

## Layout
### Menú superior
Menú de Bootstrap 5, con:
- Opción para ver listado de encuestas públicas
- Opción para crear nueva encuesta (solo usuarios autenticados)
- Opción para votar en encuesta (solo usuarios autenticados)
- Opción para ver resultados de encuesta
- Opción para compartir encuesta/resultados
- Opción para iniciar sesión/cerrar sesión (integración con SSO)

## Rutas principales
- `/encuestas` — Listado de encuestas públicas
- `/encuestas/nueva` — Formulario para crear encuesta
- `/encuestas/:id` — Detalle de encuesta y opciones de votación
- `/encuestas/:id/resultados` — Resultados de la encuesta
- `/login` — Redirección a SSO

## Notas mínimas de integración
- Usar Axios para consumir los endpoints REST definidos en el backend
- Los componentes deben usar Composition API y `script setup`
- El frontend debe validar la autenticación antes de permitir acciones protegidas
- El diseño debe ser responsivo usando Bootstrap 5
- Compartir encuestas y resultados mediante enlaces públicos
