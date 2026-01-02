import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="loading-overlay">
            <div className="spinner-container">
                <div className="spinner"></div>
                <p className="loading-text">Verificando sesión...</p>
            </div>
        </div>
    );
};

export default LoadingSpinner;
