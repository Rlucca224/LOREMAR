const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Ruta de Login (con rate limiting: máximo 5 intentos por 15 minutos)
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('🔐 Intento de login:', username);

        // 1. Buscar el usuario en la base de datos
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            console.log('❌ Usuario no encontrado');
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // 2. Verificar la contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            console.log('❌ Contraseña incorrecta');
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }


        // 3. Generar access token (15 minutos) y refresh token (7 días)
        const accessToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET || 'tu_secreto_super_seguro_aqui',
            { expiresIn: '15m' } // 15 minutos
        );

        const refreshToken = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_REFRESH_SECRET || 'tu_secreto_refresh_super_seguro',
            { expiresIn: '7d' } // 7 días
        );

        console.log('✅ Login exitoso:', username);

        // 4. Enviar tokens en cookies httpOnly (más seguro que localStorage)
        res.cookie('accessToken', accessToken, {
            httpOnly: true, // No accesible desde JavaScript (previene XSS)
            secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
            sameSite: 'strict', // Previene CSRF
            maxAge: 15 * 60 * 1000 // 15 minutos
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        // 5. Enviar respuesta (sin tokens en el body, solo info del usuario)
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


module.exports = router;

// Ruta para renovar el access token usando el refresh token
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ error: 'No hay refresh token' });
        }

        // Verificar el refresh token
        jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'tu_secreto_refresh_super_seguro',
            (err, decoded) => {
                if (err) {
                    console.log(' Refresh token inv�lido');
                    return res.status(403).json({ error: 'Refresh token inv�lido' });
                }

                // Generar nuevo access token
                const newAccessToken = jwt.sign(
                    {
                        id: decoded.id,
                        username: decoded.username,
                        role: decoded.role
                    },
                    process.env.JWT_SECRET || 'tu_secreto_super_seguro_aqui',
                    { expiresIn: '15m' }
                );

                // Enviar nuevo access token en cookie
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 15 * 60 * 1000
                });

                console.log(' Access token renovado para:', decoded.username);

                res.json({ success: true });
            }
        );
    } catch (error) {
        console.error(' Error al renovar token:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta para cerrar sesion (limpiar cookies)
router.post('/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    console.log(' Sesion cerrada');
    res.json({ success: true });
});

// Ruta para verificar si hay sesion activa
router.get('/verify', (req, res) => {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    // Verificar el access token
    jwt.verify(
        accessToken,
        process.env.JWT_SECRET || 'tu_secreto_super_seguro_aqui',
        (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Token invalido' });
            }

            // Token valido
            res.json({
                success: true,
                user: {
                    id: decoded.id,
                    username: decoded.username,
                    role: decoded.role
                }
            });
        }
    );
});
