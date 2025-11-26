import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import { motion, useInView } from 'framer-motion';
import './closet.css';

// ✅ Your actual backend URL
const BASE_API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ✅ Correct endpoint map based on your backend routes
const ENDPOINT_MAP = {
    Tops: '/items/tops',
    Bottoms: '/items/bottoms',
    Accessories: '/items/accessories',
    Shoes: '/items/shoes',
};

// Empty data shape for starting state
const initialDataStructure = {
    Tops: [],
    Bottoms: [],
    Accessories: [],
    Shoes: [],
};

// =====================================================
// 1. ANIMATED LIST COMPONENTS
// =====================================================

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { amount: 0.5 });

    return (
        <motion.div
            ref={ref}
            data-index={index}
            onMouseEnter={onMouseEnter}
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

const AnimatedList = ({
    items = [],
    onItemSelect,
    className = "",
    itemClassName = "",
}) => {
    return (
        <div className={`scroll-list-container ${className}`}>
            <div className="scroll-list">
                {items.map((item, index) => (
                    <AnimatedItem
                        key={item._id || index}
                        index={index}
                        delay={0.05 * index}
                        onClick={() => onItemSelect(item)}
                    >
                        <div className={`item ${itemClassName}`}>
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl}
                                    alt={item.name || "Clothing item"}
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

// =====================================================
// 2. MAIN CLOSET PAGE
// =====================================================

export default function Closet() {
    const navigate = useNavigate();
    const [mainPreviewItem, setMainPreviewItem] = useState(null);
    const [clothesData, setClothesData] = useState(initialDataStructure);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch clothes on load
    useEffect(() => {
        const fetchClothes = async () => {
            setLoading(true);
            setError("");

            try {
                const fetchPromises = Object.keys(ENDPOINT_MAP).map(async (category) => {
                    const endpoint = `${BASE_API_URL}${ENDPOINT_MAP[category]}`;

                    const response = await fetch(endpoint);

                    if (!response.ok)
                        throw new Error(`Failed to fetch ${category}`);

                    const items = await response.json();

                    return { category, items };
                });

                const results = await Promise.all(fetchPromises);

                // Organize by category
                const grouped = results.reduce((acc, result) => {
                    acc[result.category] = result.items.map((item) => ({
                        _id: item._id,
                        name: item.name || "",
                        imageUrl: item.imageUrl, // Correct field from MongoDB
                    }));
                    return acc;
                }, {});

                setClothesData(grouped);
            } catch (err) {
                setError(err.message || "Failed to load wardrobe");
            } finally {
                setLoading(false);
            }
        };

        fetchClothes();
    }, []);

    if (loading) {
        return <div className="closet-page-wrapper loading-state">Loading your wardrobe…</div>;
    }

    if (error) {
        return <div className="closet-page-wrapper error-state">⚠️ {error}</div>;
    }

    const categoriesList = Object.keys(clothesData);

    return (
        <div className="closet-page-wrapper">

            {/* HEADER */}
            <div className="closet-header">
                <div className="closet-title-area">
                    <FaUserCircle
                        className="account-icon"
                        size={24}
                        onClick={() => navigate('/profile')}
                        title="Profile"
                    />
                    <h2>Closet</h2>
                </div>
                <button className="close-btn" onClick={() => navigate('/')}>
                    &times;
                </button>
            </div>

            {/* MAIN PREVIEW */}
            <div className="main-preview-container">
                {mainPreviewItem && mainPreviewItem.imageUrl ? (
                    <img
                        src={mainPreviewItem.imageUrl}
                        alt={mainPreviewItem.name}
                        className="main-preview-image"
                    />
                ) : (
                    <p className="preview-text">
                        {mainPreviewItem ? 
                          `Selected: ${mainPreviewItem.name}` :
                          "Click an item below to preview it."}
                    </p>
                )}
            </div>

            {/* CATEGORY ROWS */}
            <div className="category-list">
                {categoriesList.map((categoryName) => (
                    <div key={categoryName} className="category-row-wrapper">

                        <div className="category-header-and-button">
                            <h3 className="category-name">{categoryName}</h3>
                            <button
                                className="more-btn"
                                onClick={() => navigate(`/closet/${categoryName.toLowerCase()}`)}
                            >
                                More &raquo;
                            </button>
                        </div>

                        <div className="animated-list-container">
                            {clothesData[categoryName]?.length > 0 ? (
                                <AnimatedList
                                    items={clothesData[categoryName]}
                                    onItemSelect={setMainPreviewItem}
                                    className="horizontal-list-wrapper"
                                    itemClassName="item-preview-box-animated"
                                />
                            ) : (
                                <p className="no-items-text">
                                    No {categoryName} yet — time to upload!
                                </p>
                            )}
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
