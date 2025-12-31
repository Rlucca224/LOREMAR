import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReservationCard from './ReservationCard';
import SkeletonCard from './SkeletonCard';
import ConfirmModal from './ConfirmModal';

const parseDate = (dateStr) => {
    if (!dateStr) return 0;
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}`).getTime();
};

const ReservationList = () => {
    const [reservations, setReservations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);

    // Estado para el modal de confirmación
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Estado principal de carga
    const [isLoading, setIsLoading] = useState(true);

    // Estados para animación de transición (Skeletons)
    const [showSkeletons, setShowSkeletons] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // Cerrar menú de paginación al hacer click fuera
    useEffect(() => {
        const closeMenu = () => setIsPageMenuOpen(false);
        if (isPageMenuOpen) {
            window.addEventListener('click', closeMenu);
        }
        return () => window.removeEventListener('click', closeMenu);
    }, [isPageMenuOpen]);

    // Efecto para visualizar la transición SUAVE de Skeleton a Real
    useEffect(() => {
        if (isLoading) {
            setShowSkeletons(true);
            setIsFadingOut(false);
        } else {
            // Empezamos animación de salida (fade-out)
            setIsFadingOut(true);

            // Esperamos 400ms (lo que dura la animación CSS fadeOut) antes de quitar el skeleton del DOM
            const timer = setTimeout(() => {
                setShowSkeletons(false);
                setIsFadingOut(false);
            }, 400);

            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    const ITEMS_PER_PAGE = 20;

    // Obtenemos sortConfig y filters del contexto (Layout.jsx)
    const { sortConfig, filters } = useOutletContext();

    // Manejar solicitud de eliminación (abrir modal)
    const handleDeleteRequest = (id) => {
        setPendingDeleteId(id);
        setConfirmOpen(true);
    };

    // Confirmar y eliminar en backend
    const handleConfirmDelete = async () => {
        if (!pendingDeleteId) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`http://localhost:4000/api/reservations/${pendingDeleteId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Eliminar localmente
                setReservations(prev => prev.filter(r => r.nro !== pendingDeleteId));
                setConfirmOpen(false);
                setPendingDeleteId(null);
            } else {
                alert('No se pudo eliminar la reserva.');
            }
        } catch (error) {
            console.error('Error eliminando:', error);
            alert('Error al conectar con el servidor.');
        } finally {
            setDeleteLoading(false);
        }
    };

    useEffect(() => {
        // Fetch de reservas reales desde el Backend con filtros
        const fetchReservations = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters) {
                    if (filters.status) params.append('status', filters.status);
                    if (filters.name) params.append('name', filters.name);
                    if (filters.clientId) params.append('clientId', filters.clientId);
                    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
                    if (filters.dateTo) params.append('dateTo', filters.dateTo);
                }

                const url = `http://localhost:4000/api/reservations?${params.toString()}`;
                console.log("Fetching URL:", url);

                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();

                    // Mapeamos los datos de la DB al formato visual
                    const mappedReservations = data.map(r => {
                        const fEvento = new Date(r.eventDate);
                        const fechaEventoFormatted = fEvento.toLocaleDateString('es-ES', { timeZone: 'UTC' });

                        return {
                            nro: r.id,
                            estado: r.status,
                            cliente: r.clientName,
                            fechaReserva: new Date(r.createdAt).toLocaleDateString('es-ES'),
                            uso: r.eventType,
                            fechaEvento: fechaEventoFormatted,
                            servicios: r.hasAc ? "Si" : "No",
                            ...r
                        };
                    });

                    setReservations(mappedReservations);
                } else {
                    console.error("Error fetching reservations");
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            } finally {
                // Notificamos que la carga de datos terminó (activará el efecto de fade-out)
                setIsLoading(false);
            }
        };

        fetchReservations();
    }, [filters]);

    // Resetear a página 1 cuando cambia el orden o el filtro
    useEffect(() => {
        setCurrentPage(1);
    }, [sortConfig, filters]);

    const sortedReservations = useMemo(() => {
        let sorted = [...reservations];
        if (sortConfig && sortConfig.key) {
            sorted.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                if (sortConfig.key.toLowerCase().includes('fecha') || sortConfig.key === 'reservado el') {
                    valA = parseDate(valA);
                    valB = parseDate(valB);
                }

                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted;
    }, [reservations, sortConfig]);

    // Paginación
    const totalPages = Math.ceil(sortedReservations.length / ITEMS_PER_PAGE);
    const paginatedReservations = sortedReservations.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            setIsPageMenuOpen(false);
            const container = document.querySelector('.checklist-container');
            if (container) container.scrollTop = 0;
        }
    };

    return (
        <div className="reservation-list-wrapper">
            <div id="view-checklist" className="view active">
                <div className="checklist-container">
                    <div id="reservations-list" className="reservations-list">

                        {/* Lógica de Renderizado: Skeletons vs Lista Real */}
                        {showSkeletons ? (
                            // Muestra 9 skeletons (con clase fade-in al entrar y fade-out al salir)
                            Array.from({ length: 9 }).map((_, index) => (
                                <SkeletonCard
                                    key={index}
                                    className={isFadingOut ? 'fade-out' : 'fade-in'}
                                />
                            ))
                        ) : paginatedReservations.length > 0 ? (
                            // Muestra la lista real
                            paginatedReservations.map(res => (
                                <ReservationCard
                                    key={res.nro}
                                    res={res}
                                    onEdit={(r) => console.log('Edit request:', r)}
                                    onDelete={handleDeleteRequest}
                                />
                            ))
                        ) : (
                            // Mensaje de estado vacio
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '60vh',
                                color: '#666',
                                width: '100%'
                            }}>
                                <i className="fa-solid fa-search" style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.5 }}></i>
                                <p style={{ fontSize: '1.1rem' }}>No se encontraron reservas con esos criterios.</p>
                            </div>
                        )}

                    </div>
                </div>

                {/* Controles de Paginación */}
                {totalPages > 0 && (
                    <div className="pagination">
                        <span>Página</span>

                        <button
                            className="pager-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <i className="fa-solid fa-caret-left"></i>
                        </button>

                        <span className="page-num current">{currentPage}</span>

                        <button
                            className="pager-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <i className="fa-solid fa-caret-right"></i>
                        </button>

                        <div
                            className={`page-select ${isPageMenuOpen ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsPageMenuOpen(!isPageMenuOpen);
                            }}
                        >
                            <span>{currentPage}</span>
                            <i className="fa-solid fa-chevron-down"></i>

                            <ul className={`pagination-menu ${isPageMenuOpen ? 'show' : ''}`}>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <li
                                        key={p}
                                        className={p === currentPage ? 'active' : ''}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePageChange(p);
                                        }}
                                    >
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <ConfirmModal
                    isOpen={confirmOpen}
                    title="¿Esta seguro que desea eliminar la reserva?"
                    message=""
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmOpen(false)}
                />
            </div>
        </div>
    );
};

export default ReservationList;
