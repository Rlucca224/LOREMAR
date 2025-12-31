import React from 'react';

const SkeletonCard = ({ className = '', style = {} }) => {
    return (
        <div className={`reservation-item ${className}`} style={{ pointerEvents: 'none', opacity: 1 }}>
            <div className="reservation-card skeleton-bar" style={style}></div>
        </div>
    );
};

export default SkeletonCard;
