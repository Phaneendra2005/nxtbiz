import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";
import { FormField } from "../components/FormField.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Panel } from "../components/Panel.jsx";
import { customerName, formatDate } from "../utils/format.js";

export function CrmPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ customerId: "", title: "", body: "" });

  const { data: crmData, isLoading } = useQuery({
    queryKey: ["crm"],
    queryFn: async () => (await api.get("/api/crm")).data
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await api.get("/api/customers")).data
  });

  const createActivity = useMutation({
    mutationFn: async (payload) => (await api.post("/api/crm/activity", payload)).data,
    onSuccess: () => {
      setForm({ customerId: "", title: "", body: "" });
      queryClient.invalidateQueries({ queryKey: ["crm"] });
      toast.success("CRM activity created");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "CRM activity could not be created")
  });

  const customerOptions = [
    { value: "", label: "Select customer" },
    ...(customersData?.customers ?? []).map((customer) => ({ value: customer._id, label: customer.name }))
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="CRM Timeline" description="Customer notes, operational activity, and preserved context." />
      <Panel title="Create Activity">
        <form
          className="grid gap-3 p-4 lg:grid-cols-[240px_260px_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            createActivity.mutate(form);
          }}
        >
          <FormField label="Customer" name="customerId" value={form.customerId} options={customerOptions} onChange={(value) => setForm((current) => ({ ...current, customerId: value }))} required />
          <FormField label="Title" name="title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required />
          <FormField label="Body" name="body" value={form.body} onChange={(value) => setForm((current) => ({ ...current, body: value }))} required />
          <button className="self-end rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white" type="submit">Create</button>
        </form>
      </Panel>
      <Panel title="Timeline">
        <DataTable
          columns={[
            { key: "createdAt", header: "Time", render: (row) => formatDate(row.createdAt) },
            { key: "customerId", header: "Customer", render: (row) => customerName(row.customerId) },
            { key: "type", header: "Type" },
            { key: "title", header: "Title" },
            { key: "body", header: "Details" }
          ]}
          rows={crmData?.activities ?? []}
          isLoading={isLoading}
          emptyMessage="No CRM activity yet."
        />
      </Panel>
    </div>
  );
}
