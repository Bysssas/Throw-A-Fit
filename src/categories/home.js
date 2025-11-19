import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./hpbg.css";
import { TextPressure, FallingText } from "./hpbg";

export default function Home() {
  const navigate = useNavigate();
  const [fallen, setFallen] = useState(false);

  return (
    <div className="home-container">

      {/* HEADER */}
      <div className="home-header" onClick={() => setFallen(true)}>
        {!fallen ? (
          <TextPressure
            text="Throw A Fit"
            fontFamily="Compressa VF"
            textColor="#FFFFFF"
            strokeColor="#FF0000"
          />
        ) : (
          <FallingText
            text="Throw A Fit"
            trigger="auto"
            backgroundColor="transparent"
            wireframes={false}
            gravity={0.56}
            fontSize="5rem"
            mouseConstraintStiffness={0.9}
          />
        )}
      </div>

      {/* FOOTER BUTTONS */}
      <div
        className="home-footer"
        style={{ marginTop: "40px", display: "flex", gap: "20px" }}
      >
        <button
          type="button"
          className="home-btn secondary"
          onClick={() => navigate("/closet")}
        >
          Closet
        </button>

        <button
          type="button"
          className="home-btn primary"
          onClick={() => navigate("/upload")}
        >
          Throw a Fit
        </button>

        <button
          type="button"
          className="home-btn secondary"
          onClick={() => navigate("/upload")}
        >
          Upload
        </button>
      </div>
    </div>
  );
}
