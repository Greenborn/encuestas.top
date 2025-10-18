# Backend
El presente documento define la estructura base del backend, de miniaplicación de publicación de encuestas publicas

## Tecnologías
- Lenguaje: NodeJS (version minima 22)
- Framework: Express
- Base de Datos: MariaDB gestionada con Knex
- Librerías Extras: Axios
- express-rate-limit para configurar maxima cantidad de votos por ventana de tiempo

## Base de datos
A continuación se definen las tablas principales para la gestión de encuestas y votos:

### Tabla: usuario
- id_usuario (INT, PK, AI)
- nombre (VARCHAR)
- password_hash (VARCHAR)
- fecha_registro (DATETIME)

### Tabla: encuesta
- id_encuesta (INT, PK, AI)
- titulo (VARCHAR)
- descripcion (TEXT)
- fecha_creacion (DATETIME)
- id_usuario (INT, FK -> usuario.id_usuario) //usuario que creo la encuesta
- fecha_finalizacion (DATETIME) 
- resultado_preliminar (JSON) //json que resume la cantidad de votos para cada opcion

### Tabla: opcion_encuesta
- id_opcion (INT, PK, AI)
- id_encuesta (INT, FK -> encuesta.id_encuesta)
- texto_opcion (VARCHAR)
- color (VARCHAR) //se especifica codigo de color en hexadecimal

### Tabla: voto_encuesta
- id (INT, PK, AI)
- id_opcion (INT, FK -> opcion_encuesta.id_opcion)
- id_encuesta (INT, FK -> encuesta.id_encuesta) 
- id_usuario (INT, FK -> usuario.id_usuario) //usuario que vota
- fecha_creacion (DATETIME)

> PK = Primary Key, AI = Auto Increment, FK = Foreign Key

## Configuraciones
Las configuraciones se definiran en .env
No olvides agregar .gitignore
No olvides agregar .env.example

los parametros a configuragar en .env son:
- puerto escucha
- servidor base de datos
- nombre base de datos
- usuario base de datos
- contraseña usuario base de datos
- url servicio de autenticacion
- url de servicio rate limit

## Endpoints
A continuación se definen los principales endpoints REST para la gestión de usuarios, encuestas, opciones y votos:

### Usuarios
- Se modulo sso_general, se debe usar midleware de autenticacion, por lo que el manejo de sesiones esta delegado en servicio externo

### Encuestas
- `POST /api/encuestas` — Crear nueva encuesta - auth requerida espera query param unique_id
- `GET /api/encuestas` — Listar encuestas públicas - auth optativa espera query param unique_id sino se recibe se supone que esta en vista publica, en caso de tener sesion se debe indicar si el usuario actuial esta habilitado para votar (solo se puede votar una vez por usuario)
- `GET /api/encuestas/:id` — Obtener detalles de una encuesta
- `DELETE /api/encuestas/:id` — Eliminar encuesta (solo propietario) - auth requerida espera query param unique_id

### Opciones de encuesta
- `POST /api/encuestas/:id/opciones` — Agregar opción a encuesta (solo propietario)  - auth requerida espera query param unique_id
- `GET /api/encuestas/:id/opciones` — Listar opciones de una encuesta

### Votos
- `POST /api/encuestas/:id/votar` — Votar por una opción en una encuesta - auth requerida espera query param unique_id  se aplica rate limit
- `GET /api/encuestas/:id/resultados` — Obtener resultados de la encuesta

Cada endpoint requiere autenticación JWT excepto los de registro, login y consulta pública de encuestas/resultados.
