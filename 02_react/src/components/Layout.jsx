import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import FilterBar from './FilterBar';

const Layout = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'nro', direction: 'desc' });
    const [filters, setFilters] = useState({}); // Estado para los filtros de búsqueda
    const location = useLocation();

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Función para manejar la búsqueda desde FilterBar
    const handleSearch = (newFilters) => {
        setFilters(newFilters);
        // Opcional: Cerrar el filtro al buscar si se desea
        // setIsFilterOpen(false); 
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return "fa-solid fa-sort";
        return sortConfig.direction === 'asc' ? "fa-solid fa-sort-up" : "fa-solid fa-sort-down";
    };

    // Cerrar el filtro automáticamente cuando cambiamos de ruta
    React.useEffect(() => {
        setIsFilterOpen(false);
        // Resetear el ordenamiento cuando salimos de /reservas
        if (location.pathname !== '/reservas') {
            setSortConfig({ key: 'nro', direction: 'desc' });
            setFilters({});
        }
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

                <FilterBar key={location.pathname} isOpen={isFilterOpen} onSearch={handleSearch} />

                {/* Header del checklist - fijo, solo visible en /reservas */}
                {showFilterButton && (
                    <div className="checklist-header">
                        <div className="col-nro" onClick={() => handleSort('nro')} style={{ cursor: 'pointer' }}>
                            Nro <i className={getSortIcon('nro')}></i>
                        </div>
                        <div className="col-estado" onClick={() => handleSort('estado')} style={{ cursor: 'pointer' }}>
                            Estado <i className={getSortIcon('estado')}></i>
                        </div>
                        <div className="col-cliente" onClick={() => handleSort('cliente')} style={{ cursor: 'pointer' }}>
                            Cliente <i className={getSortIcon('cliente')}></i>
                        </div>
                        <div className="col-fecha-reserva" onClick={() => handleSort('fechaReserva')} style={{ cursor: 'pointer' }}>
                            Reservado el <i className={getSortIcon('fechaReserva')}></i>
                        </div>
                        <div className="col-uso">Uso</div>
                        <div className="col-fecha-evento" onClick={() => handleSort('fechaEvento')} style={{ cursor: 'pointer' }}>
                            Fecha del Evento <i className={getSortIcon('fechaEvento')}></i>
                        </div>
                        <div className="col-servicios" onClick={() => handleSort('servicios')} style={{ cursor: 'pointer' }}>
                            Servicios <i className={getSortIcon('servicios')}></i>
                        </div>
                        <div className="col-btn-view"></div>
                        <div className="col-btn-more"></div>
                    </div>
                )}

                {/* display: flex aquí asegura que el hijo (Outlet/Home) pueda tomar el 100% de height */}
                <div className={`content-area ${isHomePage ? 'no-scroll' : ''}`}>
                    <Outlet context={{ sortConfig, filters }} />
                </div>
            </main>
        </div>
    );
};

export default Layout;
