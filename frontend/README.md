# Encuestas.top - Frontend

Frontend de la miniaplicación de encuestas públicas desarrollado con Vue 3, Bootstrap 5 y Vite.

## 🚀 Características

- ✅ Vue 3 con Composition API
- ✅ Bootstrap 5 para diseño responsivo
- ✅ Vue Router con hash mode
- ✅ Axios para consumo de API REST
- ✅ Chart.js para visualización de resultados
- ✅ Integración con SSO de Google
- ✅ Diseño con colores de bandera argentina

## 📋 Requisitos

- Node.js >= 18.x
- npm o yarn

## 🔧 Instalación

1. Instalar dependencias:

```bash
npm install
```

2. Copiar el archivo de configuración:

```bash
cp .env.example .env
```

3. Configurar las variables de entorno en `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_URL_SSO_SERVICE=https://auth.greenborn.com.ar
VITE_SSO_GOOGLE_URL=https://auth.greenborn.com.ar/auth/google
```

## 🏃 Desarrollo

Iniciar servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 🏗️ Compilación

Para crear una versión de producción:

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`

## 👀 Vista Previa de Producción

Para previsualizar la versión compilada:

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── assets/         # Estilos y recursos
│   │   └── styles/
│   │       └── main.css
│   ├── components/     # Componentes reutilizables
│   │   ├── layout/
│   │   │   └── NavBar.vue
│   │   ├── EncuestaCard.vue
│   │   ├── VotarModal.vue
│   │   ├── GraficoResultados.vue
│   │   └── CompartirModal.vue
│   ├── config/         # Configuraciones
│   │   └── axios.js
│   ├── router/         # Configuración de rutas
│   │   └── index.js
│   ├── services/       # Servicios de API
│   │   └── encuestasService.js
│   ├── utils/          # Utilidades
│   │   ├── session.js
│   │   └── helpers.js
│   ├── views/          # Vistas/Páginas
│   │   ├── Home.vue
│   │   ├── EncuestasLista.vue
│   │   ├── EncuestaDetalle.vue
│   │   ├── EncuestaCrear.vue
│   │   └── Restringida.vue
│   ├── App.vue         # Componente raíz
│   └── main.js         # Punto de entrada
├── .env.example        # Variables de entorno de ejemplo
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 Diseño

El diseño utiliza los colores de la bandera argentina:
- **Celeste**: #74ACDF
- **Azul**: #0057B7
- **Blanco**: #FFFFFF

## 🛣️ Rutas

- `/` - Página de inicio (Landing)
- `/encuestas` - Listado de encuestas públicas
- `/encuestas/nueva` - Crear nueva encuesta (requiere autenticación)
- `/encuestas/:id` - Detalle de encuesta
- `/encuestas/:id/resultados` - Resultados de encuesta
- `/restringida` - Vista de área restringida
- `/login` - Redirección a SSO de Google

## 🔐 Autenticación

La autenticación se realiza mediante SSO de Google a través del servicio externo:
- URL de autenticación: `https://auth.greenborn.com.ar/auth/google`
- Se utiliza JWT para mantener la sesión
- El `unique_id` se genera automáticamente y se almacena en localStorage

## 💾 LocalStorage

El frontend utiliza las siguientes claves en localStorage:
- `encuestas_top_unique_id` - ID único del usuario
- `encuestas_top_jwt_token` - Token JWT de autenticación
- `encuestas_top_user_data` - Datos del usuario autenticado
- `encuestas_top_return_url` - URL de retorno después del login

## 📦 Dependencias Principales

- **vue**: Framework JavaScript reactivo
- **vue-router**: Enrutamiento para Vue
- **axios**: Cliente HTTP
- **bootstrap**: Framework CSS
- **chart.js**: Gráficos interactivos
- **html2canvas**: Captura de pantalla para compartir

## 🔄 Integración con Backend

El frontend consume los siguientes endpoints del backend:

### Encuestas
- `GET /api/encuestas` - Listar encuestas
- `POST /api/encuestas` - Crear encuesta
- `GET /api/encuestas/:id` - Obtener detalle
- `DELETE /api/encuestas/:id` - Eliminar encuesta

### Opciones
- `GET /api/encuestas/:id/opciones` - Listar opciones
- `POST /api/encuestas/:id/opciones` - Agregar opción

### Votos
- `POST /api/encuestas/:id/votar` - Votar
- `GET /api/encuestas/:id/resultados` - Obtener resultados

## 🌐 Compatibilidad

- Chrome/Edge (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Diseño responsivo para móviles, tablets y desktop

## 📝 Notas de Desarrollo

- Se usa Composition API con `<script setup>`
- Vue Router configurado con hash mode (`#`)
- Todos los componentes son responsivos
- El menú móvil se cierra automáticamente al seleccionar una opción
- Rate limiting manejado por el backend
- Validación de formularios en cliente y servidor

## 🤝 Contribución

Para contribuir al proyecto:

1. Crear una rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commit de los cambios: `git commit -m 'Agregar nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear un Pull Request

## 📄 Licencia

Este proyecto es propiedad de Greenborn.

---

Desarrollado con ❤️ por Greenborn - 2025
