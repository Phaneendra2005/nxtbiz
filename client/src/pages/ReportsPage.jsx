import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, API_URL } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";
import { FormField } from "../components/FormField.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Panel } from "../components/Panel.jsx";
import { formatDate } from "../utils/format.js";

const initialReport = {
  type: "executive",
  title: "NxtBiz Executive Report",
  summary: "Weekly operations summary.",
  recommendations: "Review urgent tickets, follow up on open invoices",
  paidRevenue: "0",
  openTickets: "0",
  healthScore: "75"
};

export function ReportsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialReport);

  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => (await api.get("/api/reports")).data
  });

  const generateReport = useMutation({
    mutationFn: async (payload) => (await api.post("/api/reports/generate", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report generated");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Report could not be generated")
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate weekly and executive reports with PDF output." />
      <Panel title="Generate Report">
        <form
          className="grid gap-3 p-4 lg:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            generateReport.mutate({
              type: form.type,
              title: form.title,
              summary: form.summary,
              recommendations: form.recommendations.split(",").map((item) => item.trim()).filter(Boolean),
              metrics: {
                paidRevenue: Number(form.paidRevenue),
                openTickets: Number(form.openTickets),
                healthScore: Number(form.healthScore)
              }
            });
          }}
        >
          <FormField label="Type" name="type" value={form.type} options={["executive", "weekly", "customer-health"]} onChange={(value) => setForm((current) => ({ ...current, type: value }))} />
          <FormField label="Title" name="title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} required />
          <FormField label="Recommendations" name="recommendations" value={form.recommendations} onChange={(value) => setForm((current) => ({ ...current, recommendations: value }))} />
          <FormField label="Paid Revenue" name="paidRevenue" type="number" value={form.paidRevenue} onChange={(value) => setForm((current) => ({ ...current, paidRevenue: value }))} />
          <FormField label="Open Tickets" name="openTickets" type="number" value={form.openTickets} onChange={(value) => setForm((current) => ({ ...current, openTickets: value }))} />
          <FormField label="Health Score" name="healthScore" type="number" value={form.healthScore} onChange={(value) => setForm((current) => ({ ...current, healthScore: value }))} />
          <div className="lg:col-span-3">
            <FormField label="Summary" name="summary" type="textarea" value={form.summary} onChange={(value) => setForm((current) => ({ ...current, summary: value }))} />
          </div>
          <button className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white lg:col-span-3" type="submit">Generate Report</button>
        </form>
      </Panel>
      <Panel title="Generated Reports">
        <DataTable
          columns={[
            { key: "title", header: "Title" },
            { key: "type", header: "Type" },
            { key: "createdAt", header: "Generated", render: (row) => formatDate(row.createdAt) },
            { key: "summary", header: "Summary" },
            {
              key: "pdfUrl",
              header: "PDF",
              render: (row) =>
                row.pdfUrl ? (
                  <a className="font-medium text-mint" href={`${API_URL}${row.pdfUrl}`} target="_blank" rel="noreferrer">Open PDF</a>
                ) : "-"
            }
          ]}
          rows={data?.reports ?? []}
          isLoading={isLoading}
          emptyMessage="No reports generated yet."
        />
      </Panel>
    </div>
  );
}
