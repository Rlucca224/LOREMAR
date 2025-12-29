const { defineConfig } = require('@prisma/config');

module.exports = defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        // Hardcoded URL for debugging connection issues using 127.0.0.1
        url: "postgresql://postgres:conera332@127.0.0.1:5432/loremar_db?schema=public",
        provider: 'postgresql',
    },
});
