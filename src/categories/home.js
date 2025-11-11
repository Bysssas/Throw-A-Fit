import { useNavigate } from "react-router-dom";
import "./hpbg.css";
import TextPressure from "./hpbg";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-header">
        <TextPressure text="THROW A FIT" />
      </div>

      {/* Footer / Buttons */}
      <div className="home-footer" style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
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
