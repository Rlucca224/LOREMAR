import React, { useState, useEffect, useRef } from 'react';

const ReservationCard = ({ res, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const statusClass = res.estado === 'Pagado' ? 'status-paid' : 'status-pending';

    // Cerrar menú al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
    };

    return (
        <div className="reservation-item" style={{ animationDelay: '0.1s' }}>
            {/* 1. Tarjeta Principal */}
            <div className={`reservation-card ${expanded ? 'expanded' : ''}`}>
                <div className="col-nro">{res.nro}</div>
                <div className="col-estado"><span className={`status ${statusClass}`}>{res.estado}</span></div>
                <div className="col-cliente">{res.cliente}</div>
                <div className="col-fecha-reserva">{res.fechaReserva}</div>
                <div className="col-uso">{res.uso}</div>
                <div className="col-fecha-evento">{res.fechaEvento}</div>
                <div className="col-servicios">{res.servicios}</div>
                <div className="col-btn-cancel">
                    {res.estado === 'Pendiente' && <button className="btn-cancel">Cancelar</button>}
                </div>
                <div className="col-btn-view">
                    <button
                        className="btn-view action-view-details"
                        onClick={() => setExpanded(!expanded)}
                    >
                        Ver
                    </button>
                </div>
                <div className="col-btn-more">
                    <button className="btn-more" onClick={handleMenuToggle}>
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    {/* Menú Contextual */}
                    {menuOpen && (
                        <div className="more-menu show" ref={menuRef}>
                            <div className="more-menu-option" onClick={() => { setMenuOpen(false); if (onEdit) onEdit(res); }}>
                                <i className="fa-solid fa-pen"></i> <span>Editar</span>
                            </div>
                            <div className="more-menu-divider"></div>
                            <div className="more-menu-option" onClick={() => { setMenuOpen(false); if (onDelete) onDelete(res.nro); }}>
                                <i className="fa-solid fa-trash"></i> <span>Eliminar</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Panel de Detalles */}
            <div className={`details-panel ${expanded ? 'open' : ''}`}>
                <div className="details-content">
                    <div className="details-grid">
                        <div className="detail-column">
                            <h4>Nro de Cliente: {res.nro}</h4>
                            <p><strong>Nombre:</strong> {res.cliente}</p>
                        </div>
                        <div className="detail-column">
                            <p className="mt-20">Detalles completos disponibles...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationCard;
