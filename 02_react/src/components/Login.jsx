import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Background3D from './Background3D';
import LoadingSpinner from './LoadingSpinner';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true); // Verificando sesión

    // Verificar si ya hay sesión activa (como Gmail, GitHub, etc.)
    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/auth/verify', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (response.ok) {
                    console.log('✅ Ya hay sesión activa, redirigiendo al dashboard...');
                    navigate('/', { replace: true });
                } else {
                    // No hay sesión, mostrar login
                    setChecking(false);
                }
            } catch (error) {
                // No hay sesión, mostrar login
                setChecking(false);
            }
        };

        checkSession();
    }, [navigate]);

    // Mostrar spinner mientras verifica la sesión
    if (checking) {
        return <LoadingSpinner />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar errores previos
        setLoading(true);

        try {
            console.log('🔐 Intentando login...');

            const response = await fetch('http://localhost:4000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // IMPORTANTE: Enviar y recibir cookies
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Error de autenticación
                setError(data.error || 'Usuario o contraseña incorrectos');
                setLoading(false);
                return;
            }

            // Login exitoso
            console.log('✅ Login exitoso:', data);

            // Guardar solo info del usuario en localStorage (NO el token)
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirigir al dashboard
            navigate('/');

        } catch (error) {
            console.error('❌ Error en login:', error);
            setError('Error de conexión con el servidor');
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Background3D />

            {/* Header Grande */}
            <div className="login-header">
                <h1 className="brand-title">
                    <span className="text-gold">LOREMAR</span>
                    <br />
                    <span className="text-white">Eventos</span>
                </h1>
            </div>

            {/* Tarjeta de Login */}
            <div className="login-card">
                <h2>Iniciar Sesion</h2>

                <form onSubmit={handleSubmit}>
                    <div className="login-input-group">
                        <label>Usuario</label>
                        <div className="login-input-wrapper">
                            <input
                                type="text"
                                placeholder="Ingresa tu usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="login-input-group">
                        <label>Contraseña</label>
                        <div className="login-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <i className="fa-regular fa-eye-slash"></i>
                                ) : (
                                    <i className="fa-regular fa-eye"></i>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mensaje de error */}
                    {error && (
                        <div style={{
                            margin: '15px 30px 20px',
                            padding: '8px 8px 8px 8px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-login"
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>

                    <div className="login-links">
                        <button type="button" className="link-btn">Olvide la contraseña</button>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="login-footer">
                <p>Sistema de Reservas</p>
            </div>
        </div>
    );
};

export default Login;
