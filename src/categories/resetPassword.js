import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./resetPassword.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const userId = searchParams.get("id");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword.trim()) {
      setError("Password cannot be empty");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token, newPassword }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.msg || "Reset failed");
      }

      setMessage(data.msg || "Password reset successful!");
      setTimeout(() => navigate("/"), 2500);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-card">
        <h2>Reset Password</h2>

        <p className="reset-subtext">
          Enter your new password below.
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="reset-input"
        />

        <button
          onClick={handleReset}
          className="reset-btn"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {error && <p className="reset-error">{error}</p>}
        {message && <p className="reset-success">{message}</p>}
      </div>
    </div>
  );
}
