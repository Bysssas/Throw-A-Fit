import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import './closet.css';

const BASE_API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const ENDPOINT_MAP = {
    Tops: '/items/tops',
    Bottoms: '/items/bottoms',
    Accessories: '/items/accessories',
    Shoes: '/items/shoes',
};

const initialDataStructure = {
    Tops: [],
    Bottoms: [],
    Accessories: [],
    Shoes: [],
};

// ──────────────────────────────
// ANIMATED LIST COMPONENTS
// ──────────────────────────────
const AnimatedItem = ({ children, delay = 0, index, onClick }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { amount: 0.5 });

    return (
        <motion.div
            ref={ref}
            onClick={onClick}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.2, delay }}
            style={{ cursor: "pointer", flexShrink: 0 }}
        >
            {children}
        </motion.div>
    );
};

const AnimatedList = ({ items = [], onItemSelect }) => {
    return (
        <div className="scroll-list-container horizontal-list-wrapper">
            <div className="scroll-list" style={{ display: 'flex', gap: '15px' }}>
                {items.map((item, index) => (
                    <AnimatedItem
                        key={item._id}
                        index={index}
                        delay={0.05 * index}
                        onClick={() => onItemSelect(item)}
                    >
                        <div className="item item-preview-box-animated">
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name || "Item"}
                                    className="item-image"
                                />
                            ) : (
                                <p className="item-text">No image</p>
                            )}
                        </div>
                    </AnimatedItem>
                ))}
            </div>
        </div>
    );
};

// ──────────────────────────────
// MODAL (More button)
// ──────────────────────────────
const CategoryModal = ({ category, items, onClose, onSelect }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{category}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-grid">
                    {items.map(item => (
                        <div
                            key={item._id}
                            className="modal-item"
                            onClick={() => {
                                onSelect(item);
                                onClose();
                            }}
                        >
                            {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} />
                            ) : (
                                <div className="no-image">No image</div>
                            )}
                            <p>{item.name || "Unnamed"}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ──────────────────────────────
// MAIN CLOSET PAGE
// ──────────────────────────────
export default function Closet() {
    const navigate = useNavigate();
    const [mainPreviewItem, setMainPreviewItem] = useState(null);
    const [clothesData, setClothesData] = useState(initialDataStructure);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalCategory, setModalCategory] = useState("");
    const [modalItems, setModalItems] = useState([]);

    useEffect(() => {
        const fetchClothes = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    Object.entries(ENDPOINT_MAP).map(async ([correctCategory, endpoint]) => {
                        const res = await fetch(`${BASE_API_URL}${endpoint}`);
                        if (!res.ok) throw new Error(`Failed to load ${correctCategory}`);
                        const items = await res.json();

                        return items.map(item => ({
                            ...item,
                            category: correctCategory,                  // Forces display category
                            originalCategory: item.category?.trim() || ""  // Normalize backend category
                        }));
                    })
                );

                const grouped = Object.keys(ENDPOINT_MAP).reduce((acc, category, i) => {
                    acc[category] = results[i];
                    return acc;
                }, {});

                setClothesData(grouped);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClothes();
    }, []);

    const openModal = (category) => {
        setModalCategory(category);
        setModalItems(
            (clothesData[category] || []).filter(
                item => item.originalCategory.toLowerCase() === category.toLowerCase()
            )
        );
        setModalOpen(true);
    };

    if (loading) return <div className="closet-page-wrapper loading-state">Loading wardrobe…</div>;
    if (error) return <div className="closet-page-wrapper error-state">Warning: {error}</div>;

    return (
        <div className="closet-page-wrapper">
            {/* HEADER */}
            <div className="closet-header">
                <div className="closet-title-area">
                    <FaUserCircle className="account-icon" size={24} onClick={() => navigate('/profile')} />
                    <h2>Closet</h2>
                </div>
                <button className="close-btn" onClick={() => navigate('/')}>×</button>
            </div>

            {/* MAIN PREVIEW */}
            <div className="main-preview-container">
                {mainPreviewItem?.imageUrl ? (
                    <img src={mainPreviewItem.imageUrl} alt={mainPreviewItem.name} className="main-preview-image" />
                ) : (
                    <p className="preview-text">
                        {mainPreviewItem ? mainPreviewItem.name : "Click an item below to preview it."}
                    </p>
                )}
            </div>

            {/* CATEGORIES */}
            {Object.keys(clothesData).map(category => {
                const filteredItems = clothesData[category].filter(
                    item => item.originalCategory.toLowerCase() === category.toLowerCase()
                );

                return (
                    <div key={category} className="category-row-wrapper">
                        <div className="category-header-and-button">
                            <h3 className="category-name">{category}</h3>
                            {filteredItems.length > 0 && (
                                <button className="more-btn" onClick={() => openModal(category)}>
                                    More »
                                </button>
                            )}
                        </div>

                        <div className="animated-list-container">
                            <AnimatedList
                                items={filteredItems}
                                onItemSelect={setMainPreviewItem}
                            />
                        </div>
                    </div>
                );
            })}

            {/* MODAL */}
            {modalOpen && (
                <CategoryModal
                    category={modalCategory}
                    items={modalItems}
                    onClose={() => setModalOpen(false)}
                    onSelect={setMainPreviewItem}
                />
            )}
        </div>
    );
}
