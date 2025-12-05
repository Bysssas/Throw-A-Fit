import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./profile.css";
import { useCloset } from "../categories/ClosetContext";
import { useUser } from "../categories/UserContext";

export default function Profile() {
  const navigate = useNavigate();
  const { resetCloset } = useCloset();
  const { user, logout } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      navigate("/");
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    resetCloset();
    navigate("/");
  };

  if (loading) return <div className="profile-wrapper">Loading...</div>;
  if (!user) return null;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">

        {/* BACK BUTTON */}
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <FaUserCircle size={120} className="profile-avatar" />
        <h2>{user.username}</h2>
        <p className="profile-info">User ID: {user._id}</p>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
