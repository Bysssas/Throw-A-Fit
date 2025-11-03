import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (file) {
      // Here you can implement your upload logic
      console.log("Uploading file:", file.name);
      alert(`Uploading: ${file.name}`);
    } else {
      alert("Please select a file first!");
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
      }}
    >
      {/* Main card container */}
      <div
        style={{
          width: "719px",
          height: "401px",
          left: "240px",
          top: "114px",
          position: "absolute",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "679px",
            height: "367px",
            left: "20px",
            top: "17px",
            position: "absolute",
            background: "rgba(217, 217, 217, 0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
          }}
        >
          <h1 style={{ fontFamily: "Arial" }}>Upload your Clothes!</h1>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload}>UplSoad</button>
        </div>

        {/* Decorative box */}
        <div
          style={{
            width: "48px",
            height: "48px",
            left: "338px",
            top: "176px",
            position: "absolute",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              left: "6px",
              top: "6px",
              position: "absolute",
              outline: "4px #1E1E1E solid",
              outlineOffset: "-2px",
            }}
          ></div>
        </div>
      </div>

      {/* Small decorative square */}
      <div
        style={{
          width: "20px",
          height: "20px",
          left: "1154px",
          top: "16px",
          position: "absolute",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "10px",
            height: "10px",
            left: "5px",
            top: "5px",
            position: "absolute",
            outline: "2px #1E1E1E solid",
            outlineOffset: "-1px",
          }}
        ></div>
      </div>
    </div>
  );
}
