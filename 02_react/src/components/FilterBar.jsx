import React, { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

const flatpickrOptions = {
    locale: Spanish,
    dateFormat: "d/m/Y",
    disableMobile: true,
    allowInput: true
};

const FilterBar = ({ isOpen, onSearch }) => {
    // State for inputs
    const [status, setStatus] = useState('');
    const [name, setName] = useState('');
    const [clientId, setClientId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Helper para la máscara de fecha
    const handleDateInput = (e, setDate) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 8) v = v.slice(0, 8);

        if (v.length >= 5) {
            v = v.replace(/^(\d{2})(\d{2})(\d{0,4}).*/, '$1/$2/$3');
        } else if (v.length >= 3) {
            v = v.replace(/^(\d{2})(\d{0,2}).*/, '$1/$2');
        }
        setDate(v);
    };

    // Helper para prevenir caracteres no numéricos
    const handleKeyDown = (e) => {
        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
        if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handleSearchClick = () => {
        if (onSearch) {
            onSearch({
                status,
                name,
                clientId,
                dateFrom,
                dateTo
            });
        }
    };

    return (
        <div
            id="filter-reveal-wrapper"
            className={`filter-reveal-container ${isOpen ? 'active' : ''}`}
        >
            <div id="filter-panel" className="filter-bar">
                <div className="filter-row">
                    {/* Status Filter */}
                    <div className="filter-group">
                        <div className="select-wrapper">
                            <select
                                id="filter-status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="" disabled>Estado</option>
                                <option value="">Todos</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Pagado">Pagado</option>
                            </select>
                            <i className="fa-solid fa-chevron-down select-icon"></i>
                        </div>
                    </div>

                    {/* Name Filter */}
                    <div className="filter-group">
                        <input
                            type="text"
                            id="filter-name"
                            placeholder="Nombre"
                            value={name}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                                setName(val);
                            }}
                            autoComplete="off"
                        />
                    </div>

                    {/* ID Filter */}
                    <div className="filter-group">
                        <div className="input-with-icon">
                            <i className="fa-solid fa-magnifying-glass search-icon"></i>
                            <input
                                type="text"
                                id="filter-client-id"
                                placeholder="N° de cliente"
                                value={clientId}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setClientId(val);
                                }}
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* Date Range Filters */}
                    <div className="filter-group date-range-group">
                        <div className="date-range-container">
                            <div className="date-input-wrapper">
                                <Flatpickr
                                    value={dateFrom}
                                    onChange={([date], dateStr) => setDateFrom(dateStr)}
                                    options={flatpickrOptions}
                                    render={({ defaultValue, value, ...props }, ref) => (
                                        <input
                                            {...props}
                                            ref={ref}
                                            id="filter-date-from"
                                            placeholder="Fecha desde"
                                            className="flatpickr-input"
                                            value={dateFrom || ''}
                                            onChange={(e) => handleDateInput(e, setDateFrom)}
                                            onKeyDown={handleKeyDown}
                                            autoComplete="off"
                                        />
                                    )}
                                />
                                <svg className="calendar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" />
                                </svg>
                            </div>
                            <span className="range-arrow">→</span>
                            <div className="date-input-wrapper">
                                <Flatpickr
                                    value={dateTo}
                                    onChange={([date], dateStr) => setDateTo(dateStr)}
                                    options={flatpickrOptions}
                                    render={({ defaultValue, value, ...props }, ref) => (
                                        <input
                                            {...props}
                                            ref={ref}
                                            id="filter-date-to"
                                            placeholder="Fecha hasta"
                                            className="flatpickr-input"
                                            value={dateTo || ''}
                                            onChange={(e) => handleDateInput(e, setDateTo)}
                                            onKeyDown={handleKeyDown}
                                            autoComplete="off"
                                        />
                                    )}
                                />
                                <svg className="calendar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Search Button */}
                    <div className="filter-actions">
                        <button
                            id="btn-search-apply"
                            className="btn-search"
                            onClick={handleSearchClick}
                        >
                            Buscar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
