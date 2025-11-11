import LightRays from "./hpbg";
import "./hpbg.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "black",
        overflow: "hidden",
      }}
    >
      {/* Light rays background (behind everything) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>

      {/* Header */}
      <div
        style={{
          width: "100%",
          height: "10%",
          position: "absolute",
          top: 80,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2, // ✅ sits above rays
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: "5rem",
            fontFamily: "Inter",
            fontStyle: "Bold",
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
          bottom: 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "2rem",
          zIndex: 2, // ✅ sits above rays
        }}
      >
        {/* Closet button */}
        <button
          onClick={() => navigate("/closet")}
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
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "rgba(0,0,0,0.1)")}
          onMouseLeave={(e) => (e.target.style.background = "rgba(0,0,0,0.05)")}
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
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#005FCC")}
          onMouseLeave={(e) => (e.target.style.background = "#007AFF")}
        >
          Throw a Fit
        </button>

        {/* Upload button */}
        <button
          onClick={() => navigate("/upload")}
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
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "rgba(0,0,0,0.1)")}
          onMouseLeave={(e) => (e.target.style.background = "rgba(0,0,0,0.05)")}
        >
          Upload
        </button>
      </div>
    </div>
  );
}
