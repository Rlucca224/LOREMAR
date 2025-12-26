import React, { useState, useEffect } from 'react';
import ReservationCard from './ReservationCard';
import { generateDummyData } from '../utils/data';

const ReservationList = () => {
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        // Cargar datos
        const data = generateDummyData();
        setReservations(data);
    }, []);

    return (
        <div style={{ padding: '20px', width: '100%' }}>
            {/* Replication of the Checklist Header structure */}
            <div className="checklist-header" style={{ display: 'flex' }}> {/* Forcing flex based on observed behavior */}
                <div className="col-nro" style={{ cursor: 'pointer' }}>Nro <i className="fa-solid fa-sort"></i></div>
                <div className="col-estado">Estado</div>
                <div className="col-cliente" style={{ cursor: 'pointer' }}>Cliente <i className="fa-solid fa-sort"></i></div>
                <div className="col-fecha-reserva" style={{ cursor: 'pointer' }}>Reservado el <i className="fa-solid fa-sort"></i></div>
                <div className="col-uso">Uso</div>
                <div className="col-fecha-evento" style={{ cursor: 'pointer' }}>Fecha del Evento<i className="fa-solid fa-sort"></i></div>
                <div className="col-servicios">Servicios</div>
                <div className="col-btn-cancel">Cancelar Deuda</div>
                <div className="col-btn-view"></div>
                <div className="col-btn-more"></div>
            </div>

            <div id="view-checklist" className="view active" style={{ marginTop: '10px' }}>
                <div className="checklist-container">
                    <div id="reservations-list" className="reservations-list">
                        {reservations.map(res => (
                            <ReservationCard
                                key={res.nro}
                                res={res}
                                onEdit={(r) => console.log('Edit request:', r)}
                                onDelete={(id) => console.log('Delete request:', id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReservationList;
