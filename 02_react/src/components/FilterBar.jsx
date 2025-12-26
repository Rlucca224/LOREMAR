import React from 'react';

const FilterBar = ({ isOpen }) => {
    // Nota: Mantenemos la estructura HTML exacta para reutilizar el CSS global
    return (
        <div
            id="filter-reveal-wrapper"
            className={`filter-reveal-container ${isOpen ? 'active' : ''}`}
            style={{ display: isOpen ? 'block' : 'none' }}
        >
            <div id="filter-panel" className="filter-bar">
                <div className="filter-row">
                    {/* Status Filter */}
                    <div className="filter-group">
                        <select id="filter-status" className="filter-select">
                            <option value="">Estado</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Pagado">Pagado</option>
                        </select>
                        <i className="fa-solid fa-chevron-down select-icon"></i>
                    </div>

                    {/* Name Filter */}
                    <div className="filter-group">
                        <div className="input-wrapper search-wrapper">
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                            <input type="text" id="filter-name" placeholder="Nombre" />
                        </div>
                    </div>

                    {/* ID Filter */}
                    <div className="filter-group">
                        <div className="input-wrapper search-wrapper">
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                            <input type="text" id="filter-client-id" placeholder="N° de cliente" />
                        </div>
                    </div>

                    {/* Date Range Filters */}
                    <div className="filter-group date-range-group">
                        <div className="date-range-container">
                            <div className="date-input-wrapper">
                                <input type="text" id="filter-date-from" placeholder="Fecha desde" className="flatpickr-input" />
                                <svg className="calendar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" />
                                </svg>
                            </div>
                            <span className="range-arrow">→</span>
                            <div className="date-input-wrapper">
                                <input type="text" id="filter-date-to" placeholder="Fecha hasta" className="flatpickr-input" />
                                <svg className="calendar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Search Button */}
                    <div className="filter-actions">
                        <button id="btn-search-apply" className="btn-search">Buscar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
