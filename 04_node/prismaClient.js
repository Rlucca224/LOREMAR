const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

// Validación: Verificar que DATABASE_URL existe
if (!connectionString) {
    throw new Error('❌ DATABASE_URL no está definida en el archivo .env');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Manejo de errores del pool para evitar crashes inesperados
pool.on('error', (err) => {
    console.error('❌ Error inesperado en el pool de conexiones:', err);
});

module.exports = prisma;
