import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function CategoryPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const items = location.state?.items || [];
    const categoryName = location.pathname.split('/').pop();
    const title = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

    return (
        <div className="closet-page-wrapper">
            <div className="closet-header">
                <button className="close-btn" onClick={() => navigate('/closet')}>
                    <FaArrowLeft size={28} />
                </button>
                <h2>{title}</h2>
                <div style={{ width: 40 }}></div>
            </div>

            {items.length === 0 ? (
                <p style={{ textAlign: 'center', marginTop: 100, color: '#999' }}>
                    No items in {title} yet
                </p>
            ) : (
                <div className="modal-grid" style={{ marginTop: 30, padding: '0 20px' }}>
                    {items.map(item => (
                        <div
                            key={item._id}
                            className="modal-item"
                            onClick={() => navigate('/closet', { state: { addToPreview: item } })}
                        >
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name || "Item"} />
                            ) : (
                                <div className="no-image">No image</div>
                            )}
                            <p>{item.name || "Unnamed Item"}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}