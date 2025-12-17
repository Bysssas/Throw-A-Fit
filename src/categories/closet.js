import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaTrash } from "react-icons/fa";
import { motion, useInView } from "framer-motion";
import { useCloset } from "../categories/ClosetContext";
import { useUser } from "../categories/UserContext";
import "./closet.css";

const BASE_API_URL = process.env.REACT_APP_API_URL;

const ENDPOINT_MAP = {
  Tops: "/items/tops",
  Bottoms: "/items/bottoms",
  Accessories: "/items/accessories",
  Shoes: "/items/shoes",
};

// ────────── Preview draggable item ──────────
const DraggablePreviewItem = ({ item, index, onDragStart, onRemoveFromPreview }) => {
  const ref = useRef(null);

  const handleMouseDown = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    onDragStart(index, e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (window.confirm("Remove this item from preview?")) {
      onRemoveFromPreview();
    }
  };

  return (
    <img
      ref={ref}
      src={item.imageUrl}
      alt={item.name}
      className="preview-layer-item"
      style={{ top: item.y, left: item.x, zIndex: index + 10 }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      draggable={false}
    />
  );
};

// ────────── Animated list item ──────────
const AnimatedItem = ({ children, delay = 0, onClick, onDelete }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      style={{ cursor: "pointer", flexShrink: 0, position: "relative" }}
    >
      {children}
      {onDelete && (
        <FaTrash
          className="item-delete-icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      )}
    </motion.div>
  );
};

// ────────── Animated scrollable list ──────────
const AnimatedList = ({ items = [], onItemSelect, onItemDelete }) => (
  <div className="scroll-list-container horizontal-list-wrapper">
    <div
      className="scroll-list"
      style={{
        display: "flex",
        gap: "15px",
        flexWrap: "wrap",
        justifyContent: "flex-start",
      }}
    >
      {items.map((item, index) => (
        <AnimatedItem
          key={item._id || `${item.name}-${index}`}
          delay={0.05 * index}
          onClick={() => onItemSelect(item)}
          onDelete={onItemDelete ? () => onItemDelete(item) : null}
        >
          <div className="item item-preview-box-animated">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="item-image" />
            ) : (
              <p className="item-text">No image</p>
            )}
          </div>
        </AnimatedItem>
      ))}
    </div>
  </div>
);

export default function Closet() {
  const navigate = useNavigate();
  const {
    previewItems,
    mainPreviewItem,
    addItemToPreview,
    removeItemFromPreview,
    updateItemPosition,
    resetCloset,
  } = useCloset();
  const { user } = useUser();

  const [clothesData, setClothesData] = useState({
    Tops: [],
    Bottoms: [],
    Accessories: [],
    Shoes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const previewRef = useRef(null);
  const draggingRef = useRef({ index: -1, offsetX: 0, offsetY: 0 });

  // ─── FETCH CLOTHES ───
  useEffect(() => {
    const fetchClothes = async () => {
      if (!user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No auth token found");
        setLoading(false);
        return;
      }

      try {
        resetCloset();

        const results = await Promise.all(
          Object.entries(ENDPOINT_MAP).map(async ([category, endpoint]) => {
            const res = await fetch(`${BASE_API_URL}${endpoint}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
              const errText = await res.text();
              throw new Error(`Failed to load ${category}: ${errText}`);
            }

            const items = await res.json();
            return items.map((item) => ({
              ...item,
              category,
              originalCategory: (item.category || "").toLowerCase(),
            }));
          })
        );

        const grouped = Object.keys(ENDPOINT_MAP).reduce((acc, category, i) => {
          acc[category] = results[i];
          return acc;
        }, {});

        setClothesData(grouped);
      } catch (err) {
        console.error("Closet fetch error:", err);
        setError(err.message || "Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    fetchClothes();
  }, [user, resetCloset]);

  // ─── DELETE ITEM FROM DATABASE ───
  const deleteItemFromDB = async (itemId, category) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No auth token found");
      return;
    }

    try {
      const res = await fetch(`${BASE_API_URL}/items/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to delete item: ${errText}`);
      }

      // Remove from clothesData
      setClothesData((prev) => ({
        ...prev,
        [category]: prev[category].filter((item) => item._id !== itemId),
      }));

      // Remove from preview
      removeItemFromPreviewById(itemId);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete item");
    }
  };

  // ─── Helper: remove item from preview by ID ───
  const removeItemFromPreviewById = (itemId) => {
    const index = previewItems.findIndex((item) => item._id === itemId);
    if (index !== -1) removeItemFromPreview(index);
  };

  // ─── DRAG & DROP ───
  const handleDragStart = (index, offsetX, offsetY) => {
    draggingRef.current = { index, offsetX, offsetY };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const { index, offsetX, offsetY } = draggingRef.current;
    if (index < 0) return;
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;

    const newX = e.clientX - rect.left - offsetX;
    const newY = e.clientY - rect.top - offsetY;

    updateItemPosition(index, newX, newY);
  };

  const handleMouseUp = () => {
    draggingRef.current = { index: -1, offsetX: 0, offsetY: 0 };
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  if (loading) return <div className="closet-page-wrapper loading-state">Loading wardrobe…</div>;
  if (error) return <div className="closet-page-wrapper error-state">{error}</div>;

  return (
    <div className="closet-page-wrapper">
      {/* HEADER */}
      <div className="closet-header">
        <div className="closet-title-area">
          <FaUserCircle className="account-icon" size={24} onClick={() => navigate("/profile")} />
          <h2>Closet</h2>
        </div>
        <button className="close-btn" onClick={() => navigate("/")}>×</button>
      </div>

      {/* PREVIEW AREA */}
      <div className="upgraded-preview" ref={previewRef}>
        {previewItems.length > 0 ? (
          previewItems.map((item, i) => (
            <DraggablePreviewItem
              key={item._id || `${item.name}-${i}`}
              item={item}
              index={i}
              onDragStart={handleDragStart}
              onRemoveFromPreview={() => removeItemFromPreview(i)}
            />
          ))
        ) : mainPreviewItem?.imageUrl ? (
          <img src={mainPreviewItem.imageUrl} alt={mainPreviewItem.name} className="main-preview-image" />
        ) : (
          <p className="preview-text">Click an item below to preview it.</p>
        )}
      </div>

      {/* ITEM CATEGORIES */}
      {Object.keys(clothesData).map((category) => (
        <div key={category} className="category-row-wrapper">
          <div className="category-header-and-button">
            <h3 className="category-name">{category}</h3>
            <button
              className="more-btn"
              onClick={() => navigate(`/category/${category.toLowerCase()}`)}
            >
              More
            </button>
          </div>
          <div className="animated-list-container">
            <AnimatedList
              items={clothesData[category]}
              onItemSelect={(item) =>
                addItemToPreview(item, previewRef.current?.offsetWidth, previewRef.current?.offsetHeight)
              }
              onItemDelete={(item) => {
                if (window.confirm("Delete this item from your closet?")) {
                  deleteItemFromDB(item._id, category);
                }
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
