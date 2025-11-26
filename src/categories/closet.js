import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa'; 
import './closet.css'; 

// Import the new components
import AnimatedList from './AnimatedList'; 
// Assuming AnimatedItem is defined within AnimatedList, so we don't import it directly

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
    <div className="closet-page-wrapper"> {/* Changed class to wrapper the full page */}
      
      {/* HEADER: Title, Account Icon, and Close Button */}
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

      {/* 1. MAIN PREVIEW AREA (The big gray rectangle) */}
      <div className="main-preview-container">
        {mainPreviewItem ? (
          <p className="preview-text">Previewing: **{mainPreviewItem}**</p>
        ) : (
          <p className="preview-text">Click an item below to see the preview, or view your saved outfit.</p>
        )}
      </div>

      {/* 2. CATEGORY PREVIEWS - Using the AnimatedList for each row */}
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

            {/* The Animated List is used here to display the items horizontally and scrollable */}
            <div className="animated-list-container">
                <AnimatedList
                    items={category.items}
                    onItemSelect={handleItemSelect}
                    showGradients={false} // Turn off list gradients to use page gradients
                    enableArrowNavigation={false} // Disable keyboard nav for embedded lists
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