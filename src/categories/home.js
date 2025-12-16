import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./hpbg.css";
import { TextPressure, FallingText } from "./hpbg";
import Squares from "./hpbg";
import { useCloset } from "../categories/ClosetContext";
import { useUser } from "../categories/UserContext";
import Draggable from "react-draggable";


export default function Home() {
  const navigate = useNavigate();
  const { resetCloset } = useCloset();
  const { user, setUser } = useUser();

  const [fallen, setFallen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showFitOptions, setShowFitOptions] = useState(false);
  const [showFitPopup, setShowFitPopup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const fitItemRefs = useRef({})
  const topRef = useRef(null);
const bottomRef = useRef(null);
const shoesRef = useRef(null);
const accessoryRef = useRef(null);



  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [fitOptions, setFitOptions] = useState({
    fullRandom: true,
    colors: [],
    patterns: [],
    styles: [],
  });

  const [selectedFitItems, setSelectedFitItems] = useState({});


  const API_URL = process.env.REACT_APP_API_URL;
  const isLoggedIn = !!user;

  /* ---------------- AUTH ---------------- */

  const handleLogin = async () => {
    setShowLogin(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);

      localStorage.setItem("token", data.token);
      setUser(data.user);
      setPopupMessage("Login successful!");
    } catch (err) {
      setPopupMessage(err.message || "Login failed");
    } finally {
      setIsLoading(false);
      setShowMessagePopup(true);
    }
  };

  const handleSignup = async () => {
  setShowSignup(false);
  setIsLoading(true);

  try {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: signupUsername,
        email: signupEmail,
        password: signupPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || "Signup failed");

    setPopupMessage("Account created successfully!");
  } catch (err) {
    setPopupMessage(err.message || "Signup failed");
  } finally {
    setIsLoading(false);
    setShowMessagePopup(true);
  }
};

const handleForgotPassword = async () => {
  setIsLoading(true);

  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || "Request failed");

    setPopupMessage("Verification token sent to email");
    setShowForgotPassword(false);
    setShowResetPassword(true);
  } catch (err) {
    setPopupMessage(err.message || "Request failed");
  } finally {
    setIsLoading(false);
    setShowMessagePopup(true);
  }
};

const handleResetPassword = async () => {
  setIsLoading(true);

  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: resetToken,
        newPassword,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || "Reset failed");

    setPopupMessage("Password reset successful");
    setShowResetPassword(false);
    setResetToken("");
    setNewPassword("");
  } catch (err) {
    setPopupMessage(err.message || "Reset failed");
  } finally {
    setIsLoading(false);
    setShowMessagePopup(true);
  }
};


  /* ---------------- THROW A FIT ---------------- */

  const generateFit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setPopupMessage("Please log in first");
      setShowMessagePopup(true);
      return;
    }

    setShowFitOptions(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/fit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fitOptions),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate fit");

      setSelectedFitItems(data.outfit);
      setShowFitPopup(true);
    } catch (err) {
      setPopupMessage(err.message);
      setShowMessagePopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="home-container">
      <Squares speed={0.5} squareSize={40} direction="diagonal" />

      {!isLoggedIn && (
        <div className="top-right-btns">
          <button className="home-btn secondary" onClick={() => setShowSignup(true)}>Sign Up</button>
          <button className="home-btn primary" onClick={() => setShowLogin(true)}>Login</button>
        </div>
      )}

      {isLoggedIn && (
        <div className="home-profile-icon" onClick={() => navigate("/profile")}>
          <FaUserCircle size={38} />
        </div>
      )}

      <div className="home-header" onClick={() => setFallen(true)}>
        {!fallen ? <TextPressure text="Throw A Fit" /> : <FallingText text="Throw A Fit" trigger="auto" />}
      </div>

      <div className="home-footer">
        <button className="home-btn secondary" onClick={() => { resetCloset(); navigate("/closet"); }}>Closet</button>
        <button className="home-btn primary" onClick={() => setShowFitOptions(true)}>Throw a Fit</button>
        <button className="home-btn secondary" onClick={() => navigate("/upload")}>Upload</button>
      </div>

      {/* FIT OPTIONS POPUP */}
      {showFitOptions && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-header">Throw a Fit</div>

            {/* FULL RANDOM */}
            <label className="popup-checkbox">
              <input
                type="checkbox"
                checked={fitOptions.fullRandom}
                onChange={() =>
                  setFitOptions(prev => ({
                    ...prev,
                    fullRandom: !prev.fullRandom,
                  }))
                }
              />
              Full Random
            </label>

            {/* COLORS */}
            <div className="popup-section">
              <p>Colors</p>
              {["black", "white", "red", "blue"].map(color => (
                <label key={color} className="popup-checkbox">
                  <input
                    type="checkbox"
                    checked={fitOptions.colors.includes(color)}
                    disabled={fitOptions.fullRandom}
                    onChange={() =>
                      setFitOptions(prev => ({
                        ...prev,
                        colors: prev.colors.includes(color)
                          ? prev.colors.filter(c => c !== color)
                          : [...prev.colors, color],
                      }))
                    }
                  />
                  {color}
                </label>
              ))}
            </div>

            {/* PATTERNS */}
            <div className="popup-section">
              <p>Patterns</p>
              {["striped", "checkered", "plain"].map(pattern => (
                <label key={pattern} className="popup-checkbox">
                  <input
                    type="checkbox"
                    checked={fitOptions.patterns.includes(pattern)}
                    disabled={fitOptions.fullRandom}
                    onChange={() =>
                      setFitOptions(prev => ({
                        ...prev,
                        patterns: prev.patterns.includes(pattern)
                          ? prev.patterns.filter(p => p !== pattern)
                          : [...prev.patterns, pattern],
                      }))
                    }
                  />
                  {pattern}
                </label>
              ))}
            </div>

            {/* STYLES */}
            <div className="popup-section">
              <p>Styles</p>
              {["casual", "formal", "sporty"].map(style => (
                <label key={style} className="popup-checkbox">
                  <input
                    type="checkbox"
                    checked={fitOptions.styles.includes(style)}
                    disabled={fitOptions.fullRandom}
                    onChange={() =>
                      setFitOptions(prev => ({
                        ...prev,
                        styles: prev.styles.includes(style)
                          ? prev.styles.filter(s => s !== style)
                          : [...prev.styles, style],
                      }))
                    }
                  />
                  {style}
                </label>
              ))}
            </div>

            <button className="popup-btn" onClick={generateFit}>Generate Outfit</button>
            <button className="popup-close" onClick={() => setShowFitOptions(false)}>Cancel</button>
          </div>
        </div>
      )}
      {/* FIT PREVIEW */}
      {showFitPopup && (
        <div className="popup-overlay">
          <div className="popup-box fit-popup-box">
            <div className="popup-header">
              Your Fit
              <button className="popup-close" onClick={() => setShowFitPopup(false)}>✕</button>
            </div>

            <div className="fit-preview-container">
              {selectedFitItems.top && (
                <Draggable nodeRef={topRef}>
                  <img ref={topRef} src={selectedFitItems.top.imageUrl} className="fit-preview-img tops" alt="top" />
                </Draggable>
              )}

              {selectedFitItems.bottom && (
                <Draggable nodeRef={bottomRef}>
                  <img ref={bottomRef} src={selectedFitItems.bottom.imageUrl} className="fit-preview-img bottoms" alt="bottom" />
                </Draggable>
              )}

              {selectedFitItems.shoes && (
                <Draggable nodeRef={shoesRef}>
                  <img ref={shoesRef} src={selectedFitItems.shoes.imageUrl} className="fit-preview-img shoes" alt="shoes" />
                </Draggable>
              )}

              {selectedFitItems.accessory && (
                <Draggable nodeRef={accessoryRef}>
                  <img ref={accessoryRef} src={selectedFitItems.accessory.imageUrl} className="fit-preview-img accessories" alt="accessory" />
                </Draggable>
              )}
            </div>
          </div>
        </div>
      )}
      {/* LOADING */}
      {isLoading && (
        <div className="popup-overlay">
          <div className="loading-popup-box">
            <div className="loading-spinner" />
            <p>Loading...</p>
          </div>
        </div>
      )}

      {/* MESSAGE */}
      {showMessagePopup && (
        <div className="popup-overlay">
          <div className="message-popup-box">
            <button className="message-popup-close" onClick={() => setShowMessagePopup(false)}>✕</button>
            <p>{popupMessage}</p>
          </div>
        </div>
      )}

