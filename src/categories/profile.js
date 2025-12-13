import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaPencilAlt } from "react-icons/fa";
import "./profile.css";
import { useCloset } from "../categories/ClosetContext";
import { useUser } from "../categories/UserContext";

export default function Profile() {
  const navigate = useNavigate();
  const { resetCloset } = useCloset();
  const { user, logout, updateUserName } = useUser();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      navigate("/");
    } else {
      setNewName(user.username);
      setLoading(false);
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    resetCloset();
    navigate("/");
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      await updateUserName(newName);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update name", err);
      setError(err.message || "Failed to update username");
    }
    setSaving(false);
  };

  if (loading) return <div className="profile-wrapper">Loading...</div>;
  if (!user) return <div className="profile-wrapper">No user found</div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        {/* BACK BUTTON */}
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <FaUserCircle size={120} className="profile-avatar" />

        {editing ? (
          <div className="edit-name-container">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="edit-name-input"
            />
            <button
              className="save-btn"
              onClick={handleSaveName}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setEditing(false);
                setNewName(user.username);
                setError("");
              }}
            >
              Cancel
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        ) : (
          <h2 className="username">
            {user.username}{" "}
            <FaPencilAlt
              className="edit-pencil"
              onClick={() => setEditing(true)}
              title="Edit username"
            />
          </h2>
        )}

        <p className="profile-info"></p>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
