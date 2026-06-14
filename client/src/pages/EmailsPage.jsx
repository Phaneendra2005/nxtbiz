import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { StatusBadge } from "../components/StatusBadge.jsx";

export function EmailsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    sender: "customer@example.com",
    subject: "Urgent support issue",
    body: "We have an urgent issue and need help immediately."
  });
  const { data, isLoading } = useQuery({
    queryKey: ["emails"],
    queryFn: async () => (await api.get("/api/emails")).data
  });

  const processEmail = useMutation({
    mutationFn: async (payload) => (await api.post("/api/emails/process", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Email processed and agents started");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Email could not be processed")
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-semibold tracking-normal">Email Dashboard</h1>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            processEmail.mutate(form);
          }}
        >
          <label className="block text-sm font-medium">
            Sender
            <input className="form-input mt-1" type="email" value={form.sender} onChange={(event) => setForm((value) => ({ ...value, sender: event.target.value }))} />
          </label>
          <label className="block text-sm font-medium">
            Subject
            <input className="form-input mt-1" value={form.subject} onChange={(event) => setForm((value) => ({ ...value, subject: event.target.value }))} />
          </label>
          <label className="block text-sm font-medium">
            Body
            <textarea className="form-input mt-1 min-h-32" value={form.body} onChange={(event) => setForm((value) => ({ ...value, body: event.target.value }))} />
          </label>
          <button className="h-10 w-full rounded-md bg-mint text-sm font-semibold text-white" type="submit">
            Process Email
          </button>
        </form>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 className="text-base font-semibold tracking-normal">Processed Emails</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="table-cell text-left font-medium">Subject</th>
                <th className="table-cell text-left font-medium">Intent</th>
                <th className="table-cell text-left font-medium">Sentiment</th>
                <th className="table-cell text-left font-medium">Urgency</th>
                <th className="table-cell text-left font-medium">Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td className="table-cell" colSpan="5">Loading emails...</td></tr>
              ) : data.emails.length === 0 ? (
                <tr><td className="table-cell text-slate-500" colSpan="5">No emails processed yet.</td></tr>
              ) : (
                data.emails.map((email) => (
                  <tr key={email._id}>
                    <td className="table-cell">{email.subject}</td>
                    <td className="table-cell">{email.intent}</td>
                    <td className="table-cell"><StatusBadge value={email.sentiment} /></td>
                    <td className="table-cell"><StatusBadge value={email.urgency} /></td>
                    <td className="table-cell">{email.processed ? "Yes" : "No"}</td>
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
