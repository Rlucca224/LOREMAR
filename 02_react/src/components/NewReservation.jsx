import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Flatpickr from 'react-flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import SuccessModal from './SuccessModal';

// Nota: Los estilos de Flatpickr ya están cargados en index.html o index.css

const NewReservation = () => {
    const navigate = useNavigate();

    // 1. Estados para todos los campos
    const [clientName, setClientName] = useState('');
    const [clientDni, setClientDni] = useState('');
    const [clientPhone, setClientPhone] = useState('');

    const [eventType, setEventType] = useState('');
    const [eventDate, setEventDate] = useState(null);
    const [eventDesc, setEventDesc] = useState('');

    const [hasAC, setHasAC] = useState(false);
    const [acHours, setAcHours] = useState(1);
    const [acRate, setAcRate] = useState('');

    const [priceRent, setPriceRent] = useState('');
    const [priceDeposit, setPriceDeposit] = useState('');
    const [balanceDisplay, setBalanceDisplay] = useState('Total');

    // Estado para el modal de feedback (éxito o error)
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    // Prevenir scrollbar durante la animación de entrada
    useLayoutEffect(() => {
        const viewContainer = document.getElementById('view-new-reservation');
        if (viewContainer) {
            // Bloquear overflow INMEDIATAMENTE antes del primer paint
            viewContainer.style.overflowY = 'hidden';

            // Restaurar después de la animación (450ms para margen de seguridad)
            const timer = setTimeout(() => {
                viewContainer.style.overflowY = 'auto';
            }, 450);

            return () => clearTimeout(timer);
        }
    }, []); // Solo al montar

    // 2. Efecto para Cálculo Automático de Saldo
    useEffect(() => {
        const rent = parseFloat(priceRent) || 0;
        const deposit = parseFloat(priceDeposit) || 0;

        let acTotal = 0;
        if (hasAC) {
            const hours = parseInt(acHours) || 0;
            const rate = parseFloat(acRate) || 0;
            acTotal = hours * rate;
        }

        const total = rent + acTotal;
        const pending = total - deposit;

        if (rent === 0 && deposit === 0 && acTotal === 0) {
            setBalanceDisplay("Total");
        } else if (pending <= 0 && total > 0) {
            setBalanceDisplay("Pagado");
        } else {
            // Formato: 1.234,56
            const formatted = pending.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            setBalanceDisplay(`$ ${formatted}`);
        }

    }, [priceRent, priceDeposit, hasAC, acHours, acRate]);

    // Handlers
    const handleAcHoursChange = (delta) => {
        setAcHours(prev => Math.max(1, prev + delta));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Preparar objeto para enviar
        const payload = {
            clientName,
            clientDni,
            clientPhone,
            eventType,
            eventDate, // String "dd/mm/yyyy" ?? Cuidado, el backend espera Date object o ISO string
            description: eventDesc,
            hasAc: hasAC,
            acHours,
            acPricePerHour: parseFloat(acRate) || 0,
            rentalPrice: parseFloat(priceRent) || 0,
            deposit: parseFloat(priceDeposit) || 0,
            eventTime: "Día Completo" // Valor por defecto temporal si no tenemos input
        };

        // Corrección de fecha para el backend (espera YYYY-MM-DD o ISO)
        // Si el datepicker devuelve "dd/mm/yyyy", hay que invertirlo
        if (eventDate && eventDate.includes('/')) {
            const [day, month, year] = eventDate.split('/');
            payload.eventDate = `${year}-${month}-${day}`;
        }

        try {
            console.log("Enviando reserva:", payload);
            const response = await fetch('http://localhost:4000/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const saved = await response.json();
                console.log("Reserva guardada:", saved);

                // ÉXITO: Mostrar modal verde y navegar
                setModalConfig({
                    isOpen: true,
                    type: 'success',
                    title: '¡Reserva confirmada!',
                    message: 'La reserva ha sido registrada con éxito.'
                });

                setTimeout(() => {
                    navigate('/reservas');
                }, 3000);

            } else {
                // ERROR DE BACKEND (ej. validación fallida)
                console.error("Error del servidor:", response.statusText);
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: '¡Error al guardar!',
                    message: 'Hubo un problema con los datos. Por favor revisa e intenta de nuevo.'
                });
            }
        } catch (error) {
            // ERROR DE RED
            console.error("Error de red:", error);
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: '¡Error de conexión!',
                message: 'No se pudo conectar con el servidor. Verifica tu internet.'
            });
        }
    };

    return (
        <div id="view-new-reservation" className="view active">
            <div className="form-card">
                <h2>Nueva Reserva</h2>

                <form id="reservation-form" autoComplete="off" onSubmit={handleSubmit}>

                    {/* --- Sección 1: Datos del Cliente --- */}
                    <div className="form-section">
                        <h3 className="section-title">1. Datos del Cliente</h3>
                        <div className="grid-row three-cols">
                            <div className="input-group">
                                <div className="input-wrapper">
                                    <svg className="input-icon" width="19" height="21" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.48438 2.95435C10.8474 2.95435 12.749 4.9067 12.749 7.29712C12.749 9.68754 10.8474 11.6399 8.48438 11.6399C6.12146 11.6398 4.2207 9.68746 4.2207 7.29712C4.22071 4.90679 6.12146 2.95448 8.48438 2.95435Z" stroke="#FF8D28" strokeWidth="1.2" />
                                        <path d="M16.4597 20.258V19.3494C16.4597 16.5879 14.2212 14.3494 11.4597 14.3494H5.42212C2.6607 14.3494 0.422119 16.5879 0.422119 19.3494V20.258" stroke="#FF8D28" strokeWidth="1.2" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Nombre completo"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="input-wrapper">
                                    <svg className="input-icon" width="28" height="17" viewBox="0 0 28 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="0.5" y="0.5" width="27" height="16" rx="3.5" stroke="#FF8D28" />
                                        <line x1="14" y1="4.5" x2="24" y2="4.5" stroke="#FF8D28" />
                                        <line x1="14" y1="8.5" x2="24" y2="8.5" stroke="#FF8D28" />
                                        <line x1="14" y1="12.5" x2="24" y2="12.5" stroke="#FF8D28" />
                                        <circle cx="7.5" cy="5.5" r="2" stroke="#FF8D28" />
                                        <path d="M4 13V12C4 10.8954 4.89543 10 6 10H9C10.1046 10 11 10.8954 11 12V13" stroke="#FF8D28" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="DNI"
                                        value={clientDni}
                                        onChange={(e) => setClientDni(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <div className="input-wrapper">
                                    <svg className="input-icon" width="24" height="22" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="24" height="22" stroke="none" fill="none" />
                                        <path d="M3 5.04167C3 12.8887 9.93959 19.25 18.5 19.25C18.8862 19.25 19.2691 19.2371 19.6483 19.2116C20.0834 19.1823 20.3009 19.1678 20.499 19.0633C20.663 18.9767 20.8185 18.8233 20.9007 18.667C21 18.4784 21 18.2583 21 17.8182V15.2356C21 14.8655 21 14.6804 20.9335 14.5218C20.8749 14.3817 20.7795 14.2569 20.6559 14.1585C20.516 14.047 20.3262 13.9837 19.9468 13.8572L16.74 12.7883C16.2985 12.6412 16.0777 12.5676 15.8683 12.5801C15.6836 12.5911 15.5059 12.6489 15.3549 12.747C15.1837 12.8582 15.0629 13.0428 14.8212 13.4121L14 14.6667C11.3501 13.5666 9.2019 11.5948 8 9.16667L9.36863 8.41392C9.77145 8.19237 9.97286 8.08159 10.0942 7.92464C10.2012 7.78624 10.2643 7.62334 10.2763 7.45406C10.2899 7.26208 10.2096 7.05974 10.0491 6.65505L8.88299 3.71544C8.745 3.36761 8.67601 3.19369 8.55442 3.06543C8.44701 2.95212 8.31089 2.86472 8.15802 2.81091C7.98496 2.75 7.78308 2.75 7.37932 2.75H4.56201C4.08188 2.75 3.84181 2.75 3.63598 2.84098C3.4655 2.91634 3.29814 3.05893 3.2037 3.20928C3.08968 3.39081 3.07375 3.59023 3.04189 3.98909C3.01413 4.33662 3 4.68763 3 5.04167Z" stroke="#FF8D28" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <input
                                        type="tel"
                                        placeholder="Numero de telefono"
                                        value={clientPhone}
                                        onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))} // Solo números
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Sección 2: Detalles del Evento --- */}
                    <div className="form-section">
                        <h3 className="section-title">2. Detalles del Evento</h3>
                        <div className="grid-row three-cols">
                            <div className="input-group">
                                <label>Tipo de Evento</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Cumpleaños, Boda..."
                                        value={eventType}
                                        onChange={(e) => setEventType(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Fecha del Evento</label>
                                <div className="input-wrapper">
                                    <Flatpickr
                                        value={eventDate}
                                        onChange={([date], dateStr) => setEventDate(dateStr)}
                                        options={{
                                            locale: Spanish,
                                            dateFormat: "d/m/Y",
                                            disableMobile: true,
                                            allowInput: true
                                        }}
                                        render={({ defaultValue, value, ...props }, ref) => {
                                            return (
                                                <input
                                                    {...props}
                                                    ref={ref}
                                                    placeholder="dd/mm/yyyy"
                                                    value={eventDate || ''}
                                                    onChange={(e) => {
                                                        // Lógica de máscara idéntica a utils.js
                                                        let v = e.target.value.replace(/\D/g, '');
                                                        if (v.length > 8) v = v.slice(0, 8);

                                                        if (v.length >= 5) {
                                                            v = v.replace(/^(\d{2})(\d{2})(\d{0,4}).*/, '$1/$2/$3');
                                                        } else if (v.length >= 3) {
                                                            v = v.replace(/^(\d{2})(\d{0,2}).*/, '$1/$2');
                                                        }
                                                        setEventDate(v);
                                                    }}
                                                    onKeyDown={(e) => {
                                                        const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter'];
                                                        // Permitir control keys o números
                                                        if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    // Combinar estilo inline mínimo con la clase existente si es necesario
                                                    style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', outline: 'none' }}
                                                />
                                            );
                                        }}
                                    />
                                    <i className="fa-regular fa-calendar input-icon-right"></i>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Descripción</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Descripcion"
                                        value={eventDesc}
                                        onChange={(e) => setEventDesc(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Sección 3: Servicios Adicionales --- */}
                    <div className="form-section">
                        <h3 className="section-title">3. Servicios Adicionales</h3>
                        <div className="services-row">
                            <div className="service-toggle">
                                <span>Aire Acondicionado</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={hasAC}
                                        onChange={(e) => setHasAC(e.target.checked)}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>

                            <div className={`service-controls ${hasAC ? 'active' : ''}`}>
                                <div className="input-group mini-group">
                                    <label>Horas</label>
                                    <div className="stepper">
                                        <button type="button" className="stepper-btn" onClick={() => handleAcHoursChange(-1)}>-</button>
                                        <input type="number" value={acHours} readOnly className="stepper-input" />
                                        <button type="button" className="stepper-btn" onClick={() => handleAcHoursChange(1)}>+</button>
                                    </div>
                                </div>
                                <div className="input-group mini-group">
                                    <label>Tarifa por Hora</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            placeholder="Tarifa"
                                            value={acRate}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^\d*\.?\d*$/.test(val)) setAcRate(val);
                                            }}
                                        />
                                        <i className="fa-solid fa-dollar-sign input-icon-right"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Sección 4: Montos y Pagos --- */}
                    <div className="form-section">
                        <h3 className="section-title">4. Montos y Pagos</h3>
                        <div className="grid-row three-cols">
                            <div className="input-group">
                                <label>Precio Alquiler</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Precio Alquiler"
                                        value={priceRent}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*\.?\d*$/.test(val)) setPriceRent(val);
                                        }}
                                    />
                                    <i className="fa-solid fa-dollar-sign input-icon-right"></i>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Seña Recibida</label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Seña recibida"
                                        value={priceDeposit}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^\d*\.?\d*$/.test(val)) setPriceDeposit(val);
                                        }}
                                    />
                                    <i className="fa-solid fa-dollar-sign input-icon-right"></i>
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Saldo Pendiente</label>
                                <div className="input-wrapper locked">
                                    <input
                                        type="text"
                                        value={balanceDisplay}
                                        readOnly
                                    />
                                    <i className="fa-solid fa-dollar-sign input-icon-right"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button type="submit" className="btn-submit">
                            Reservar
                        </button>
                    </div>

                </form>
            </div>
            <SuccessModal
                isOpen={modalConfig.isOpen}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default NewReservation;
