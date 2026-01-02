import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import profileIcon from '../assets/no_icon_profile.svg';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const navRef = useRef(null);
    const indicatorRef = useRef(null);

    useEffect(() => {
        // Función para actualizar la posición
        const updatePosition = () => {
            const activeItem = navRef.current?.querySelector('.nav-item.active');
            const indicator = indicatorRef.current;

            if (activeItem && indicator) {
                const topPosition = activeItem.offsetTop;
                const offset = (activeItem.offsetHeight - 40) / 2; // 40px es la altura definida en CSS

                indicator.style.transform = `translateY(${topPosition + offset}px)`;
                indicator.style.opacity = '1';
            } else if (indicator) {
                indicator.style.opacity = '0';
            }
        };

        // Pequeño delay para asegurar que el DOM se actualizó
        const timeoutId = setTimeout(updatePosition, 50);

        // Listener de resize por si cambia el tamaño de ventana
        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', updatePosition);
        };
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            // Llamar al backend para limpiar las cookies
            await fetch('http://localhost:4000/api/auth/logout', {
                method: 'POST',
                credentials: 'include' // Enviar cookies
            });

            // Limpiar localStorage
            localStorage.removeItem('user');

            console.log('🚪 Sesión cerrada');

            // Redirigir al login
            navigate('/login');
        } catch (error) {
            console.error('❌ Error al cerrar sesión:', error);
            // Redirigir de todas formas
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    return (
        <aside className="sidebar left-sidebar">
            <div className="profile-icon-container">
                <img src={profileIcon} alt="Perfil" className="profile-img" />
            </div>

            <nav className="nav-menu" ref={navRef}>
                <div className="nav-indicator" ref={indicatorRef}></div>

                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive || location.pathname === '/nueva-reserva' ? 'active' : ''}`} title="Inicio">
                    <i className="fa-solid fa-user-plus"></i>
                </NavLink>

                <NavLink to="/reservas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Reservas">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 16 19" fill={"currentColor"} xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5625 0C7.14714 0 6.7819 0.136068 6.4668 0.408203C6.16602 0.651693 5.93685 0.973958 5.7793 1.375H0V18.5625H15.125V1.375H9.3457C9.18815 0.973958 8.95898 0.651693 8.6582 0.408203C8.3431 0.136068 7.97786 0 7.5625 0ZM7.5625 1.375C7.7487 1.375 7.90625 1.44661 8.03516 1.58984C8.17839 1.71875 8.25 1.8763 8.25 2.0625V2.75H10.3125V4.125H4.8125V2.75H6.875V2.0625C6.875 1.8763 6.93945 1.71875 7.06836 1.58984C7.21159 1.44661 7.3763 1.375 7.5625 1.375ZM1.375 2.75H3.4375V5.5H11.6875V2.75H13.75V17.1875H1.375V2.75ZM11.1934 7.75586L6.875 12.0742L4.61914 9.81836L3.63086 10.8066L6.38086 13.5566L6.875 14.0293L7.36914 13.5566L12.1816 8.74414L11.1934 7.75586Z" fill="currentColor" />
                    </svg>
                </NavLink>

                <NavLink to="/calendario" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Calendario">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.75 0V0.6875H0V15.8125H15.125V0.6875H12.375V0H11V0.6875H4.125V0H2.75ZM1.375 2.0625H2.75V2.75H4.125V2.0625H11V2.75H12.375V2.0625H13.75V3.4375H1.375V2.0625ZM1.375 4.8125H13.75V14.4375H1.375V4.8125ZM5.5 6.1875V7.5625H6.875V6.1875H5.5ZM8.25 6.1875V7.5625H9.625V6.1875H8.25ZM11 6.1875V7.5625H12.375V6.1875H11ZM2.75 8.9375V10.3125H4.125V8.9375H2.75ZM5.5 8.9375V10.3125H6.875V8.9375H5.5ZM8.25 8.9375V10.3125H9.625V8.9375H8.25ZM11 8.9375V10.3125H12.375V8.9375H11ZM2.75 11.6875V13.0625H12.375V11.6875H2.75Z" fill="currentColor" />
                    </svg>
                </NavLink>
            </nav>

            <div className="settings">
                {/* Botón de Cerrar Sesión */}
                <button onClick={handleLogout} className="nav-item logout-btn" title="Cerrar Sesión">
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>

                <a href="#" className="nav-item" title="Configuración">
                    <i className="fa-solid fa-gear"></i>
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;
