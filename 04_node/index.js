/* index.js */
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const serverless = require('serverless-http');
require('dotenv').config();

// Rutas
const reservationsRoutes = require('./routes/reservations');
const authRoutes = require('./routes/auth');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // URL del frontend
    credentials: true // Permitir cookies
}));
app.use(express.json());
app.use(cookieParser()); // Para leer cookies
app.use(generalLimiter); // Rate limiting general: 100 requests por 15 minutos

// Diagnóstico de modo
console.log("Modo de ejecución:", process.env.AWS_EXECUTION_ENV ? "AWS LAMBDA" : "LOCAL (PC)");

// Asignar Rutas
app.use('/api/reservations', reservationsRoutes);
app.use('/api/auth', authRoutes);

// Ruta Base
app.get('/', (req, res) => {
    res.send('Backend de LOREMAR funcionando correctamente 🚀');
});

// Configuración de arranque
if (process.env.AWS_EXECUTION_ENV) {
    module.exports.handler = serverless(app);
} else {
    // Modo Local
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log("Presiona CTRL+C para detenerlo.");
    });
}
