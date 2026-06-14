import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { useAuthStore } from "../store/authStore.js";
import { StatusBadge } from "../components/StatusBadge.jsx";

const ROLES = ["Admin", "Manager", "Employee", "Viewer"];
const emptyForm = { name: "", email: "", password: "", role: "Employee" };

export function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/api/users")).data
  });

  const createUser = useMutation({
    mutationFn: (payload) => api.post("/api/users", payload),
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message ?? "Failed to create user");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser.mutate(form);
  };

  const field = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const isAdmin = currentUser?.role === "Admin";

  if (isLoading) return <div className="text-sm text-slate-500">Loading users...</div>;
  if (isError) return <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">User management requires Admin or Manager access.</div>;

  return (
    <section className="rounded-md border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <h1 className="text-xl font-semibold tracking-normal">User Management</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "Create User"}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form onSubmit={handleSubmit} className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={field("name")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={field("email")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={field("password")}
                placeholder="Min 8 characters"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
              <select
                value={form.role}
                onChange={field("role")}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createUser.isPending}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createUser.isPending ? "Saving..." : "Save User"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="table-cell text-left font-medium">Name</th>
              <th className="table-cell text-left font-medium">Email</th>
              <th className="table-cell text-left font-medium">Role</th>
              <th className="table-cell text-left font-medium">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.users.map((u) => (
              <tr key={u._id}>
                <td className="table-cell">{u.name}</td>
                <td className="table-cell">{u.email}</td>
                <td className="table-cell">{u.role}</td>
                <td className="table-cell"><StatusBadge value={u.active ? "active" : "inactive"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
