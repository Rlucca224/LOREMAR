import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from '../assets/success-animation.json';

const SuccessModal = ({ isOpen, type = 'success', title, message, onClose }) => {

    useEffect(() => {
        // Auto-cierre solo si es error
        if (isOpen && type === 'error') {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, 3000); // El error se va a los 3s
            return () => clearTimeout(timer);
        }
    }, [isOpen, type, onClose]);

    if (!isOpen) return null;

    const isSuccess = type === 'success';

    return (
        <div className="modal-overlay show" style={{ zIndex: 9999 }}>
            <div className="modal-box">
                <div style={{ width: 80, height: 80, margin: 'auto' }}>
                    {isSuccess ? (
                        <Lottie
                            animationData={animationData}
                            loop={false}
                            autoplay={true}
                        />
                    ) : (
                        <svg viewBox="0 0 50 50" style={{ width: '100%', height: '100%' }}>
                            <circle cx="25" cy="25" r="20" fill="#ef4444" opacity="0.2" />
                            <circle cx="25" cy="25" r="15" fill="#ef4444" />
                            <path d="M18 18 L32 32 M32 18 L18 32" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </svg>
                    )}
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>
                    {title || (isSuccess ? "¡Reserva confirmada!" : "¡Ha ocurrido un error!")}
                </h2>
                <p style={{ color: '#aaa', fontSize: '1rem' }}>
                    {message || (isSuccess ? "La reserva ha sido registrada con éxito." : "No se pudo realizar la acción.")}
                </p>
            </div>
        </div>
    );
};

export default SuccessModal;
