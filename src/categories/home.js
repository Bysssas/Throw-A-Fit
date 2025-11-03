export default function Home() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "white",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          height: "10%",
          position: "absolute",
          top: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            color: "black",
            fontSize: "2.5rem",
            fontFamily: "Josefin Sans, serif",
            fontStyle: "italic",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Throw . A . Fit
        </div>
      </div>

      {/* Footer / buttons */}
      <div
        style={{
          width: "100%",
          height: "20%",
          position: "absolute",
          bottom: "5%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Closet button */}
        <button
          style={{
            width: "180px",
            height: "50px",
            borderRadius: "1000px",
            background: "rgba(0,0,0,0.05)",
            border: "none",
            fontSize: "0.9rem",
            fontFamily: "SF Pro, sans-serif",
            color: "#4C4C4C",
            cursor: "pointer",
          }}
        >
          Closet
        </button>

        {/* Throw a Fit button (center) */}
        <button
          style={{
            width: "250px",
            height: "50px",
            background: "#007AFF",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "1rem",
            fontFamily: "SF Pro, sans-serif",
            cursor: "pointer",
          }}
        >
          Throw a Fit
        </button>

        {/* Upload button */}
        <button
          style={{
            width: "180px",
            height: "50px",
            borderRadius: "1000px",
            background: "rgba(0,0,0,0.05)",
            border: "none",
            fontSize: "0.9rem",
            fontFamily: "SF Pro, sans-serif",
            color: "#4C4C4C",
            cursor: "pointer",
          }}
        >
          Upload
        </button>
      </div>
    </div>
  );
}
