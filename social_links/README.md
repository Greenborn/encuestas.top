# Social Links Backend

Backend para servir encuestas con metatags sociales (OpenGraph, Twitter, SEO, etc.)

## Instalación

1. Copia `.env.example` a `.env` y configura los valores.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor:
   ```bash
   npm start
   ```

## Endpoints

- `GET /encuesta/:id_encuesta` - Devuelve HTML con metatags sociales para la encuesta.

## Configuración

- Puerto de escucha
- Host, usuario, contraseña y nombre de la base de datos MariaDB

## Requisitos
- Node.js >= 22
- MariaDB
