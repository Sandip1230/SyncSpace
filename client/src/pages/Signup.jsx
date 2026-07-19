import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupRequest } from "../services/api";

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

const STRENGTH_LABEL = ["Too short", "Weak", "Okay", "Good", "Strong"];
const STRENGTH_COLOR = ["bg-red-500", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-emerald-500"];

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);
  const confirmMismatch = form.confirm.length > 0 && form.confirm !== form.password;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await signupRequest(form.username, form.email, form.password);
      navigate("/verify-otp", { state: { email: form.email } });
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-xl shadow-lg shadow-indigo-500/20">S</div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Join the workspace.</h1>
          <p className="text-base text-slate-400 leading-relaxed">
            Create an account to start collaborating on code and whiteboards in real time.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Create your account</h2>
            <p className="mt-2 text-sm text-slate-400">Takes less than a minute.</p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
              <input name="username" required value={form.username} onChange={handleChange}
                className="w-full rounded-xl border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange}
                className="w-full rounded-xl border border-slate-800 bg-[#111827] px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" required value={form.password} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-[#111827] pl-4 pr-12 py-3 text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm font-medium">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? STRENGTH_COLOR[strength] : "bg-slate-800"}`} />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{STRENGTH_LABEL[strength]}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Confirm Password</label>
              <input type={showPassword ? "text" : "password"} name="confirm" required value={form.confirm} onChange={handleChange}
                className={`w-full rounded-xl border bg-[#111827] px-4 py-3 text-white placeholder-slate-600 outline-none focus:ring-4 transition ${confirmMismatch ? "border-red-500 focus:ring-red-500/10" : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/10"}`} />
              {confirmMismatch && <p className="mt-1 text-xs text-red-400">Passwords don't match.</p>}
            </div>

            <button type="submit" disabled={loading || confirmMismatch}
              className="w-full flex justify-center items-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 px-4 font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none">
              {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/" className="font-semibold text-blue-400 hover:text-blue-300 transition">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}