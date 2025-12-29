/* prismaClient.js */
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

// 1. Crear Pool de PG
const pool = new Pool({ connectionString });

// 2. Crear Adaptador
const adapter = new PrismaPg(pool);

// 3. Crear Cliente con el Adaptador
const prisma = new PrismaClient({ adapter });

module.exports = prisma;