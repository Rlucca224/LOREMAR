import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay show" style={{ zIndex: 9999 }}>
            <div className="modal-box" style={{ maxWidth: '400px', padding: '30px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>
                    {title || '¿Eliminar reserva?'}
                </h2>
                <p style={{ color: '#aaa', fontSize: '1rem', marginBottom: '25px', lineHeight: '1.5' }}>
                    {message || "Esta acción no se puede deshacer."}
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#444',
                            color: '#e5e5e5',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#555'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#444'}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#ef4444',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
