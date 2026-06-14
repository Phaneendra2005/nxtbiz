import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { ConfirmButton } from "../components/ConfirmButton.jsx";
import { useAuthStore } from "../store/authStore.js";

export function CustomersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "Admin";
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await api.get("/api/customers")).data
  });

  const createCustomer = useMutation({
    mutationFn: async (payload) => (await api.post("/api/customers", payload)).data,
    onSuccess: () => {
      setForm({ name: "", email: "", company: "", phone: "" });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Customer could not be created")
  });

  const deleteCustomer = useMutation({
    mutationFn: async (id) => (await api.delete(`/api/customers/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer deleted");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Customer could not be deleted")
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-semibold tracking-normal">Customer Management</h1>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            createCustomer.mutate(form);
          }}
        >
          {[
            ["name", "Name"],
            ["email", "Email"],
            ["company", "Company"],
            ["phone", "Phone"]
          ].map(([field, label]) => (
            <label className="block text-sm font-medium" key={field}>
              {label}
              <input
                className="form-input mt-1"
                value={form[field]}
                type={field === "email" ? "email" : "text"}
                onChange={(event) => setForm((value) => ({ ...value, [field]: event.target.value }))}
                required={field === "name"}
              />
            </label>
          ))}
          <button className="h-10 w-full rounded-md bg-mint text-sm font-semibold text-white" type="submit">
            Create Customer
          </button>
        </form>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 className="text-base font-semibold tracking-normal">Customers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="table-cell text-left font-medium">Name</th>
                <th className="table-cell text-left font-medium">Company</th>
                <th className="table-cell text-left font-medium">Email</th>
                <th className="table-cell text-left font-medium">Health</th>
                {isAdmin && <th className="table-cell text-left font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td className="table-cell" colSpan={isAdmin ? 5 : 4}>Loading customers...</td></tr>
              ) : data.customers.length === 0 ? (
                <tr><td className="table-cell text-slate-500" colSpan={isAdmin ? 5 : 4}>No customers yet.</td></tr>
              ) : (
                data.customers.map((customer) => (
                  <tr key={customer._id}>
                    <td className="table-cell">
                      <Link
                        to={`/customers/${customer._id}`}
                        className="text-blue-600 hover:underline cursor-pointer"
                      >
                        {customer.name}
                      </Link>
                    </td>
                    <td className="table-cell">{customer.company || "-"}</td>
                    <td className="table-cell">{customer.email || "-"}</td>
                    <td className="table-cell">{customer.healthScore}</td>
                    {isAdmin && (
                      <td className="table-cell">
                        <ConfirmButton
                          message="Are you sure you want to delete this customer? This cannot be undone."
                          onConfirm={() => deleteCustomer.mutate(customer._id)}
                        >
                          Delete
                        </ConfirmButton>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
