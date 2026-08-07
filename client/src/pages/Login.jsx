import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginRequest(form.identifier, form.password);
      login(data.token, data.username);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <ThemeToggle />

      <div
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12"
        style={{ background: "var(--bg-panel)", borderRight: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-md space-y-6 relative z-10">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl font-black text-xl"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            S
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight">
              The workspace built for scale.
            </h1>
            <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Access secure digital assets, collaborate across teams in real-time, and streamline engineering workflows with SyncSpace.
            </p>
          </div>
          <div className="pt-8 flex items-center gap-6 text-xs" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
            <span>&copy; 2026 SyncSpace Inc.</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div>
            <div
              className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg font-bold text-lg mb-6"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              S
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Account Sign In</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Enter your credentials to continue.
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-3 rounded-xl p-4 text-sm"
              style={{ background: "rgba(211,63,63,0.1)", border: "1px solid rgba(211,63,63,0.25)", color: "var(--danger)" }}
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                Username or Email
              </label>
              <input
                name="identifier"
                required
                placeholder="you@example.com"
                value={form.identifier}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-3 outline-none transition duration-200"
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Password</label>
                <Link to="/forgot-password" className="text-xs font-medium transition" style={{ color: "var(--accent)" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-xl pl-4 pr-12 py-3 outline-none transition duration-200"
                  style={{
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium transition"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex justify-center items-center rounded-xl py-3.5 px-4 font-semibold transition duration-200 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
            New here?{" "}
            <Link to="/signup" className="font-semibold transition" style={{ color: "var(--accent)" }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}