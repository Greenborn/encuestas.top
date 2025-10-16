
# Frontend
Miniaplicación de encuestas públicas, con interacción social. El diseño y estructura se alinean con el backend y los siguientes lineamientos:

## Estilo General
- Layout limpio y moderno, predominando colores azul bandera argentina (#74ACDF, #0057B7, blanco y variantes suaves).
- Diseño responsivo y accesible usando Bootstrap 5.
- Tipografía clara y legible.

## Vistas Principales

### 1. Home (Landing Page)
- Explica el objetivo general del sitio: opción divertida para votar sobre diferentes temas y polemizar entre plataformas.
- Invita al usuario a ver encuestas disponibles, crear una encuesta o participar en votaciones.
- Botones destacados para: "Ver encuestas", "Crear encuesta", "Participar".
- Estilo visual atractivo, predominando azul bandera argentina.

### 2. Listado de Encuestas
- Muestra todas las encuestas públicas en cards.
- En la parte superior incluye:
	- Buscador (filtra por título o descripción)
	- Botón para agregar nueva encuesta
- Cada card muestra:
	- Título
	- Descripción
	- Resultados preliminares (cantidad de votos por opción)
	- Botones para ver detalle y para votar
- Al votar:
	- Se abre un modal con las opciones de votación
	- Tras votar, el botón de votación se deshabilita (solo se puede votar una vez por encuesta)

### 3. Creación de Encuesta
- Permite definir:
	- Título
	- Descripción
	- Fecha de cierre
	- Opciones de votación (texto y color para cada una)
- Botón de guardar encuesta
- Tras crear la encuesta, redirige a la página de detalle de la misma

### 4. Detalle de Encuesta
- Muestra:
	- Título
	- Descripción
	- Resultados de la encuesta
	- Fecha de cierre
	- Gráfico de resultados (por defecto gráfico de torta, opción para cambiar a gráfico de barras)
- Opciones para compartir:
	- Compartir por enlace
	- Compartir como imagen
	- Descargar imagen del gráfico

### 5. Área Restringida
- Vista que se muestra si el usuario intenta acceder a una función/vista solo para usuarios registrados sin sesión activa
- Mensaje aclarando que la función/vista es solo para usuarios con sesión iniciada
- Enlaces a:
	- [Política de Privacidad](https://greenborn.com.ar/politica-privacidad.html)
	- [Condiciones de Servicio](https://greenborn.com.ar/condiciones-servicio.html)

## Autenticación
- Botón destacado para iniciar sesión con Google, redirige a: [https://auth.greenborn.com.ar/auth/google](https://auth.greenborn.com.ar/auth/google)


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
- Parámetros de autenticación SSO


## Layout
### Menú superior
Menú de Bootstrap 5, con:
- Opción para ver home (página por defecto)
- Opción para ver listado de encuestas públicas
- Opción para crear nueva encuesta (solo usuarios autenticados)
- Opción para iniciar sesión/cerrar sesión (integración con SSO)



## Rutas principales
- `/` — Home (Landing Page)
- `/encuestas` — Listado de encuestas públicas
- `/encuestas/nueva` — Formulario para crear encuesta
- `/encuestas/:id` — Detalle de encuesta y opciones de votación
- `/encuestas/:id/resultados` — Resultados de la encuesta
- `/login` — Redirección a SSO
- `/restringida` — Vista de área restringida



## Manejo de sesiones
- Las sesiones se manejan definiendo un unique_id que se regenera en caso de no tener sesión abierta o no existir en el local storage, usando un uuid. La clave donde se almacenará es `encuestas_top_unique_id`.



## Notas mínimas de integración
- Usar Axios para consumir los endpoints REST definidos en el backend
- Los componentes deben usar Composition API y `script setup`
- El frontend debe validar la autenticación antes de permitir acciones protegidas
- El diseño debe ser responsivo usando Bootstrap 5
- Compartir encuestas y resultados mediante enlaces públicos
- Asegurarse que el menú Bootstrap se pueda abrir y cerrar correctamente en dispositivos móviles y que luego de elegir una opción las opciones del menú se oculten automáticamente
- En localStorage se usará prefijo `encuestas_top` para todas las claves
- En localStorage se llevará registro de url anterior para redireccionar luego de registro con servicio SSO, ya que cuando se intenta ingresar a zona de usuario sin estar logueado se debe guardar la ubicación de la zona restringida, redirigir a servicio SSO y a la vuelta en caso exitoso luego de verificarse la sesión lleva a la zona restringida
