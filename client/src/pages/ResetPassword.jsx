import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      setSuccess("Password reset! Redirecting to login...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h2>Reset Password</h2>
      <p>Enter the code sent to {email}</p>
      <form onSubmit={handleSubmit}>
        <input placeholder="Reset Code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        {success && <p>{success}</p>}
        <button type="submit" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
      </form>
    </div>
  );
}