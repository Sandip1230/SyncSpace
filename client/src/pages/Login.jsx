import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

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
    <div className="flex min-h-screen bg-[#090d16] text-slate-200">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#090d16] p-12 border-r border-slate-800/40">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md space-y-6 relative z-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-xl shadow-lg shadow-indigo-500/20">
            S
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              The workspace built for scale.
            </h1>
            <p className="text-base text-slate-400 leading-relaxed">
              Access secure digital assets, collaborate across teams in real-time, and streamline engineering workflows with SyncSpace.
            </p>
          </div>
          <div className="pt-8 border-t border-slate-800/60 flex items-center gap-6 text-xs text-slate-500">
            <span>&copy; 2026 SyncSpace Inc.</span>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div>
            <div className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg mb-6">S</div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Account Sign In</h2>
            <p className="mt-2 text-sm text-slate-400">Enter your credentials to continue.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Username or Email
              </label>
              <input
                name="identifier"
                required
                placeholder="you@example.com"
                value={form.identifier}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder-slate-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-blue-400 hover:text-blue-300 transition">
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
                  className="w-full rounded-xl border border-slate-800 bg-[#111827] pl-4 pr-12 py-3 text-white placeholder-slate-600 outline-none transition duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition text-sm font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex justify-center items-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-4 font-semibold text-white shadow-lg shadow-blue-600/10 transition duration-200 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}