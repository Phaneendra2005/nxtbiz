import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { ConfirmButton } from "../components/ConfirmButton.jsx";
import { useAuthStore } from "../store/authStore.js";
import { DataTable } from "../components/DataTable.jsx";
import { FormField } from "../components/FormField.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Panel } from "../components/Panel.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { customerName } from "../utils/format.js";

const initialTicket = {
  customerId: "",
  issue: "",
  priority: "medium",
  status: "open",
  resolution: ""
};

export function TicketsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const canDelete = user?.role === "Admin" || user?.role === "Manager";
  const [form, setForm] = useState(initialTicket);
  // Tracks tickets mid-resolution: { [ticketId]: { status: "resolved", resolution: "" } }
  const [pendingStatuses, setPendingStatuses] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => (await api.get("/api/tickets")).data
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await api.get("/api/customers")).data
  });

  const customerOptions = useMemo(
    () => [
      { value: "", label: "No customer" },
      ...(customersData?.customers ?? []).map((customer) => ({ value: customer._id, label: customer.name }))
    ],
    [customersData]
  );

  const createTicket = useMutation({
    mutationFn: async (payload) => (await api.post("/api/tickets", payload)).data,
    onSuccess: () => {
      setForm(initialTicket);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Ticket created");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Ticket could not be created")
  });

  const updateTicket = useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/api/tickets/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] })
  });

  const deleteTicket = useMutation({
    mutationFn: async (id) => (await api.delete(`/api/tickets/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket deleted");
    }
  });

  const handleStatusChange = (ticketId, newStatus) => {
    if (newStatus === "resolved") {
      // Don't save yet — show resolution input first
      setPendingStatuses((prev) => ({ ...prev, [ticketId]: { status: "resolved", resolution: "" } }));
    } else {
      // Clear any pending state and save the new status immediately
      setPendingStatuses((prev) => {
        const next = { ...prev };
        delete next[ticketId];
        return next;
      });
      updateTicket.mutate({ id: ticketId, payload: { status: newStatus } });
    }
  };

  const handleResolutionSave = (ticketId, resolutionText) => {
    if (!resolutionText.trim()) return;
    updateTicket.mutate(
      { id: ticketId, payload: { status: "resolved", resolution: resolutionText } },
      {
        onSuccess: () => {
          toast.success("Ticket resolved");
          setPendingStatuses((prev) => {
            const next = { ...prev };
            delete next[ticketId];
            return next;
          });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Tickets" description="Support issues, priority, assignment, and resolution status." />
      <Panel title="Create Ticket">
        <form
          className="grid gap-3 p-4 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            createTicket.mutate({ ...form, customerId: form.customerId || null });
          }}
        >
          <FormField label="Customer" name="customerId" value={form.customerId} options={customerOptions} onChange={(value) => setForm((current) => ({ ...current, customerId: value }))} />
          <FormField label="Priority" name="priority" value={form.priority} options={["low", "medium", "high", "critical"]} onChange={(value) => setForm((current) => ({ ...current, priority: value }))} />
          <FormField label="Status" name="status" value={form.status} options={["open", "in_progress", "resolved", "closed"]} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
          <FormField label="Resolution" name="resolution" value={form.resolution} onChange={(value) => setForm((current) => ({ ...current, resolution: value }))} />
          <div className="lg:col-span-4">
            <FormField label="Issue" name="issue" type="textarea" value={form.issue} onChange={(value) => setForm((current) => ({ ...current, issue: value }))} required />
          </div>
          <button className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white lg:col-span-4" type="submit">Create Ticket</button>
        </form>
      </Panel>
      <Panel title="Support Queue">
        <DataTable
          columns={[
            { key: "issue", header: "Issue" },
            { key: "customerId", header: "Customer", render: (row) => customerName(row.customerId) },
            { key: "priority", header: "Priority", render: (row) => <StatusBadge value={row.priority} /> },
            { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
            {
              key: "resolution",
              header: "Resolution",
              render: (row) =>
                row.resolution
                  ? row.resolution
                  : <span className="text-slate-400 dark:text-slate-600">-</span>
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => {
                const pending = pendingStatuses[row._id];
                const currentStatus = pending?.status ?? row.status;
                const showResolutionInput = !!pending && pending.status === "resolved";

                return (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <select
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                        value={currentStatus}
                        onChange={(event) => handleStatusChange(row._id, event.target.value)}
                      >
                        <option value="open">open</option>
                        <option value="in_progress">in_progress</option>
                        <option value="resolved">resolved</option>
                        <option value="closed">closed</option>
                      </select>
                      {canDelete && (
                        <ConfirmButton onConfirm={() => deleteTicket.mutate(row._id)}>Delete</ConfirmButton>
                      )}
                    </div>
                    {showResolutionInput && (
                      <input
                        autoFocus
                        type="text"
                        placeholder="Type resolution here..."
                        value={pending.resolution}
                        className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-mint dark:border-slate-700 dark:bg-slate-950"
                        onChange={(e) =>
                          setPendingStatuses((prev) => ({
                            ...prev,
                            [row._id]: { ...prev[row._id], resolution: e.target.value }
                          }))
                        }
                        onBlur={() => handleResolutionSave(row._id, pending.resolution)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleResolutionSave(row._id, pending.resolution);
                        }}
                      />
                    )}
                  </div>
                );
              }
            }
          ]}
          rows={data?.tickets ?? []}
          isLoading={isLoading}
          emptyMessage="No tickets yet."
        />
      </Panel>
    </div>
  );
}
