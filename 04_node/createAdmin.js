const bcrypt = require('bcryptjs');
const prisma = require('./prismaClient');

async function createAdmin() {
    try {
        console.log('🔄 Iniciando creación de usuario admin...');

        // Primero, intentar eliminar el usuario si existe
        try {
            await prisma.user.delete({
                where: { username: 'admin' }
            });
            console.log('🗑️ Usuario admin anterior eliminado');
        } catch (e) {
            console.log('ℹ️ No había usuario admin previo');
        }

        // Hashear la contraseña
        console.log('🔐 Hasheando contraseña...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Crear el usuario admin
        console.log('💾 Creando usuario en la base de datos...');
        const admin = await prisma.user.create({
            data: {
                username: 'admin',
                password: hashedPassword,
                role: 'admin'
            }
        });

        console.log('✅ Usuario administrador creado exitosamente!');
        console.log('   Username:', admin.username);
        console.log('   Role:', admin.role);
        console.log('   ID:', admin.id);

        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear admin:', error.message);
        await prisma.$disconnect();
        process.exit(1);
    }
}

createAdmin();