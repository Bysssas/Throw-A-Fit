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
  const dropRef = useRef(null);

  const categories = ["tops", "bottoms", "shoes", "accessories"];
  const API_URL = process.env.REACT_APP_API_URL;

  const handleUpload = async () => {
    if (!user) return alert("You must be logged in to upload items!");
    if (!file || !itemName || !itemCategory) return alert("Complete all fields!");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", itemName);
    formData.append("category", itemCategory);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      alert(`Upload complete! Item: ${data.item.name}`);
      setFile(null);
      setItemName("");
      setItemCategory("tops");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
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

        {/* Drag & Drop area */}
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

        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button className="upload-btn" onClick={handleUpload}>
          Upload
        </button>
      </div>
    </div>
  );
}
