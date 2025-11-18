import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // handle file selection from input
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select or drag a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file); // Key must be "image" to match backend
    formData.append("category", "tops"); 

    try {
      const res = await fetch("https://throwafit.onrender.com/api/upload", {
        method: "POST",
        // Do NOT set Content-Type header when using FormData, 
        // the browser sets it automatically with the correct boundary.
        body: formData
      });

      // Check for non-200 status codes
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Upload failed with status ${res.status}: ${errorData.message || 'Server error'}`);
      }

      const data = await res.json();
      console.log("CLEAN IMAGE URL:", data.imageUrl); // Expecting 'imageUrl'
      alert("Upload complete! Image URL: " + data.imageUrl);

    } catch (error) {
      console.error("Upload Error:", error);
      alert("Upload failed. Check console for details.");
    }
  };

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        position: "relative",
        background: "white",
        overflow: "hidden",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Upload Card */}
      <div
        style={{
          width: "700px",
          height: "400px",
          background: "rgba(217, 217, 217, 0.4)",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          border: dragActive ? "3px dashed hotpink" : "3px dashed #aaa",
          transition: "0.3s ease",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <h1 style={{ fontFamily: "Arial", color: "#1E1E1E" }}>
          Upload your Clothes!
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="fileInput"
        />

        {/* Buttons Row */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "15px",
            alignItems: "center",
          }}
        >
          <label
            htmlFor="fileInput"
            style={{
              background: "#ff69b4",
              color: "white",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Choose File
          </label>

          <button
            onClick={handleUpload}
            style={{
              background: "#1E1E1E",
              color: "white",
              padding: "10px 20px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Upload
          </button>
        </div>

        {file && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: "bold" }}>Selected: {file.name}</p>
            {file.type.startsWith("image/") && (
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                style={{
                  maxWidth: "200px",
                  maxHeight: "200px",
                  borderRadius: "10px",
                  marginTop: "10px",
                }}
              />
            )}
          </div>
        )}

        <p style={{ color: "#666", fontSize: "14px" }}>
          or drag and drop your file here
        </p>
      </div>
    </div>
  );
}