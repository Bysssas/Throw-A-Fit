import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./hpbg.css";
import { TextPressure, FallingText } from "./hpbg";
import Squares from "./hpbg";
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetUserId, setResetUserId] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");

  /* MESSAGE + LOADING */
  const [isLoading, setIsLoading] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

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
    setFitPreviewItems(
      selectedFitItems.map(item => ({ ...item, x: 0, y: 0 }))
    );
  }, [selectedFitItems]);

  /* ---------------- DRAG ---------------- */
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

  /* ---------------- AUTH ---------------- */
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

      setTimeout(() => {
        setIsLoading(false);
        setPopupMessage(
          res.ok
            ? "Signup successful! You can now log in."
            : data.msg || "Signup failed"
        );
        if (res.ok) {
          setSignupUsername("");
          setSignupEmail("");
          setSignupPassword("");
        }
        setShowMessagePopup(true);
      }, 600);
    } catch {
      setTimeout(() => {
        setIsLoading(false);
        setPopupMessage("Server error during signup");
        setShowMessagePopup(true);
      }, 600);
    }
  };

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

      if (!res.ok) {
        setTimeout(() => {
          setIsLoading(false);
          setPopupMessage(data.msg || "Login failed");
          setShowMessagePopup(true);
        }, 600);
        return;
      }

      localStorage.setItem("token", data.token);

      setUser({ _id: data.user._id, username: data.user.username });

      setTimeout(() => {
        setIsLoading(false);
        setPopupMessage("Login successful!");
        setLoginUsername("");
        setLoginPassword("");
        setShowMessagePopup(true);
      }, 600);
    } catch {
      setTimeout(() => {
        setIsLoading(false);
        setPopupMessage("Server error during login");
        setShowMessagePopup(true);
      }, 600);
    }
  };

  const handleForgotPassword = async () => {
    setShowForgotPassword(false);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setTimeout(() => {
        setIsLoading(false);
        setPopupMessage(res.ok ? "Verification email sent! Check your inbox." : data.msg || "Failed to send verification");
        setShowMessagePopup(true);
        if (res.ok) setResetUserId(data.userId); // if backend returns userId
        setForgotEmail("");
      }, 600);
    } catch {
      setTimeout(() => { setIsLoading(false); setPopupMessage("Server error during password reset"); setShowMessagePopup(true); }, 600);
    }
  };

  const handleResetPassword = async () => {
    setShowResetPassword(false);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetUserId, token: resetToken, newPassword }),
      });
      const data = await res.json();
      setTimeout(() => {
        setIsLoading(false);
        setPopupMessage(res.ok ? "Password reset successful!" : data.msg || "Reset failed");
        setShowMessagePopup(true);
        setResetToken(""); setNewPassword("");
      }, 600);
    } catch {
      setTimeout(() => { setIsLoading(false); setPopupMessage("Server error during password reset"); setShowMessagePopup(true); }, 600);
    }
  };

  /* ---------------- FIT ---------------- */
  const handleOptionChange = (type, value) => {
    if (type === "fullRandom") {
      setFitOptions(prev => ({ ...prev, fullRandom: !prev.fullRandom }));
    } else {
      setFitOptions(prev => ({
        ...prev,
        [type]: prev[type].includes(value)
          ? prev[type].filter(v => v !== value)
          : [...prev[type], value],
      }));
    }
  };

  const throwAFit = () => {
    if (!closetItems.length) {
      setPopupMessage("Your closet is empty!");
      setShowMessagePopup(true);
      return;
    }

    const categories = {
      tops: /(top|shirt|t-shirt|blouse)/i,
      bottoms: /(pants|jeans|shorts|skirt|joggers)/i,
      shoes: /(shoe|sneaker|boot|heel)/i,
      accessories: /(hat|bag|belt|scarf)/i,
    };

    const selected = Object.values(categories)
      .map(r => closetItems.filter(i => r.test(i.name)))
      .filter(b => b.length)
      .map(b => b[Math.floor(Math.random() * b.length)]);

    setSelectedFitItems(selected);
    setShowFitPopup(true);
  };

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

      {/* SIGNUP */}
      {showSignup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-header">Sign Up</div>
            <input className="popup-input" placeholder="Username" value={signupUsername} onChange={e => setSignupUsername(e.target.value)} />
            <input className="popup-input" type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
            <input className="popup-input" type="password" placeholder="Password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
            <button className="popup-btn" onClick={handleSignup}>Create Account</button>
            <button className="popup-close" onClick={() => setShowSignup(false)}>Close</button>
          </div>
        </div>
      )}

      {/* LOGIN */}
      {showLogin && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-header">Login</div>
            <input className="popup-input" placeholder="Username" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} />
            <input className="popup-input" type="password" placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
            <button className="popup-btn" onClick={handleLogin}>Login</button>
            <p className="forgot-password-link" onClick={() => { setShowLogin(false); setShowForgotPassword(true); }}>Forgot Password?</p>
            <button className="popup-close" onClick={() => setShowLogin(false)}>Close</button>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD */}
      {showForgotPassword && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-header">Forgot Password</div>
            <input className="popup-input" type="email" placeholder="Registered Email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
            <button className="popup-btn" onClick={handleForgotPassword}>Send Verification</button>
            <button className="popup-close" onClick={() => setShowForgotPassword(false)}>Close</button>
          </div>
        </div>
      )}

      {/* RESET PASSWORD */}
      {showResetPassword && (
        <div className="popup-overlay">
          <div className="popup-box">
            <div className="popup-header">Reset Password</div>
            <input className="popup-input" placeholder="Verification Token" value={resetToken} onChange={e => setResetToken(e.target.value)} />
            <input className="popup-input" type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <button className="popup-btn" onClick={handleResetPassword}>Reset Password</button>
            <button className="popup-close" onClick={() => setShowResetPassword(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
