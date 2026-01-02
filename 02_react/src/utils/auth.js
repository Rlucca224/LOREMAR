// Helper para decodificar y verificar el token JWT
export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        // Decodificar el token JWT (sin verificar firma, solo leer)
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Verificar si el token tiene fecha de expiración
        if (!payload.exp) return true;

        // Comparar con la fecha actual (exp está en segundos, Date.now() en milisegundos)
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
            console.log('⏰ Token expirado');
        }

        return isExpired;
    } catch (error) {
        console.error('❌ Error al decodificar token:', error);
        return true; // Si hay error, considerar expirado
    }
};

// Helper para cerrar sesión
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🚪 Sesión cerrada (token expirado)');
    window.location.href = '/login';
};
