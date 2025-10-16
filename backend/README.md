# Backend API - Sistema de Encuestas

Backend completo para el sistema de encuestas con integración SSO, desarrollado con Node.js, Express y MariaDB.

## 🚀 Características

- **Autenticación SSO**: Integración con servicio de autenticación externo
- **Rate Limiting**: Protección contra spam y abuso
- **Base de datos**: MariaDB con migraciones Knex
- **Seguridad**: Helmet, CORS, validaciones
- **API RESTful**: Endpoints completos para encuestas, opciones, votos y estadísticas

## 📋 Requisitos

- Node.js >= 22.0.0
- MariaDB >= 10.5
- NPM o Yarn

## 🛠️ Instalación

1. **Clonar e instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
# Servidor
PORT=3001

# Base de datos MariaDB
DB_HOST=localhost
DB_PORT=3306
DB_NAME=encuestas_db
DB_USER=tu_usuario
DB_PASSWORD=tu_password

# Servicio SSO
SSO_SERVICE_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# Logs
LOG_LEVEL=info
```

3. **Configurar base de datos:**
```bash
# Ejecutar migraciones
npx knex migrate:latest

# (Opcional) Ejecutar seeds
npx knex seed:run
```

4. **Iniciar servidor:**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 API Endpoints

### 🏥 Health Check
```
GET /health
```

### 📊 Encuestas
```
POST   /api/encuestas              # Crear encuesta
GET    /api/encuestas              # Listar encuestas
GET    /api/encuestas/:id          # Obtener encuesta
DELETE /api/encuestas/:id          # Eliminar encuesta
```

### 🎯 Opciones de Encuesta
```
POST   /api/encuestas/:id/opciones           # Agregar opción
GET    /api/encuestas/:id/opciones           # Listar opciones
PUT    /api/encuestas/:id/opciones/:opcionId # Actualizar opción
DELETE /api/encuestas/:id/opciones/:opcionId # Eliminar opción
```

### 🗳️ Votación
```
POST /api/encuestas/:id/votar      # Votar en encuesta
GET  /api/encuestas/:id/resultados # Obtener resultados
```

### 👤 Usuario
```
GET /api/usuarios/mis-votos        # Historial de votos del usuario
```

### 📈 Estadísticas
```
GET /api/estadisticas/generales                    # Estadísticas del sistema
GET /api/estadisticas/encuesta/:id/detalladas      # Estadísticas de encuesta
GET /api/estadisticas/usuario/resumen              # Resumen del usuario
```

## 🔐 Autenticación

El sistema utiliza autenticación SSO. Incluir el token en el header:
```
Authorization: Bearer <token>
```

## 🛡️ Rate Limiting

- **General**: 100 requests/15 min
- **Votación**: 10 votos/15 min
- **Crear encuestas**: 5 encuestas/hora

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── controllers/          # Controladores de la API
│   │   ├── encuestasController.js
│   │   ├── opcionesController.js
│   │   ├── votosController.js
│   │   └── estadisticasController.js
│   ├── database/            # Configuración de base de datos
│   │   ├── migrations/      # Migraciones de BD
│   │   └── connection.js    # Conexión Knex
│   ├── middleware/          # Middlewares personalizados
│   │   ├── auth.js         # Autenticación SSO
│   │   └── rateLimiter.js  # Rate limiting
│   ├── routes/             # Definición de rutas
│   │   ├── encuestas.js
│   │   ├── usuarios.js
│   │   └── estadisticas.js
│   └── app.js              # Configuración Express
├── server.js               # Punto de entrada
├── knexfile.js            # Configuración Knex
├── package.json
└── README.md
```

## 🗄️ Esquema de Base de Datos

### Tabla: usuario
- `id_usuario` (VARCHAR, PK)
- `nombre` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `fecha_registro` (TIMESTAMP)

### Tabla: encuesta
- `id_encuesta` (INT, PK, AUTO_INCREMENT)
- `titulo` (VARCHAR)
- `descripcion` (TEXT)
- `fecha_creacion` (TIMESTAMP)
- `id_usuario` (VARCHAR, FK)
- `fecha_finalizacion` (TIMESTAMP)
- `resultado_preliminar` (JSON)

### Tabla: opcion_encuesta
- `id_opcion` (INT, PK, AUTO_INCREMENT)
- `id_encuesta` (INT, FK)
- `texto_opcion` (VARCHAR)
- `color` (VARCHAR)

### Tabla: voto_encuesta
- `id` (INT, PK, AUTO_INCREMENT)
- `id_opcion` (INT, FK)
- `id_encuesta` (INT, FK)
- `id_usuario` (VARCHAR, FK)
- `fecha_creacion` (TIMESTAMP)

## 🔧 Scripts Disponibles

```bash
npm start          # Iniciar en producción
npm run dev        # Iniciar en desarrollo con nodemon
npm run migrate    # Ejecutar migraciones
npm run rollback   # Revertir última migración
npm run seed       # Ejecutar seeds
```

## 🚨 Manejo de Errores

La API devuelve respuestas consistentes:

```json
{
  "success": true/false,
  "message": "Mensaje descriptivo",
  "data": { ... },
  "errors": [ ... ]
}
```

## 📝 Logs

Los logs incluyen:
- Timestamp
- Método HTTP
- Ruta
- IP del cliente
- Errores detallados

## 🔒 Seguridad

- Helmet para headers de seguridad
- CORS configurado
- Rate limiting por IP y usuario
- Validación de entrada con express-validator
- Sanitización de datos

## 🚀 Despliegue

1. Configurar variables de entorno de producción
2. Ejecutar migraciones en BD de producción
3. Iniciar con `npm start`
4. Configurar proxy reverso (nginx/apache)
5. Configurar SSL/TLS

## 📞 Soporte

Para reportar problemas o solicitar características, crear un issue en el repositorio del proyecto.