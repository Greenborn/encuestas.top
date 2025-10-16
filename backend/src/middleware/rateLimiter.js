const rateLimit = require('express-rate-limit');

// Rate limiter general para la API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes, intenta de nuevo más tarde',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter específico para votación
const votingLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos por defecto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // 10 votos por ventana por defecto
  message: {
    success: false,
    message: 'Has alcanzado el límite de votos por período de tiempo',
    error: 'VOTING_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usar IP + user ID para el rate limiting si está disponible
  keyGenerator: (req) => {
    const userId = req.user?.id || 'anonymous';
    return `${req.ip}-${userId}`;
  }
});

// Rate limiter para creación de encuestas
const createPollLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 encuestas por hora
  message: {
    success: false,
    message: 'Has alcanzado el límite de creación de encuestas por hora',
    error: 'CREATE_POLL_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?.id || req.ip;
    return `create-poll-${userId}`;
  }
});

module.exports = {
  generalLimiter,
  votingLimiter,
  createPollLimiter
};