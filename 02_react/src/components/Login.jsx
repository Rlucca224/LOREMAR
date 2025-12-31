import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Background3D from './Background3D';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica temporal para probar VISUALMENTE
        console.log("Login attempt (Simulado):", { username, password });

        // Simulación de éxito (opcional, para que veas q redirige)
        // navigate('/'); 
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

                    <button type="submit" className="btn-login">
                        Ingresar
                    </button>

                    <div className="login-links">
                        <button type="button" className="link-btn">Olvide La Contraseña</button>
                        <span className="separator"></span>
                        <button type="button" className="link-btn">Soporte</button>
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
