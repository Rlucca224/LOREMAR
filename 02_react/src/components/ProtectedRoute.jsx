import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // null = cargando

    useEffect(() => {
        // Verificar si hay sesión activa consultando al backend
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/auth/verify', {
                    method: 'GET',
                    credentials: 'include' // Enviar cookies
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('❌ Error verificando autenticación:', error);
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    // Mientras carga, mostrar nada (o un spinner)
    if (isAuthenticated === null) {
        return null;
    }

    // Si NO está autenticado, redirigir al login
    if (!isAuthenticated) {
        console.log('🚫 Acceso denegado: No hay sesión activa');
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, permitir acceso
    return children;
};

export default ProtectedRoute;
