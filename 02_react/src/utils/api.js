import { isTokenExpired, logout } from './auth';

// Función helper para hacer fetch con validación de token
export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');

    // Verificar si el token existe y no está expirado
    if (!token || isTokenExpired(token)) {
        console.log('⏰ Token inválido o expirado, cerrando sesión...');
        logout();
        throw new Error('Token expirado');
    }

    // Agregar el token al header de autorización
    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    // Hacer la petición
    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Si el backend responde 401 (no autorizado), cerrar sesión
    if (response.status === 401) {
        console.log('🚫 No autorizado, cerrando sesión...');
        logout();
        throw new Error('No autorizado');
    }

    return response;
};