{/* LOGIN */}
{showLogin && (
  <div className="popup-overlay">
    <div className="popup-box">
      <div className="popup-header">Login</div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <input
          className="popup-input"
          placeholder="Username"
          value={loginUsername}
          onChange={e => setLoginUsername(e.target.value)}
        />
        <input
          className="popup-input"
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={e => setLoginPassword(e.target.value)}
        />
        <button className="popup-btn" type="submit">Login</button>
      </form>
      <p
        className="forgot-password-link"
        onClick={() => { setShowLogin(false); setShowForgotPassword(true); }}
      >
        Forgot Password?
      </p>
      <button className="popup-close" onClick={() => setShowLogin(false)}>Close</button>
    </div>
  </div>
)}

{/* SIGNUP */}
{showSignup && (
  <div className="popup-overlay">
    <div className="popup-box">
      <div className="popup-header">Sign Up</div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSignup();
        }}
      >
        <input
          className="popup-input"
          placeholder="Username"
          value={signupUsername}
          onChange={e => setSignupUsername(e.target.value)}
        />
        <input
          className="popup-input"
          type="email"
          placeholder="Email"
          value={signupEmail}
          onChange={e => setSignupEmail(e.target.value)}
        />
        <input
          className="popup-input"
          type="password"
          placeholder="Password"
          value={signupPassword}
          onChange={e => setSignupPassword(e.target.value)}
        />
        <button className="popup-btn" type="submit">Create Account</button>
      </form>
      <button className="popup-close" onClick={() => setShowSignup(false)}>Close</button>
    </div>
  </div>
)}

{/* FORGOT PASSWORD */}
{showForgotPassword && (
  <div className="popup-overlay">
    <div className="popup-box">
      <div className="popup-header">Forgot Password</div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleForgotPassword();
        }}
      >
        <input
          className="popup-input"
          type="email"
          placeholder="Registered Email"
          value={forgotEmail}
          onChange={e => setForgotEmail(e.target.value)}
        />
        <button className="popup-btn" type="submit">Send Verification</button>
      </form>
      <button className="popup-close" onClick={() => setShowForgotPassword(false)}>Close</button>
    </div>
  </div>
)}

{/* RESET PASSWORD */}
{showResetPassword && (
  <div className="popup-overlay">
    <div className="popup-box">
      <div className="popup-header">Reset Password</div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleResetPassword();
        }}
      >
        <input
          className="popup-input"
          placeholder="Verification Token"
          value={resetToken}
          onChange={e => setResetToken(e.target.value)}
        />
        <input
          className="popup-input"
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <button className="popup-btn" type="submit">Reset Password</button>
      </form>
      <button className="popup-close" onClick={() => setShowResetPassword(false)}>Close</button>
    </div>
  </div>
)}

    </div>
  );
}
