import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { LockKeyhole } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";

export function LoginPage() {
  const location = useLocation();
  const { user, login } = useAuthStore();
  const [form, setForm] = useState({ email: "admin@nxtbiz.local", password: "Admin12345" });
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={location.state?.from?.pathname ?? "/"} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success("Signed in to NxtBiz");
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-sm rounded-md border border-slate-200 bg-white p-6 shadow-panel">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-mint text-white">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-slate-950">NxtBiz</h1>
            <p className="text-sm text-slate-500">Operations Console</p>
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="form-input mt-1"
              type="email"
              value={form.email}
              onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              className="form-input mt-1"
              type="password"
              value={form.password}
              onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))}
              required
            />
          </label>
          <button
            className="flex h-10 w-full items-center justify-center rounded-md bg-mint px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Need access? <Link className="font-medium text-mint" to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}
