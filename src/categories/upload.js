import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../categories/UserContext";
import "./upload.css";

export default function Upload() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("tops");

  const [color, setColor] = useState("");
  const [pattern, setPattern] = useState("");
  const [style, setStyle] = useState("");

  const [warning, setWarning] = useState("");

  const dropRef = useRef(null);

  const categories = ["tops", "bottoms", "shoes", "accessories"];
  const colors = ["black", "white", "red", "blue", "grey", "green", "yellow", "pink"];
  const patterns = ["plain", "striped", "checkered", "tie-dye", "graphic", "floral", "polka-dot", "camouflage"];
  const styles = ["casual", "formal", "sporty"];

  const API_URL = process.env.REACT_APP_API_URL;

  /* ---------------- IMAGE VALIDATION ---------------- */

  const validateClothingImage = (file) => {
    const name = file.name.toLowerCase();
    const clothingKeywords = [
      "shirt",
      "pants",
      "jeans",
      "shoe",
      "top",
      "dress",
      "skirt",
      "jacket",
      "hoodie",
      "sneaker"
    ];

    const hasKeyword = clothingKeywords.some(k => name.includes(k));

    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const isVertical = img.height > img.width;
        const isLargeEnough = img.width > 200 && img.height > 200;

        if (!hasKeyword && (!isVertical || !isLargeEnough)) {
          resolve(false);
        } else {
          resolve(true);
        }
      };
    });
  };

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);

    const looksLikeClothes = await validateClothingImage(selectedFile);

    if (!looksLikeClothes) {
      setWarning("⚠️ This image may not be clothing. Please upload clothing items only.");
    } else {
      setWarning("");
    }
  };

  /* ---------------- UPLOAD ---------------- */

  const handleUpload = async () => {
    if (!user) return alert("You must be logged in to upload items!");
    if (!file || !itemName || !itemCategory)
      return alert("Please complete all required fields.");

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", itemName);
    formData.append("category", itemCategory);
    formData.append("color", color);
    formData.append("pattern", pattern);
    formData.append("style", style);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      alert(`Upload complete! Item: ${data.item.name}`);

      // Reset form
      setFile(null);
      setItemName("");
      setItemCategory("tops");
      setColor("");
      setPattern("");
      setStyle("");
      setWarning("");

    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console.");
    }
  };

  /* ---------------- DRAG & DROP ---------------- */

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }

    dropRef.current.classList.remove("drag-over");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.remove("drag-over");
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="upload-wrapper">
      <div className="upload-card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1>Upload your Clothes!</h1>

        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />

        <select
          value={itemCategory}
          onChange={(e) => setItemCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.toUpperCase()}
            </option>
          ))}
        </select>

        <select value={color} onChange={e => setColor(e.target.value)}>
          <option value="">Select Color (optional)</option>
          {colors.map(c => (
            <option key={c} value={c}>{c.toUpperCase()}</option>
          ))}
        </select>

        <select value={pattern} onChange={e => setPattern(e.target.value)}>
          <option value="">Select Pattern (optional)</option>
          {patterns.map(p => (
            <option key={p} value={p}>{p.toUpperCase()}</option>
          ))}
        </select>

        <select value={style} onChange={e => setStyle(e.target.value)}>
          <option value="">Select Style (optional)</option>
          {styles.map(s => (
            <option key={s} value={s}>{s.toUpperCase()}</option>
          ))}
        </select>

        {/* Drag & Drop Area */}
        <div
          ref={dropRef}
          className="drop-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById("fileInput").click()}
        >
          {file ? file.name : "Drag & Drop file here or click to select"}
        </div>

        {warning && <p className="upload-warning">{warning}</p>}

        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />

        <button className="upload-btn" onClick={handleUpload}>
          Upload
        </button>
      </div>
    </div>
  );
}
