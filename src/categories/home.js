import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./hpbg.css";
import { TextPressure, FallingText } from "./hpbg";
import Squares from './hpbg';
import { useCloset } from "../categories/ClosetContext";
import { useUser } from "../categories/UserContext";

export default function Home() {
  const navigate = useNavigate();
  const { closetItems, setClosetItems, resetCloset } = useCloset();
  const { user, setUser } = useUser();

  const [fallen, setFallen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showFitOptions, setShowFitOptions] = useState(false);
  const [showFitPopup, setShowFitPopup] = useState(false);

  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [message, setMessage] = useState("");

  const [fitOptions, setFitOptions] = useState({
    fullRandom: false,
    colors: [],
    styles: [],
  });

  const [selectedFitItems, setSelectedFitItems] = useState([]);
  const [fitPreviewItems, setFitPreviewItems] = useState([]);

  const fitPreviewRef = useRef(null);
  const draggingRef = useRef({ index: -1, offsetX: 0, offsetY: 0 });

  const API_URL = process.env.REACT_APP_API_URL;
  const isLoggedIn = !!user;

  useEffect(() => {
    setFitPreviewItems(selectedFitItems.map(item => ({ ...item, x: 0, y: 0 })));
  }, [selectedFitItems]);

  const handleDragStart = (index, e) => {
    const rect = e.target.getBoundingClientRect();
    draggingRef.current = {
      index,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    const { index, offsetX, offsetY } = draggingRef.current;
    if (index < 0) return;

    const containerRect = fitPreviewRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const newX = e.clientX - containerRect.left - offsetX;
    const newY = e.clientY - containerRect.top - offsetY;

    setFitPreviewItems(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, x: Math.max(0, newX), y: Math.max(0, newY) }
          : item
      )
    );
  };

  const handleMouseUp = () => {
    draggingRef.current = { index: -1, offsetX: 0, offsetY: 0 };
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleSignup = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: signupUsername, password: signupPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Signup successful! You can now log in.");
        setShowSignup(false);
        setSignupUsername("");
        setSignupPassword("");
      } else {
        setMessage(data.msg || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error during signup");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.msg || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      const userRes = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser({ _id: userData._id, username: userData.username });
      } else {
        setMessage("Failed to fetch user info");
        return;
      }

      const itemsRes = await fetch(`${API_URL}/items/user`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      if (itemsRes.ok) {
        const items = await itemsRes.json();
        if (Array.isArray(items)) setClosetItems(items);
      }

      setMessage("Login successful!");
      setShowLogin(false);
      setLoginUsername("");
      setLoginPassword("");
    } catch (err) {
      console.error(err);
      setMessage("Server error during login");
    }
  };

  const handleOptionChange = (type, value) => {
    if (type === "fullRandom") {
      setFitOptions(prev => ({ ...prev, fullRandom: !prev.fullRandom }));
    } else if (type === "colors") {
      setFitOptions(prev => ({
        ...prev,
        colors: prev.colors.includes(value)
          ? prev.colors.filter(c => c !== value)
          : [...prev.colors, value]
      }));
    } else if (type === "styles") {
      setFitOptions(prev => ({
        ...prev,
        styles: prev.styles.includes(value)
          ? prev.styles.filter(s => s !== value)
          : [...prev.styles, value]
      }));
    }
  };

  const throwAFit = (options) => {
    if (!closetItems || closetItems.length === 0) {
      setMessage("Your closet is empty!");
      return;
    }

    let filteredItems = [...closetItems];
    if (!options.fullRandom) {
      if (options.colors.length > 0)
        filteredItems = filteredItems.filter(item =>
          item.name && options.colors.some(color => item.name.toLowerCase().includes(color.toLowerCase()))
        );
      if (options.styles.length > 0)
        filteredItems = filteredItems.filter(item =>
          item.name && options.styles.some(style => item.name.toLowerCase().includes(style.toLowerCase()))
        );
    }

    if (!filteredItems.length) {
      setMessage("No items matched your selection!");
      return;
    }

    const buckets = {
      tops: filteredItems.filter(item => item.name && /(top|shirt|t-shirt|blouse)/i.test(item.name)),
      bottoms: filteredItems.filter(item => item.name && /(bottom|pants|skirt|jeans|shorts|joggers)/i.test(item.name)),
      shoes: filteredItems.filter(item => item.name && /(shoe|sneaker|boot|heel)/i.test(item.name)),
      accessories: filteredItems.filter(item => item.name && /(hat|cap|scarf|bag|belt)/i.test(item.name)),
    };

    const hasAnyItems = Object.values(buckets).some(bucket => bucket.length > 0);
    if (!hasAnyItems) {
      setMessage("Your closet has no usable items!");
      return;
    }

    const selectedFit = [];
    for (let category in buckets) {
      const bucket = buckets[category];
      if (bucket.length > 0) selectedFit.push(bucket[Math.floor(Math.random() * bucket.length)]);
    }

    setSelectedFitItems(selectedFit);
    setShowFitPopup(true);
    setMessage("");
  };

  return (
    <div className="home-container">
      <Squares speed={0.5} squareSize={40} direction='diagonal' borderColor='#fff' hoverFillColor='#222' />

      {!isLoggedIn && (
        <div className="top-right-btns">
          <button className="home-btn secondary" onClick={() => setShowSignup(true)}>Sign Up</button>
          <button className="home-btn primary" onClick={() => setShowLogin(true)}>Login</button>
        </div>
      )}

      {isLoggedIn && (
        <div className="home-profile-icon" onClick={() => navigate("/profile")}>
          <FaUserCircle size={38} className="profile-icon-react" />
        </div>
      )}

      <div className="home-header" onClick={() => setFallen(true)}>
        {!fallen ? (
          <TextPressure text="Throw A Fit" fontFamily="Compressa VF" textColor="#e44a8dff" strokeColor="#FF0000" />
        ) : (
          <FallingText text="Throw A Fit" trigger="auto" backgroundColor="transparent" wireframes={false} gravity={0.56} fontSize="5rem" mouseConstraintStiffness={0.9} />
        )}
      </div>

      <div className="home-footer">
        <button className="home-btn secondary" onClick={() => { resetCloset(); navigate("/closet"); }}>Closet</button>
        <button className="home-btn primary" onClick={() => setShowFitOptions(true)}>Throw a Fit</button>
        <button className="home-btn secondary" onClick={() => navigate("/upload")}>Upload</button>
      </div>

      {message && <div className="home-message">{message}</div>}

      {/* SIGNUP POPUP */}
      {showSignup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-header">Sign Up</div>
            <input type="text" placeholder="Username" className="popup-input" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} />
            <input type="password" placeholder="Password" className="popup-input" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
            <button className="popup-btn" onClick={handleSignup}>Create Account</button>
            <button className="popup-close" onClick={() => setShowSignup(false)}>Close</button>
          </div>
        </div>
      )}

      {/* LOGIN POPUP */}
      {showLogin && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-header">Login</div>
            <input type="text" placeholder="Username" className="popup-input" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
            <input type="password" placeholder="Password" className="popup-input" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            <button className="popup-btn" onClick={handleLogin}>Login</button>
            <button className="popup-close" onClick={() => setShowLogin(false)}>Close</button>
          </div>
        </div>
      )}

      {/* FIT OPTIONS POPUP */}
      {showFitOptions && (
        <div className="fit-popup-overlay">
          <div className="fit-popup-box">
            <div className="fit-popup-header">Choose Fit Options</div>

            <div className="fit-popup-section">
              <label>
                <input 
                  type="checkbox" 
                  checked={fitOptions.fullRandom} 
                  onChange={() => handleOptionChange("fullRandom")} 
                />
                Full Random
              </label>
            </div>

            <div className="fit-popup-section">
              <p>Colors:</p>
              {["Red","Blue","Green","Black"].map(color => (
                <label key={color}>
                  <input 
                    type="checkbox" 
                    checked={fitOptions.colors.includes(color)} 
                    onChange={() => handleOptionChange("colors", color)} 
                  />
                  {color}
                </label>
              ))}
            </div>

            <div className="fit-popup-section">
              <p>Styles:</p>
              {["Top","Bottom","Shoes","Accessories"].map(style => (
                <label key={style}>
                  <input 
                    type="checkbox" 
                    checked={fitOptions.styles.includes(style)} 
                    onChange={() => handleOptionChange("styles", style)} 
                  />
                  {style}
                </label>
              ))}
            </div>

            <button 
              className="fit-popup-btn" 
              onClick={() => {
                throwAFit(fitOptions);
                setShowFitOptions(false);
              }}
            >
              Show Fit Preview
            </button>

            <button className="fit-popup-close" onClick={() => setShowFitOptions(false)}>Close</button>
          </div>
        </div>
      )}

      {/* FIT PREVIEW POPUP */}
      {showFitPopup && (
        <div className="fit-popup-overlay">
          <div className="fit-popup-box">
            <div className="fit-popup-header">Your Fit Preview</div>
            <div
              className="fit-preview-container"
              ref={fitPreviewRef}
              style={{ position: "relative", width: "100%", height: "400px" }}
            >
              {fitPreviewItems.map((item, index) => (
                <img
                  key={item._id || `${item.name}-${index}`}
                  src={item.imageUrl}
                  alt={item.name}
                  className="fit-item-preview"
                  style={{
                    position: "absolute",
                    top: item.y,
                    left: item.x,
                    cursor: "grab",
                    zIndex: index + 10,
                  }}
                  onMouseDown={(e) => handleDragStart(index, e)}
                  draggable={false}
                />
              ))}
            </div>
            <button className="fit-popup-close" onClick={() => setShowFitPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
