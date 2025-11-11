import LightRays from "./hpbg";
import "./hpbg.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Static spotlight background */}
      <div className="spotlight-background" />

      {/* Animated WebGL light rays */}
      <div className="light-rays-wrapper">
        <LightRays
          raysOrigin="top-center"
          raysColor="#b8c4ff"
          raysSpeed={1.3}
          lightSpread={0.8}
          rayLength={1.4}
          followMouse={true}
          mouseInfluence={0.12}
          noiseAmount={0.05}
          distortion={0.03}
          pulsating={true}
          fadeDistance={1.1}
          saturation={1.1}
        />
      </div>

      {/* Header */}
      <div className="home-header">
        <div className="home-title">Throw . A . Fit</div>
      </div>

      {/* Footer / buttons */}
      <div className="home-footer">
        <button className="home-btn secondary" onClick={() => navigate("/closet")}>
          Closet
        </button>

        <button className="home-btn primary">
          Throw a Fit
        </button>

        <button className="home-btn secondary" onClick={() => navigate("/upload")}>
          Upload
        </button>
      </div>
    </div>
  );
}
