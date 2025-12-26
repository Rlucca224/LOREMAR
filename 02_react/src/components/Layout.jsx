import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import FilterBar from './FilterBar';

const Layout = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const location = useLocation();

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    // Cerrar el filtro automáticamente cuando cambiamos de ruta
    React.useEffect(() => {
        setIsFilterOpen(false);
    }, [location.pathname]);

    // Mostrar el botón de filtro SOLO si estamos en la ruta de reservas
    const showFilterButton = location.pathname === '/reservas';
    const isHomePage = location.pathname === '/';

    return (
        <div className="app-container">
            <Sidebar />

            <main className="main-content">
                <header className="top-bar">
                    <h1><span className="highlight">LOREMAR</span> Eventos</h1>

                    {showFilterButton && (
                        <button
                            id="btn-filter"
                            className={`btn-filter ${isFilterOpen ? 'active' : ''}`}
                            onClick={toggleFilter}
                        >
                            <i className="fa-solid fa-filter"></i> Filtro
                        </button>
                    )}
                </header>

                <FilterBar isOpen={isFilterOpen} />

                {/* display: flex aquí asegura que el hijo (Outlet/Home) pueda tomar el 100% de height */}
                <div className={`content-area ${isHomePage ? 'no-scroll' : ''}`}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
