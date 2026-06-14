import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore.js";

export function RegisterPage() {
  const { user, register } = useAuthStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Employee" });
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success("NxtBiz account created");
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-panel">
        <h1 className="text-xl font-semibold tracking-normal text-slate-950">Create NxtBiz Account</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {["name", "email", "password"].map((field) => (
            <label className="block text-sm font-medium capitalize text-slate-700" key={field}>
              {field}
              <input
                className="form-input mt-1"
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(event) => setForm((value) => ({ ...value, [field]: event.target.value }))}
                required
              />
            </label>
          ))}
          <label className="block text-sm font-medium text-slate-700">
            Role
            <select
              className="form-input mt-1"
              value={form.role}
              onChange={(event) => setForm((value) => ({ ...value, role: event.target.value }))}
            >
              <option>Employee</option>
              <option>Viewer</option>
              <option>Manager</option>
              <option>Admin</option>
            </select>
          </label>
          <button className="h-10 w-full rounded-md bg-mint text-sm font-semibold text-white" disabled={loading} type="submit">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Already registered? <Link className="font-medium text-mint" to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
