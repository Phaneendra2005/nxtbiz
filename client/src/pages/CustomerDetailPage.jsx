import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";
import { ErrorState } from "../components/ErrorState.jsx";
import { FormField } from "../components/FormField.jsx";
import { LoadingState } from "../components/LoadingState.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Panel } from "../components/Panel.jsx";
import { formatDate } from "../utils/format.js";

export function CustomerDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [note, setNote] = useState({ title: "", body: "" });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => (await api.get(`/api/customers/${id}`)).data
  });

  const updateCustomer = useMutation({
    mutationFn: async (payload) => (await api.put(`/api/customers/${id}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Customer could not be updated")
  });

  const createNote = useMutation({
    mutationFn: async (payload) => (await api.post("/api/crm/note", { ...payload, customerId: id })).data,
    onSuccess: () => {
      setNote({ title: "", body: "" });
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      queryClient.invalidateQueries({ queryKey: ["crm"] });
      toast.success("CRM note added");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "CRM note could not be added")
  });

  if (isLoading) return <LoadingState label="Loading customer 360..." />;
  if (isError) return <ErrorState message="Customer could not be loaded." />;

  const customer = data.customer;

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={`${customer.company || "No company"} - ${customer.email || "No email"}`}
        actions={<Link className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-700" to="/customers">Back</Link>}
      />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Panel title="Customer Profile">
          <form
            className="space-y-3 p-4"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              updateCustomer.mutate(Object.fromEntries(formData.entries()));
            }}
          >
            <FormField label="Name" name="name" defaultValue={customer.name} value={customer.name} onChange={() => {}} />
            <input type="hidden" name="name" value={customer.name} />
            <FormField
              label="Company"
              name="companyVisible"
              value={customer.company ?? ""}
              onChange={(value) => updateCustomer.mutate({ company: value })}
            />
            <FormField
              label="Email"
              name="emailVisible"
              type="email"
              value={customer.email ?? ""}
              onChange={(value) => updateCustomer.mutate({ email: value })}
            />
            <FormField
              label="Phone"
              name="phoneVisible"
              value={customer.phone ?? ""}
              onChange={(value) => updateCustomer.mutate({ phone: value })}
            />
            <FormField
              label="Notes"
              name="notesVisible"
              type="textarea"
              value={customer.notes ?? ""}
              onChange={(value) => updateCustomer.mutate({ notes: value })}
            />
          </form>
        </Panel>

        <Panel title="CRM Activity">
          <div className="border-b border-slate-200 p-4 dark:border-slate-800">
            <form
              className="grid gap-3 md:grid-cols-[220px_1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                createNote.mutate(note);
              }}
            >
              <FormField label="Title" name="noteTitle" value={note.title} onChange={(value) => setNote((current) => ({ ...current, title: value }))} required />
              <FormField label="Body" name="noteBody" value={note.body} onChange={(value) => setNote((current) => ({ ...current, body: value }))} required />
              <button className="self-end rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white" type="submit">Add Note</button>
            </form>
          </div>
          <DataTable
            columns={[
              { key: "createdAt", header: "Time", render: (row) => formatDate(row.createdAt) },
              { key: "type", header: "Type" },
              { key: "title", header: "Title" },
              { key: "body", header: "Details" }
            ]}
            rows={data.timeline ?? []}
            emptyMessage="No CRM activity for this customer yet."
          />
        </Panel>
      </div>
    </div>
  );
}
