const express = require('express');
const router = express.Router();
const EstadisticasController = require('../controllers/estadisticasController');
const authMiddleware = require('../middleware/auth');

// Rutas de estadísticas
router.get('/generales', 
  EstadisticasController.obtenerEstadisticasGenerales
);

router.get('/encuesta/:id/detalladas', 
  authMiddleware(false),
  EstadisticasController.obtenerEstadisticasEncuesta
);

router.get('/usuario/resumen', 
  authMiddleware(true),
  EstadisticasController.obtenerResumenUsuario
);

module.exports = router;