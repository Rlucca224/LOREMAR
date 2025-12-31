/* index.js */
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
require('dotenv').config();

// Rutas
const reservationsRoutes = require('./routes/reservations');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Diagnóstico de modo
console.log("Modo de ejecución:", process.env.AWS_EXECUTION_ENV ? "AWS LAMBDA" : "LOCAL (PC)");

// Asignar Rutas
app.use('/api/reservations', reservationsRoutes);

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
