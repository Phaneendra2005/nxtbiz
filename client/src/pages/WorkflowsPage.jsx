import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { ConfirmButton } from "../components/ConfirmButton.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { FormField } from "../components/FormField.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Panel } from "../components/Panel.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { formatDate } from "../utils/format.js";

const initialWorkflow = {
  name: "",
  trigger: "email.processed",
  condition: "negative",
  action: "create ticket and notify manager",
  enabled: true
};

export function WorkflowsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialWorkflow);

  const { data, isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => (await api.get("/api/workflows")).data
  });

  const createWorkflow = useMutation({
    mutationFn: async (payload) => (await api.post("/api/workflows", payload)).data,
    onSuccess: () => {
      setForm(initialWorkflow);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow created");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Workflow could not be created")
  });

  const updateWorkflow = useMutation({
    mutationFn: async ({ id, payload }) => (await api.put(`/api/workflows/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflows"] })
  });

  const executeWorkflow = useMutation({
    mutationFn: async (workflow) =>
      (await api.post(`/api/workflows/${workflow._id}/execute`, {
        sentiment: workflow.condition || "negative",
        urgency: workflow.condition === "critical" ? "critical" : "high"
      })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Workflow executed");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Workflow could not execute")
  });

  const deleteWorkflow = useMutation({
    mutationFn: async (id) => (await api.delete(`/api/workflows/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow deleted");
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Workflows" description="Build, enable, execute, and inspect workflow logs." />
      <Panel title="Create Workflow">
        <form
          className="grid gap-3 p-4 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            createWorkflow.mutate({
              ...form,
              steps: [
                { type: "trigger", label: form.trigger, config: {} },
                { type: "condition", label: form.condition || "Always", config: {} },
                { type: "action", label: form.action, config: {} }
              ]
            });
          }}
        >
          <FormField label="Name" name="name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} required />
          <FormField label="Trigger" name="trigger" value={form.trigger} onChange={(value) => setForm((current) => ({ ...current, trigger: value }))} required />
          <FormField label="Condition" name="condition" value={form.condition} onChange={(value) => setForm((current) => ({ ...current, condition: value }))} />
          <FormField label="Action" name="action" value={form.action} onChange={(value) => setForm((current) => ({ ...current, action: value }))} required />
          <label className="flex items-center gap-2 text-sm font-medium">
            <input checked={form.enabled} type="checkbox" onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))} />
            Enabled
          </label>
          <button className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white lg:col-span-3" type="submit">Create Workflow</button>
        </form>
      </Panel>
      <Panel title="Workflow Builder">
        <DataTable
          columns={[
            { key: "name", header: "Name" },
            { key: "trigger", header: "Trigger" },
            { key: "condition", header: "Condition" },
            { key: "action", header: "Action" },
            { key: "enabled", header: "State", render: (row) => <StatusBadge value={row.enabled ? "active" : "inactive"} /> },
            {
              key: "logs",
              header: "Latest Log",
              render: (row) => {
                const latest = row.logs?.at?.(-1);
                return latest ? `${latest.status} - ${formatDate(latest.createdAt)}` : "-";
              }
            },
            {
              key: "actions",
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-700"
                    type="button"
                    onClick={() => updateWorkflow.mutate({ id: row._id, payload: { enabled: !row.enabled } })}
                  >
                    {row.enabled ? "Disable" : "Enable"}
                  </button>
                  <button className="rounded-md bg-mint px-3 py-2 text-sm font-semibold text-white" type="button" onClick={() => executeWorkflow.mutate(row)}>
                    Execute
                  </button>
                  <ConfirmButton onConfirm={() => deleteWorkflow.mutate(row._id)}>Delete</ConfirmButton>
                </div>
              )
            }
          ]}
          rows={data?.workflows ?? []}
          isLoading={isLoading}
          emptyMessage="No workflows yet."
        />
      </Panel>
    </div>
  );
}
