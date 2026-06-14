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
import { customerName, formatDate } from "../utils/format.js";

const initialMeeting = {
  title: "",
  customerId: "",
  attendees: "",
  startTime: "",
  endTime: "",
  status: "scheduled",
  notes: ""
};

export function MeetingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "Admin";
  const [form, setForm] = useState(initialMeeting);

  const { data, isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => (await api.get("/api/meetings")).data
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

  const createMeeting = useMutation({
    mutationFn: async (payload) => (await api.post("/api/meetings", payload)).data,
    onSuccess: () => {
      setForm(initialMeeting);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Meeting created");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Meeting could not be created")
  });

  const updateMeeting = useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/api/meetings/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meetings"] })
  });

  const deleteMeeting = useMutation({
    mutationFn: async (id) => (await api.delete(`/api/meetings/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Meeting deleted");
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" description="Schedule, update, and review customer meetings." />
      <Panel title="Create Meeting">
        <form
          className="grid gap-3 p-4 lg:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            createMeeting.mutate({
              ...form,
              attendees: form.attendees.split(",").map((attendee) => attendee.trim()).filter(Boolean),
              customerId: form.customerId || null
            });
          }}
        >
          <FormField label="Title" name="title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required />
          <FormField label="Customer" name="customerId" value={form.customerId} options={customerOptions} onChange={(value) => setForm((current) => ({ ...current, customerId: value }))} />
          <FormField label="Attendees" name="attendees" value={form.attendees} onChange={(value) => setForm((current) => ({ ...current, attendees: value }))} placeholder="comma separated" />
          <FormField label="Start" name="startTime" type="datetime-local" value={form.startTime} onChange={(value) => setForm((current) => ({ ...current, startTime: value }))} required />
          <FormField label="End" name="endTime" type="datetime-local" value={form.endTime} onChange={(value) => setForm((current) => ({ ...current, endTime: value }))} required />
          <FormField label="Status" name="status" value={form.status} options={["scheduled", "completed", "cancelled"]} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
          <div className="lg:col-span-3">
            <FormField label="Notes" name="notes" type="textarea" value={form.notes} onChange={(value) => setForm((current) => ({ ...current, notes: value }))} />
          </div>
          <button className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white lg:col-span-3" type="submit">Create Meeting</button>
        </form>
      </Panel>
      <Panel title="Meeting Schedule">
        <DataTable
          columns={[
            { key: "title", header: "Title" },
            { key: "startTime", header: "Start", render: (row) => formatDate(row.startTime) },
            { key: "endTime", header: "End", render: (row) => formatDate(row.endTime) },
            { key: "customerId", header: "Customer", render: (row) => customerName(row.customerId) },
            { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <select
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                    value={row.status}
                    onChange={(event) => updateMeeting.mutate({ id: row._id, payload: { status: event.target.value } })}
                  >
                    <option>scheduled</option>
                    <option>completed</option>
                    <option>cancelled</option>
                  </select>
                  {isAdmin && (
                    <ConfirmButton
                      message="Are you sure you want to delete this meeting? This cannot be undone."
                      onConfirm={() => deleteMeeting.mutate(row._id)}
                    >
                      Delete
                    </ConfirmButton>
                  )}
                </div>
              )
            }
          ]}
          rows={data?.meetings ?? []}
          isLoading={isLoading}
          emptyMessage="No meetings scheduled."
        />
      </Panel>
    </div>
  );
}
