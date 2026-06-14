import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, API_URL } from "../api/client.js";
import { ConfirmButton } from "../components/ConfirmButton.jsx";
import { useAuthStore } from "../store/authStore.js";
import { DataTable } from "../components/DataTable.jsx";
import { FormField } from "../components/FormField.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Panel } from "../components/Panel.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { customerName, formatDate, formatMoney } from "../utils/format.js";

const initialInvoice = {
  customerId: "",
  amount: "",
  dueDate: "",
  status: "draft",
  description: "Operations services",
  quantity: "1",
  unitPrice: ""
};

export function InvoicesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "Admin";
  const [form, setForm] = useState(initialInvoice);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await api.get("/api/invoices")).data
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => (await api.get("/api/customers")).data
  });

  const customerOptions = useMemo(
    () => [
      { value: "", label: "Select customer" },
      ...(customersData?.customers ?? []).map((customer) => ({ value: customer._id, label: customer.name }))
    ],
    [customersData]
  );

  const createInvoice = useMutation({
    mutationFn: async (payload) => (await api.post("/api/invoices", payload)).data,
    onSuccess: () => {
      setForm(initialInvoice);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Invoice created");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Invoice could not be created")
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/api/invoices/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] })
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id) => (await api.delete(`/api/invoices/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted");
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Generate invoices, track status, and open generated PDFs." />
      <Panel title="Create Invoice">
        <form
          className="grid gap-3 p-4 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            const amount = Number(form.amount || form.unitPrice || 0);
            createInvoice.mutate({
              customerId: form.customerId,
              amount,
              dueDate: form.dueDate,
              status: form.status,
              lineItems: [
                {
                  description: form.description,
                  quantity: Number(form.quantity || 1),
                  unitPrice: Number(form.unitPrice || amount)
                }
              ]
            });
          }}
        >
          <FormField label="Customer" name="customerId" value={form.customerId} options={customerOptions} onChange={(value) => setForm((current) => ({ ...current, customerId: value }))} required />
          <FormField label="Amount" name="amount" type="number" value={form.amount} onChange={(value) => setForm((current) => ({ ...current, amount: value, unitPrice: current.unitPrice || value }))} required />
          <FormField label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={(value) => setForm((current) => ({ ...current, dueDate: value }))} required />
          <FormField label="Status" name="status" value={form.status} options={["draft", "sent", "paid", "overdue", "cancelled"]} onChange={(value) => setForm((current) => ({ ...current, status: value }))} />
          <FormField label="Line Item" name="description" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} />
          <FormField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={(value) => setForm((current) => ({ ...current, quantity: value }))} />
          <FormField label="Unit Price" name="unitPrice" type="number" value={form.unitPrice} onChange={(value) => setForm((current) => ({ ...current, unitPrice: value }))} />
          <button className="self-end rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white" type="submit">Create Invoice</button>
        </form>
      </Panel>
      <Panel title="Invoices">
        <DataTable
          columns={[
            { key: "customerId", header: "Customer", render: (row) => customerName(row.customerId) },
            { key: "amount", header: "Amount", render: (row) => formatMoney(row.amount) },
            { key: "dueDate", header: "Due", render: (row) => formatDate(row.dueDate) },
            { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
            {
              key: "pdfUrl",
              header: "PDF",
              render: (row) =>
                row.pdfUrl ? (
                  <a className="font-medium text-mint" href={`${API_URL}${row.pdfUrl}`} target="_blank" rel="noreferrer">Open PDF</a>
                ) : "-"
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <select
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                    value={row.status}
                    onChange={(event) => updateInvoice.mutate({ id: row._id, payload: { status: event.target.value } })}
                  >
                    <option>draft</option>
                    <option>sent</option>
                    <option>paid</option>
                    <option>overdue</option>
                    <option>cancelled</option>
                  </select>
                  {isAdmin && (
                    <ConfirmButton
                      message="Are you sure you want to delete this invoice? This cannot be undone."
                      onConfirm={() => deleteInvoice.mutate(row._id)}
                    >
                      Delete
                    </ConfirmButton>
                  )}
                </div>
              )
            }
          ]}
          rows={data?.invoices ?? []}
          isLoading={isLoading}
          emptyMessage="No invoices yet."
        />
      </Panel>
    </div>
  );
}
