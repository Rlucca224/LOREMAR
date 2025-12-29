/* index.js */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const reservationsRoutes = require('./routes/reservations'); // <--- Importamos rutas

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/reservations', reservationsRoutes); // <--- Conectamos la ruta

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Backend de LOREMAR funcionando correctamente 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
