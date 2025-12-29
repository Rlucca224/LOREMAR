import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import ReservationCard from './ReservationCard';
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

    const ITEMS_PER_PAGE = 20;

    // Obtenemos sortConfig y filters del contexto (Layout.jsx)
    const { sortConfig, filters } = useOutletContext();

    // ... useEffects de fetch (sin cambios) ...

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
            const response = await fetch(`http://192.168.1.3:4000/api/reservations/${pendingDeleteId}`, {
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

    // ... (resto del codigo de sortedReservations y pagination) ...

    useEffect(() => {
        // Fetch de reservas reales desde el Backend con filtros
        const fetchReservations = async () => {
            try {
                const params = new URLSearchParams();
                if (filters) {
                    if (filters.status) params.append('status', filters.status);
                    if (filters.name) params.append('name', filters.name);
                    if (filters.clientId) params.append('clientId', filters.clientId);
                    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
                    if (filters.dateTo) params.append('dateTo', filters.dateTo);
                }

                const url = `http://192.168.1.3:4000/api/reservations?${params.toString()}`;
                console.log("Fetching URL:", url);

                const response = await fetch(url);

                if (response.ok) {
                    const data = await response.json();

                    // Mapeamos los datos de la DB (snake_case o english) al formato visual (spanish/custom)
                    const mappedReservations = data.map(r => {
                        // Formatear fechas UTC a local string dd/mm/yyyy
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
                            // Guardamos TODA la info original para el panel de detalles
                            ...r
                        };
                    });

                    setReservations(mappedReservations);
                } else {
                    console.error("Error fetching reservations");
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            }
        };

        fetchReservations();
    }, [filters]); // Re-ejecutar cuando los filtros cambien

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

                // Manejo de fechas
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
            // Scroll al inicio del contenedor scrolleable
            const container = document.querySelector('.checklist-container');
            if (container) container.scrollTop = 0;
        }
    };

    return (
        <div className="reservation-list-wrapper">
            <div id="view-checklist" className="view active">
                <div className="checklist-container">
                    <div id="reservations-list" className="reservations-list">
                        {paginatedReservations.length > 0 ? (
                            paginatedReservations.map(res => (
                                <ReservationCard
                                    key={res.nro}
                                    res={res}
                                    onEdit={(r) => console.log('Edit request:', r)}
                                    onDelete={handleDeleteRequest}
                                />
                            ))
                        ) : (
                            // Mensaje de estado vacio si no hay resultados
                            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                <i className="fa-solid fa-search" style={{ fontSize: '2rem', marginBottom: '15px' }}></i>
                                <p>No se encontraron reservas con esos criterios.</p>
                            </div>
                        )}
                    </div>
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
    );
};

export default ReservationList;
