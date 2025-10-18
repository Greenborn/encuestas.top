const express = require('express');
const router = express.Router();
const EncuestasController = require('../controllers/encuestasController');
const OpcionesController = require('../controllers/opcionesController');
const VotosController = require('../controllers/votosController');
const authSessionMiddleware = require('../middleware/authSessionMiddleware');
const { votingLimiter, createPollLimiter } = require('../middleware/rateLimiter');
const { authSessionMiddlewareOpcional } = require('../middleware/authSessionMiddleware');

// Rutas de encuestas
router.post('/', 
  authSessionMiddleware,
  createPollLimiter,
  EncuestasController.validarCrearEncuesta(),
  EncuestasController.crearEncuesta
);

router.get('/', 
  authSessionMiddlewareOpcional, 
  EncuestasController.listarEncuestas
);

router.get('/:id', 
  authSessionMiddlewareOpcional,
  EncuestasController.obtenerEncuesta
);

router.delete('/:id', 
  authSessionMiddleware,
  EncuestasController.eliminarEncuesta
);

// Rutas de opciones de encuesta
router.post('/:id/opciones', 
  authSessionMiddleware,
  OpcionesController.validarOpcion(),
  OpcionesController.agregarOpcion
);

router.get('/:id/opciones', 
  OpcionesController.listarOpciones
);

router.put('/:id/opciones/:opcionId', 
  authSessionMiddleware,
  OpcionesController.validarActualizarOpcion(),
  OpcionesController.actualizarOpcion
);

router.delete('/:id/opciones/:opcionId', 
  authSessionMiddleware,
  OpcionesController.eliminarOpcion
);

// Rutas de votación
router.post('/:id/votar', 
  authSessionMiddleware,
  votingLimiter,
  VotosController.validarVoto(),
  VotosController.votar
);

router.get('/:id/resultados', 
  VotosController.obtenerResultados
);

module.exports = router;