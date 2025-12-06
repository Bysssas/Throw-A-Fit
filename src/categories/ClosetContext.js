import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

const ClosetContext = createContext();
export const useCloset = () => useContext(ClosetContext);

export const ClosetProvider = ({ children }) => {
  const [closetItems, setClosetItems] = useState([]);       // all user items
  const [previewItems, setPreviewItems] = useState([]);     // preview for drag/drop
  const [mainPreviewItem, setMainPreviewItem] = useState(null);

  // Add item to preview
  const addItemToPreview = (item, containerWidth = 200, containerHeight = 200) => {
    setMainPreviewItem(item);
    const centerX = (containerWidth - 200) / 2;
    const centerY = (containerHeight - 200) / 2;

    setPreviewItems(prev => [
      ...prev,
      { ...item, x: centerX, y: centerY }
    ]);
  };

  // Remove item from preview
  const removeItemFromPreview = (index) => {
    setPreviewItems(prev => prev.filter((_, i) => i !== index));
  };

  // Update item position
  const updateItemPosition = (index, x, y) => {
    setPreviewItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, x: Math.max(x, 0), y: Math.max(y, 0) } : item
      )
    );
  };

  // Reset preview
  const resetPreview = useCallback(() => {
    setPreviewItems([]);
    setMainPreviewItem(null);
  }, []);

  // **Reset Closet** (restore for Home)
  const resetCloset = useCallback(() => {
    resetPreview();
    // Optionally, reset other closet-specific state here in the future
  }, [resetPreview]);

  // Load user items from backend
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
        setClosetItems(items);                           // populate all items
        setPreviewItems(items.map(item => ({ ...item, x: 0, y: 0 }))); // optional
        setMainPreviewItem(items[0] || null);
      }
    } catch (err) {
      console.error("Error loading user items:", err);
    }
  }, []);

  // Auto-load user items when token exists
  useEffect(() => {
    loadUserItems();
  }, [loadUserItems]);

  return (
    <ClosetContext.Provider
      value={{
        closetItems,            // expose all items
        setClosetItems,         // expose setter
        previewItems,
        mainPreviewItem,
        addItemToPreview,
        removeItemFromPreview,
        updateItemPosition,
        resetPreview,
        resetCloset,           // <-- added back
        loadUserItems,
      }}
    >
      {children}
    </ClosetContext.Provider>
  );
};
