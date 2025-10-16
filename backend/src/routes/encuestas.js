const express = require('express');
const router = express.Router();
const EncuestasController = require('../controllers/encuestasController');
const OpcionesController = require('../controllers/opcionesController');
const VotosController = require('../controllers/votosController');
const authMiddleware = require('../middleware/auth');
const { votingLimiter, createPollLimiter } = require('../middleware/rateLimiter');

// Rutas de encuestas
router.post('/', 
  authMiddleware(true), 
  createPollLimiter,
  EncuestasController.validarCrearEncuesta(),
  EncuestasController.crearEncuesta
);

router.get('/', 
  authMiddleware(false), 
  EncuestasController.listarEncuestas
);

router.get('/:id', 
  EncuestasController.obtenerEncuesta
);

router.delete('/:id', 
  authMiddleware(true), 
  EncuestasController.eliminarEncuesta
);

// Rutas de opciones de encuesta
router.post('/:id/opciones', 
  authMiddleware(true),
  OpcionesController.validarOpcion(),
  OpcionesController.agregarOpcion
);

router.get('/:id/opciones', 
  OpcionesController.listarOpciones
);

router.put('/:id/opciones/:opcionId', 
  authMiddleware(true),
  OpcionesController.validarActualizarOpcion(),
  OpcionesController.actualizarOpcion
);

router.delete('/:id/opciones/:opcionId', 
  authMiddleware(true),
  OpcionesController.eliminarOpcion
);

// Rutas de votación
router.post('/:id/votar', 
  authMiddleware(true),
  votingLimiter,
  VotosController.validarVoto(),
  VotosController.votar
);

router.get('/:id/resultados', 
  VotosController.obtenerResultados
);

module.exports = router;