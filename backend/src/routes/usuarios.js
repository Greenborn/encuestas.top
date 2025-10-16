const express = require('express');
const router = express.Router();
const VotosController = require('../controllers/votosController');
const authMiddleware = require('../middleware/auth');

// Rutas de usuario
router.get('/mis-votos', 
  authMiddleware(true), 
  VotosController.obtenerMisVotos
);

module.exports = router;