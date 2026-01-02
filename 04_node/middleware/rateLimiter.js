const rateLimit = require('express-rate-limit');

// Rate limiter para login: máximo 5 intentos por 15 minutos
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos
    message: {
        error: 'Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en 15 minutos.'
    },
    standardHeaders: true, // Retorna info en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
    // Handler cuando se excede el límite
    handler: (req, res) => {
        console.log(`🚫 Rate limit excedido para IP: ${req.ip}`);
        res.status(429).json({
            error: 'Demasiados intentos de inicio de sesión. Por favor, intenta de nuevo en 15 minutos.'
        });
    }
});

// Rate limiter general para todas las rutas: 100 requests por 15 minutos
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 requests
    message: {
        error: 'Demasiadas peticiones. Por favor, intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    generalLimiter
};
