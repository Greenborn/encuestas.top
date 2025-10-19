# Social Links
Este proyecto ofrece servicios con metatags opengraps para las encuestas y otros contenidos a definir, para el backend de encuestas

## Tecnologías
- Lenguaje: NodeJS (version minima 22)
- Framework: Express
- Base de Datos: MariaDB gestionada con Knex
- Librerías Extras: Axios

## Base de datos
Se debe usar base de datos de proyecto backend, en principio obteniendo los propios datos de la misma

### Tabla: encuesta
- id_encuesta (INT, PK, AI)
- titulo (VARCHAR)
- descripcion (TEXT)
- fecha_creacion (DATETIME)
- id_usuario (INT, FK -> usuario.id_usuario) //usuario que creo la encuesta
- fecha_finalizacion (DATETIME) 
- resultado_preliminar (JSON) //json que resume la cantidad de votos para cada opcion

## Configuraciones

Las configuraciones se definiran en .env
No olvides agregar .gitignore
No olvides agregar .env.example

Los parámetros a configurar en .env son:
- puerto escucha
- servidor base de datos
- nombre base de datos
- usuario base de datos
- contraseña usuario base de datos
- SERVICE_BASE_URL: URL base pública del servicio de social links (por ejemplo, https://social.encuesta.top). Se utiliza para construir las URLs absolutas en los metatags (og:url, twitter:url, etc.)

## Endpoints

### Get de encuesta
Tendra una ruta similar a
/encuesta/:id_encuesta

Obtiene los datos de la encuesta y se encarga de definir los opengraph tags


## Ejemplo de metatags para compartir encuesta


Incluye los principales estándares para compatibilidad con Meta (Facebook/Instagram), Google, LinkedIn, Reddit, X (Twitter), etc.
Las URLs de los metatags se generan dinámicamente usando la variable de entorno SERVICE_BASE_URL, por ejemplo:

```js
const BASE_URL = process.env.SERVICE_BASE_URL;
// ...
<meta property="og:url" content={`${BASE_URL}/encuesta/123`} />
<meta name="twitter:url" content={`${BASE_URL}/encuesta/123`} />
```

```html
<!-- OpenGraph (Meta, Facebook, LinkedIn, Reddit) -->
<meta property="og:title" content="Título de la encuesta" />
<meta property="og:description" content="Descripción breve de la encuesta" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://social.encuesta.top/encuesta/123" />
<meta property="og:image" content="https://encuesta.top/icon-encuesta.png" />
<meta property="og:site_name" content="Encuesta.top" />
<meta property="og:locale" content="es_ES" />

<!-- Twitter/X -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Título de la encuesta" />
<meta name="twitter:description" content="Descripción breve de la encuesta" />
<meta name="twitter:image" content="https://encuesta.top/icon-encuesta.png" />
<meta name="twitter:url" content="https://social.encuesta.top/encuesta/123" />
(proximamente) <meta name="twitter:site" content="@encuestastop" />
(proximamente) <meta name="twitter:creator" content="@usuario" />

<!-- Google/SEO -->
<meta name="description" content="Descripción breve de la encuesta" />
<meta name="keywords" content="encuesta, votación, resultados, preguntas" />
<meta itemprop="name" content="Título de la encuesta" />
<meta itemprop="description" content="Descripción breve de la encuesta" />
<meta itemprop="image" content="https://encuesta.top/icon-encuesta.png" />

<!-- LinkedIn usa OpenGraph, pero se recomienda imagen de al menos 1200x627 px -->

<!-- Reddit usa OpenGraph, pero prioriza og:title y og:image -->

<!-- Otros tags útiles -->
(proximamente) <meta name="author" content="Nombre del autor o usuario" />
<meta name="robots" content="index, follow" />
```

**Notas:**
- Personaliza los valores dinámicamente según la encuesta.
- La imagen debe ser pública y de buena resolución.
- El tag `og:type` puede ser `article` si la encuesta tiene contenido extenso.
- Para X/Twitter, el tag `twitter:card` puede ser `summary` si no hay imagen destacada.

Para más compatibilidad, revisa la documentación oficial de cada red social.

