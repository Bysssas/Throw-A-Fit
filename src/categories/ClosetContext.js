import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ClosetContext = createContext();
export const useCloset = () => useContext(ClosetContext);

export const ClosetProvider = ({ children }) => {
  const [closetItems, setClosetItems] = useState([]);       // all user items
  const [previewItems, setPreviewItems] = useState([]);     // preview for drag/drop
  const [mainPreviewItem, setMainPreviewItem] = useState(null);

  /** ---------------- Add item to preview ---------------- */
  const addItemToPreview = (item, containerWidth = 200, containerHeight = 200) => {
    setMainPreviewItem(item);
    const centerX = (containerWidth - 200) / 2;
    const centerY = (containerHeight - 200) / 2;

    setPreviewItems(prev => [
      ...prev,
      { ...item, x: centerX, y: centerY }
    ]);
  };

  /** ---------------- Remove item from preview ---------------- */
  const removeItemFromPreview = (index) => {
    setPreviewItems(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // If nothing left, clear mainPreviewItem
      if (updated.length === 0) setMainPreviewItem(null);
      return updated;
    });
  };

  /** ---------------- Update item position ---------------- */
  const updateItemPosition = (index, x, y) => {
    setPreviewItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, x: Math.max(x, 0), y: Math.max(y, 0) } : item
      )
    );
  };

  /** ---------------- Reset preview ---------------- */
  const resetPreview = useCallback(() => {
    setPreviewItems([]);
    setMainPreviewItem(null);
  }, []);

  /** ---------------- Reset closet (for Home) ---------------- */
  const resetCloset = useCallback(() => {
    resetPreview();
    // Could reset other closet-related states here in the future
  }, [resetPreview]);

  /** ---------------- Load user items from backend ---------------- */
  const loadUserItems = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/items/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const items = await res.json();
      if (Array.isArray(items)) {
        setClosetItems(items); // all user items
        setPreviewItems(items.map(item => ({ ...item, x: 0, y: 0 }))); // initialize preview
        setMainPreviewItem(items[0] || null);
      }
    } catch (err) {
      console.error("Error loading user items:", err);
    }
  }, []);

  /** ---------------- Auto-load user items on mount ---------------- */
  useEffect(() => {
    loadUserItems();
  }, [loadUserItems]);

  /** ---------------- Context Value ---------------- */
  return (
    <ClosetContext.Provider
      value={{
        closetItems,
        setClosetItems,
        previewItems,
        mainPreviewItem,
        addItemToPreview,
        removeItemFromPreview,   // right-click removal now works correctly
        updateItemPosition,
        resetPreview,
        resetCloset,
        loadUserItems,
      }}
    >
      {children}
    </ClosetContext.Provider>
  );
};
