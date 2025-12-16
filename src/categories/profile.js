import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaPencilAlt, FaTrash } from "react-icons/fa";
import "./profile.css";
import { useCloset } from "../categories/ClosetContext";
import { useUser } from "../categories/UserContext";

export default function Profile() {
  const navigate = useNavigate();
  const { resetCloset } = useCloset();
  const { user, logout, updateUserName, deleteAccount } = useUser();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  /* ======================
     LOAD USER
  ====================== */

  useEffect(() => {
    if (!user) {
      setLoading(false);
      navigate("/");
    } else {
      setNewName(user.username);
      setLoading(false);
    }
  }, [user, navigate]);

  /* ======================
     LOGOUT
  ====================== */

  const handleLogout = () => {
    logout();
    resetCloset();
    navigate("/");
  };

  /* ======================
     UPDATE USERNAME
  ====================== */

  const handleSaveName = async () => {
    if (!newName.trim()) return;

    setSaving(true);
    setError("");

    try {
      await updateUserName(newName);
      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update username");
    } finally {
      setSaving(false);
    }
  };

  /* ======================
     DELETE ACCOUNT
  ====================== */

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ This will permanently delete your account and all data. Are you sure?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteAccount();
      resetCloset();
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  /* ======================
     STATES
  ====================== */

  if (loading) return <div className="profile-wrapper">Loading...</div>;
  if (!user) return <div className="profile-wrapper">No user found</div>;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        {/* BACK BUTTON */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <FaUserCircle size={120} className="profile-avatar" />

        {/* USERNAME */}
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
          </div>
        ) : (
          <h2 className="username">
            {user.username}
            <FaPencilAlt
              className="edit-pencil"
              onClick={() => setEditing(true)}
              title="Edit username"
            />
          </h2>
        )}

        {/* ERROR */}
        {error && <p className="error-message">{error}</p>}

        {/* ACTION BUTTONS */}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

        <button
          className="delete-btn"
          onClick={handleDeleteAccount}
          disabled={deleting}
        >
          <FaTrash /> {deleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}
