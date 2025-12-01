import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import './closet.css';

const BASE_API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export default function Closet() {
    const navigate = useNavigate();
    const location = useLocation();
    const [clothesData, setClothesData] = useState({
        Tops: [], Bottoms: [], Accessories: [], Shoes: []
    });
    const [loading, setLoading] = useState(true);
    const [previewItems, setPreviewItems] = useState([]);
    const previewRef = useRef(null);

    useEffect(() => {
        const fetchClothes = async () => {
            setLoading(true);
            const categories = [
                { name: 'Tops', endpoint: '/items/tops' },
                { name: 'Bottoms', endpoint: '/items/bottoms' },
                { name: 'Accessories', endpoint: '/items/accessories' },
                { name: 'Shoes', endpoint: '/items/shoes' }
            ];

            try {
                const results = await Promise.all(
                    categories.map(async ({ name, endpoint }) => {
                        const res = await fetch(`${BASE_API_URL}${endpoint}`);
                        if (!res.ok) return [];
                        const items = await res.json();
                        
                        return items.filter(item => item.category?.toLowerCase() === name.toLowerCase());
                    })
                );

                setClothesData({
                    Tops: results[0],
                    Bottoms: results[1],
                    Accessories: results[2],
                    Shoes: results[3]
                });
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchClothes();
    }, []);

    
    useEffect(() => {
        if (location.state?.addToPreview) {
            const item = location.state.addToPreview;
            const rect = previewRef.current?.getBoundingClientRect();
            const centerX = rect ? (rect.width - 200) / 2 : 100;
            const centerY = rect ? (rect.height - 300) / 2 : 100;
            setPreviewItems(prev => [...prev, { ...item, x: centerX, y: centerY }]);
            navigate('/closet', { replace: true });
        }
    }, [location.state, navigate]);

    const openCategoryPage = (category) => {
        
        const items = clothesData[category]?.filter(item => item.category?.toLowerCase() === category.toLowerCase()) || [];
        navigate(`/closet/${category.toLowerCase()}`, { state: { items } });
    };

    const addToPreview = (item) => {
        const rect = previewRef.current?.getBoundingClientRect();
        const centerX = rect ? (rect.width - 200) / 2 : 100;
        const centerY = rect ? (rect.height - 300) / 2 : 100;
        setPreviewItems(prev => [...prev, { ...item, x: centerX, y: centerY }]);
    };

    if (loading) return <div className="closet-page-wrapper">Loading wardrobe…</div>;

    return (
        <div className="closet-page-wrapper">
            <div className="closet-header">
                <div className="closet-title-area">
                    <FaUserCircle className="account-icon" size={24} onClick={() => navigate('/profile')} />
                    <h2>Closet</h2>
                </div>
                <button className="close-btn" onClick={() => navigate('/')}>×</button>
            </div>

            <div className="upgraded-preview" ref={previewRef}>
                {previewItems.length > 0 ? (
                    previewItems.map((item, i) => (
                        <img
                            key={i}
                            src={item.imageUrl}
                            alt={item.name}
                            className="preview-layer-item"
                            style={{ top: item.y, left: item.x, zIndex: i + 10 }}
                            onDoubleClick={() => setPreviewItems(prev => prev.filter((_, idx) => idx !== i))}
                        />
                    ))
                ) : (
                    <p className="preview-text">Click any item to add it here</p>
                )}
            </div>

            {['Tops', 'Bottoms', 'Accessories', 'Shoes'].map(category => {
                const items = clothesData[category]?.filter(item => item.category?.toLowerCase() === category.toLowerCase()) || [];

                return (
                    <div key={category} className="category-row-wrapper">
                        <div className="category-header-and-button">
                            <h3 className="category-name">{category}</h3>
                            <button className="more-btn" onClick={() => openCategoryPage(category)}>
                                More »
                            </button>
                        </div>

                        <div className="animated-list-container">
                            <div style={{ display: 'flex', gap: '15px', padding: '10px 0' }}>
                                {items.length === 0 ? (
                                    <p style={{ color: '#999' }}>No items yet</p>
                                ) : (
                                    items.slice(0, 10).map((item, idx) => (
                                        <motion.div
                                            key={item._id || idx}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            style={{ cursor: 'pointer', flexShrink: 0 }}
                                            onClick={() => addToPreview(item)}
                                        >
                                            <div className="item item-preview-box-animated">
                                                <img src={item.imageUrl} alt={item.name} className="item-image" />
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}