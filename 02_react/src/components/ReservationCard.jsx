import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { pdf } from '@react-pdf/renderer';
import ReservationVoucher from './ReservationVoucher';

const ReservationCard = ({ res, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);

    const statusClass = res.estado === 'Pagado' ? 'status-paid' : 'status-pending';

    const handlePrint = async () => {
        try {
            const blob = await pdf(<ReservationVoucher reservation={res} />).toBlob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar el PDF. Verifica la consola.');
        }
    };

    // Cerrar menú al hacer scroll o resize para evitar que flote desalineado
    useEffect(() => {
        const closeMenu = () => setMenuOpen(false);
        if (menuOpen) {
            window.addEventListener('resize', closeMenu);
            window.addEventListener('scroll', closeMenu, true); // true para capturar scroll en contendores
        }
        return () => {
            window.removeEventListener('resize', closeMenu);
            window.removeEventListener('scroll', closeMenu, true);
        };
    }, [menuOpen]);

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target) &&
                !event.target.closest('.more-menu')) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuOpen]);

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        if (!menuOpen) {
            const rect = e.currentTarget.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + 5, // Justo debajo del botón
                left: rect.right - 140 // Alineado a la derecha, asumiendo ancho aprox de 150px
            });
        }
        setMenuOpen(!menuOpen);
    };

    const handleAction = (action) => {
        setMenuOpen(false);
        if (action === 'edit' && onEdit) onEdit(res);
        if (action === 'delete' && onDelete) onDelete(res.nro);
    };

    return (
        <div className="reservation-item" style={{ animationDelay: '0.1s' }}>
            {/* 1. Tarjeta Principal */}
            <div className={`reservation-card ${expanded ? 'expanded' : ''}`}>
                <div className="col-nro">{res.nro}</div>
                <div className="col-estado"><span className={`status ${statusClass}`}>{res.estado}</span></div>
                <div className="col-cliente">{res.cliente || '-'}</div>
                <div className="col-fecha-reserva">{res.fechaReserva}</div>
                <div className="col-uso">{res.uso || '-'}</div>
                <div className="col-fecha-evento">{res.fechaEvento}</div>
                <div className="col-servicios">{res.servicios}</div>
                <div className="col-btn-print">
                    <button className="btn-print" onClick={handlePrint}>Imprimir</button>
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
                    <button className="btn-more" onClick={handleMenuToggle} ref={buttonRef}>
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>

                    {/* Menú Contextual renderizado en el BODY usando Portal */}
                    {menuOpen && createPortal(
                        <div
                            className="more-menu show"
                            style={{
                                position: 'fixed',
                                top: `${menuPos.top}px`,
                                left: `${menuPos.left}px`
                            }}
                        >
                            <div className="more-menu-option" onClick={() => handleAction('edit')}>
                                <i className="fa-solid fa-pen"></i> <span>Editar</span>
                            </div>
                            <div className="more-menu-divider"></div>
                            <div className="more-menu-option" onClick={() => handleAction('delete')}>
                                <i className="fa-solid fa-trash"></i> <span>Eliminar</span>
                            </div>
                        </div>,
                        document.body
                    )}
                </div>
            </div>

            {/* 2. Panel de Detalles */}
            <div className={`details-panel ${expanded ? 'open' : ''}`}>
                <div className="details-content">
                    {/* Grid de 4 columnas para escritorio, colapsable en móvil */}
                    <div className="details-grid-full">

                        {/* 1. Datos Cliente */}
                        <div className="detail-section">
                            <h5 className="detail-title"><i className="fa-solid fa-user"></i> Cliente</h5>
                            <div className="detail-row"><strong>Nombre:</strong> <span>{res.clientName || '-'}</span></div>
                            <div className="detail-row"><strong>DNI:</strong> <span>{res.clientDni || '-'}</span></div>
                            <div className="detail-row"><strong>Teléfono:</strong> <span>{res.clientPhone || '-'}</span></div>
                        </div>

                        {/* 2. Detalles Evento */}
                        <div className="detail-section">
                            <h5 className="detail-title">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px', verticalAlign: 'text-bottom' }}>
                                    <path d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Evento
                            </h5>
                            <div className="detail-row"><strong>Tipo:</strong> <span>{res.eventType || '-'}</span></div>
                            <div className="detail-row"><strong>Fecha:</strong> <span>{new Date(res.eventDate).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</span></div>
                            <div className="detail-row"><strong>Descripción:</strong> <span>{res.description || '-'}</span></div>
                        </div>

                        {/* 3. Servicios */}
                        <div className="detail-section">
                            <h5 className="detail-title"><i className="fa-solid fa-bell-concierge"></i> Servicios</h5>
                            <div className="detail-row"><strong>AC:</strong> <span>{res.hasAc ? 'SÍ' : 'NO'}</span></div>
                            {res.hasAc && (
                                <>
                                    <div className="detail-row"><strong>Horas:</strong> <span>{res.acHours} hs</span></div>
                                    <div className="detail-row"><strong>Precio/Hora:</strong> <span>${res.acPricePerHour.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></div>
                                    <div className="detail-row"><strong>Total AC:</strong> <span>${res.acTotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></div>
                                </>
                            )}
                        </div>

                        {/* 4. Pagos */}
                        <div className="detail-section">
                            <h5 className="detail-title"><i className="fa-solid fa-dollar-sign"></i> Pagos</h5>
                            <div className="detail-row"><strong>Alquiler Base:</strong> <span>${res.rentalPrice.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></div>
                            <div className="detail-row"><strong>Seña:</strong> <span>${res.deposit.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></div>
                            <div className="detail-row balance-row">
                                <strong>Saldo:</strong> <span className={res.balance > 0 ? 'text-danger' : 'text-success'}>${res.balance.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                            </div>

                            {/* Botón de Pago (Solo Frontend por ahora) */}
                            {res.balance > 0 && (
                                <button className="btn-pay mt-10" onClick={(e) => { e.stopPropagation(); alert('Funcionalidad de pago backend pendiente'); }}>
                                    <i className="fa-solid fa-cash-register"></i> Registrar Pago
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationCard;
