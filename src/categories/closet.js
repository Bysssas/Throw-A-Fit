import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; 
// Use 'framer-motion' for the animation hooks
import { motion, useInView } from 'framer-motion'; 
import './closet.css'; 

// =========================================================================
// 1. ANIMATED LIST SUB-COMPONENTS (Defined within this file)
// =========================================================================

const AnimatedItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef(null);
  // Trigger animation when 50% of the item is visible
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      // Initial state (before scrolling into view)
      initial={{ scale: 0.7, opacity: 0 }}
      // Animated state (when in view)
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      // Style to ensure item box respects flex layout
      style={{ cursor: 'pointer', flexShrink: 0 }} 
    >
      {children}
    </motion.div>
  );
};


const AnimatedList = ({
  items = [],
  onItemSelect,
  showGradients = false, // Set to false since the layout is handled by Closet.js
  enableArrowNavigation = false,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  // Scroll logic for gradients (not used in this horizontal setup, but kept for completeness)
  const handleScroll = e => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };
  
  // Keyboard navigation logic (disabled by default in Closet, but included here)
  useEffect(() => {
    // ... (Your keyboard navigation logic) ...
    // Note: The logic for arrow navigation is complex when nested horizontally, 
    // but the component is set up correctly to support it if needed.
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    // ... (Your scroll-to-selected-item logic) ...
  }, [selectedIndex, keyboardNav]);


  return (
    <div className={`scroll-list-container ${className}`}>
      <div 
        ref={listRef} 
        className={`scroll-list ${!displayScrollbar ? 'no-scrollbar' : ''}`} 
        onScroll={handleScroll}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={index}
            // Use index for staggered horizontal appearance
            delay={0.05 * index} 
            index={index}
            onMouseEnter={() => setSelectedIndex(index)}
            onClick={() => {
              setSelectedIndex(index);
              if (onItemSelect) {
                onItemSelect(item, index);
              }
            }}
          >
            <div className={`item ${selectedIndex === index ? 'selected' : ''} ${itemClassName}`}>
              <p className="item-text">{item}</p>
            </div>
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div className="top-gradient" style={{ opacity: topGradientOpacity }}></div>
          <div className="bottom-gradient" style={{ opacity: bottomGradientOpacity }}></div>
        </>
      )}
    </div>
  );
};


// =========================================================================
// 2. MAIN CLOSET COMPONENT
// =========================================================================

// --- DUMMY DATA ---
const categoriesData = [
  { name: 'Tops', endpoint: '/closet/tops', items: ['T-Shirt', 'Blouse', 'Sweater', 'Tank Top', 'Hoodie', 'Polo Shirt', 'Tunic'] },
  { name: 'Bottoms', endpoint: '/closet/bottoms', items: ['Jeans', 'Skirt', 'Shorts', 'Trousers', 'Leggings', 'Capris'] },
  { name: 'Accessories', endpoint: '/closet/accessories', items: ['Scarf', 'Hat', 'Belt', 'Necklace', 'Earrings', 'Watch'] },
  { name: 'Shoes', endpoint: '/closet/shoes', items: ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Loafers'] },
];
// ------------------

export default function Closet() {
  const navigate = useNavigate();
  const [mainPreviewItem, setMainPreviewItem] = useState(null); 

  // Function to handle item selection from any AnimatedList
  const handleItemSelect = (item) => {
    setMainPreviewItem(item);
  };

  return (
    <div className="closet-page-wrapper">
      
      {/* HEADER */}
      <div className="closet-header">
        <div className="closet-title-area">
          <FaUserCircle 
            className="account-icon" 
            size={24} 
            onClick={() => navigate('/profile')} 
            title="Go to Profile"
          />
          <h2>Closet</h2>
        </div>
        <button className="close-btn" onClick={() => navigate('/')}>&times;</button>
      </div>

      {/* 1. MAIN PREVIEW AREA */}
      <div className="main-preview-container">
        {mainPreviewItem ? (
          <p className="preview-text">Previewing: **{mainPreviewItem}**</p>
        ) : (
          <p className="preview-text">Click an item below to see the preview, or view your saved outfit.</p>
        )}
      </div>

      {/* 2. CATEGORY PREVIEWS */}
      <div className="category-list">
        {categoriesData.map((category) => (
          <div key={category.name} className="category-row-wrapper">
            
            <div className="category-header-and-button">
              <h3 className="category-name">{category.name}</h3>
              <button 
                className="more-btn"
                onClick={() => navigate(category.endpoint)}
              >
                More &raquo;
              </button>
            </div>

            <div className="animated-list-container">
                <AnimatedList
                    items={category.items}
                    onItemSelect={handleItemSelect}
                    showGradients={false} 
                    enableArrowNavigation={false} 
                    displayScrollbar={true} 
                    className="horizontal-list-wrapper"
                    itemClassName="item-preview-box-animated"
                />
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}