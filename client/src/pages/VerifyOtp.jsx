import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendMsg("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Resend failed");
      setResendMsg("OTP resent to your email");
    } catch (err) {
      setResendMsg(err.message);
    }
  };

  return (
    <div className="auth-page">
      <h2>Verify Your Email</h2>
      <p>We sent a code to {email}</p>
      <form onSubmit={handleVerify}>
        <input placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? "Verifying..." : "Verify"}</button>
      </form>
      <button onClick={handleResend}>Resend OTP</button>
      {resendMsg && <p>{resendMsg}</p>}
    </div>
  );
}