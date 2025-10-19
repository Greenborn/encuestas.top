
import express from 'express';
import { getEncuestaById } from '../services/encuestaService.js';

const BASE_URL = process.env.SERVICE_BASE_URL || '';

const router = express.Router();

router.get('/:id_encuesta', async (req, res) => {
  const { id_encuesta } = req.params;
  try {
    const encuesta = await getEncuestaById(id_encuesta);
    if (!encuesta) {
      return res.status(404).send('Encuesta no encontrada');
    }
    // Renderizar HTML con metatags y redirección SEO friendly
    const redirectUrl = `${process.env.REDIRECT_BASE_URL || 'https://encuesta.top'}/#/encuestas/${encuesta.id_encuesta}`;
    res.send(`<!DOCTYPE html>
<html lang=\"es\">
<head>
  <meta charset=\"UTF-8\" />
  <title>${encuesta.titulo}</title>
  <link rel="icon" type="image/png" href="https://encuesta.top/icon-encuesta.png">
  <meta property=\"og:title\" content=\"${encuesta.titulo}\" />
  <meta property=\"og:description\" content=\"${encuesta.descripcion}\" />
  <meta property=\"og:type\" content=\"website\" />
  <meta property=\"og:url\" content=\"${BASE_URL}${req.originalUrl}\" />
  <meta property=\"og:image\" content=\"https://encuesta.top/icon-encuesta.png\" />
  <meta property=\"og:site_name\" content=\"Encuesta.top\" />
  <meta property=\"og:locale\" content=\"es_ES\" />
  <meta name=\"twitter:card\" content=\"summary_large_image\" />
  <meta name=\"twitter:title\" content=\"${encuesta.titulo}\" />
  <meta name=\"twitter:description\" content=\"${encuesta.descripcion}\" />
  <meta name=\"twitter:image\" content=\"https://encuesta.top/icon-encuesta.png\" />
  <meta name=\"twitter:url\" content=\"${BASE_URL}${req.originalUrl}\" />
  <meta name=\"description\" content=\"${encuesta.descripcion}\" />
  <meta name=\"keywords\" content=\"encuesta, votación, resultados, preguntas\" />
  <meta itemprop=\"name\" content=\"${encuesta.titulo}\" />
  <meta itemprop=\"description\" content=\"${encuesta.descripcion}\" />
  <meta itemprop=\"image\" content=\"https://encuesta.top/icon-encuesta.png\" />
  <meta name=\"robots\" content=\"index, follow\" />
  <meta http-equiv=\"refresh\" content=\"0; url=${redirectUrl}\" />
</head>
<body>
  <script>
    window.location.replace("${redirectUrl}");
  </script>
  <noscript>
    Si no eres redirigido automáticamente, <a href=\"${redirectUrl}\">haz clic aquí</a>.
  </noscript>
</body>
</html>`);
  } catch (err) {
    res.status(500).send('Error interno del servidor');
  }
});

export default router;
