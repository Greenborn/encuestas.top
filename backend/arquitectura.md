# Backend
El presente documento define la estructura base del backend, de miniaplicación de publicación de encuestas publicas

## Tecnologías
- Lenguaje: NodeJS (version minima 22)
- Framework: Express
- Base de Datos: MariaDB gestionada con Knex
- Librerías Extras: Axios

## Base de datos
A continuación se definen las tablas principales para la gestión de encuestas y votos:

### Tabla: usuario
- id_usuario (INT, PK, AI)
- nombre (VARCHAR)
- email (VARCHAR, único)
- password_hash (VARCHAR)
- fecha_registro (DATETIME)

### Tabla: encuesta
- id_encuesta (INT, PK, AI)
- titulo (VARCHAR)
- descripcion (TEXT)
- fecha_creacion (DATETIME)
- id_usuario (INT, FK -> usuario.id_usuario) //usuario que creo la encuesta

### Tabla: opcion_encuesta
- id_opcion (INT, PK, AI)
- id_encuesta (INT, FK -> encuesta.id_encuesta)
- texto_opcion (VARCHAR)

### Tabla: voto_encuesta
- id (INT, PK, AI)
- id_opcion (INT, FK -> opcion_encuesta.id_opcion)
- id_encuesta (INT, FK -> encuesta.id_encuesta) 
- id_usuario (INT, FK -> usuario.id_usuario) //usuario que vota
- fecha_creacion (DATETIME)

> PK = Primary Key, AI = Auto Increment, FK = Foreign Key
