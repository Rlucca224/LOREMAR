// Load environment variables manually to ensure they are available
require('dotenv').config();

const { defineConfig } = require('@prisma/config');

module.exports = defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        // Use environment variable for database connection (Cloud-ready!)
        url: process.env.DATABASE_URL,
        provider: 'postgresql',
    },
});
