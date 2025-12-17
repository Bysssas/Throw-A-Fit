import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useCloset } from "../categories/ClosetContext";
import { motion, useInView } from "framer-motion";
import "./closet.css"; // reuse closet styles

const BASE_API_URL = process.env.REACT_APP_API_URL || "https://throw-a-fit.onrender.com/api";

// ─── Animated Item for Horizontal List ───
const AnimatedItem = ({ children, delay = 0, onClick }) => {
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

const AnimatedList = ({ items = [], onItemSelect }) => (
  <div className="scroll-list-container horizontal-list-wrapper">
    <div className="scroll-list" style={{ display: "flex", gap: "15px" }}>
      {items.map((item, index) => (
        <AnimatedItem
          key={item._id || `${item.name}-${index}`}
          delay={0.05 * index}
          onClick={() => onItemSelect(item)}
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

// ─── CategoryPage Component ───
export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addItemToPreview, previewItems, mainPreviewItem, setPreviewItems, setMainPreviewItem } =
    useCloset();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const listRef = useRef(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        // Reset preview items when a new fetch occurs
        if (previewItems.length > 0 || mainPreviewItem) {
          setPreviewItems([]);
          setMainPreviewItem(null);
        }

        const res = await fetch(`${BASE_API_URL}/items/${category}?t=${Date.now()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );


        if (!res.ok) throw new Error("Failed to load items");

        const data = await res.json();
        setItems(data);
      } catch (err) {
        setError(err.message || "Error loading items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [category]); // fetch on category change

  const handleSelect = (item) => {
    const rect = listRef.current?.getBoundingClientRect();
    addItemToPreview(item, rect?.width || 200, rect?.height || 200);
    navigate("/closet");
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading {category}…</p>;
  if (error) return <p style={{ padding: "20px" }}>Error: {error}</p>;

  return (
    <div className="closet-page-wrapper">
      {/* HEADER */}
      <div className="closet-header">
        <button
          className="close-btn"
          onClick={() => navigate("/closet")}
          style={{ marginRight: "10px" }}
        >
          <FaArrowLeft /> Back
        </button>
        <h2 style={{ textTransform: "capitalize" }}>{category}</h2>
      </div>

      {/* ITEM LIST */}
      <div ref={listRef} style={{ padding: "20px" }}>
        <AnimatedList items={items} onItemSelect={handleSelect} />
      </div>
    </div>
  );
}
