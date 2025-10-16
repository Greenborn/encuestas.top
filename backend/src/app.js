const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar rutas
const encuestasRoutes = require('./routes/encuestas');
const usuariosRoutes = require('./routes/usuarios');
const estadisticasRoutes = require('./routes/estadisticas');

// Importar middlewares
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Configuración de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting general
app.use(generalLimiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API de Encuestas funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rutas principales
app.use('/api/encuestas', encuestasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

// Ruta para manejar endpoints no encontrados
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

// Middleware de manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  // Error de validación de JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la solicitud'
    });
  }

  // Error de límite de tamaño
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'El archivo es demasiado grande'
    });
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

module.exports = app;