import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, API_URL, SOCKET_URL } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";
import { FormField } from "../components/FormField.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Panel } from "../components/Panel.jsx";
import { formatDate } from "../utils/format.js";

export function SettingsPage() {
  const [query, setQuery] = useState("");
  const { data: healthData } = useQuery({
    queryKey: ["health"],
    queryFn: async () => (await api.get("/health")).data
  });
  const { data: memoryData, isLoading } = useQuery({
    queryKey: ["memory", query],
    queryFn: async () => (await api.get("/api/memory/search", { params: { q: query } })).data
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Runtime Settings" description="Environment status, service endpoints, and memory search." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Runtime">
          <dl className="grid gap-3 p-4 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-slate-500">API URL</dt><dd className="font-medium">{API_URL}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Socket URL</dt><dd className="font-medium">{SOCKET_URL}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Health</dt><dd className="font-medium">{healthData?.status ?? "unknown"}</dd></div>
            <div className="flex justify-between gap-4"><dt className="text-slate-500">Service</dt><dd className="font-medium">{healthData?.service ?? "NxtBiz API"}</dd></div>
          </dl>
        </Panel>
        <Panel title="Memory Search">
          <div className="p-4">
            <FormField label="Search" name="memorySearch" value={query} onChange={setQuery} placeholder="customer, source, key, or tag" />
          </div>
        </Panel>
      </div>
      <Panel title="Memory Results">
        <DataTable
          columns={[
            { key: "updatedAt", header: "Updated", render: (row) => formatDate(row.updatedAt) },
            { key: "scope", header: "Scope" },
            { key: "key", header: "Key" },
            { key: "source", header: "Source" },
            { key: "tags", header: "Tags", render: (row) => row.tags?.join(", ") || "-" }
          ]}
          rows={memoryData?.memories ?? []}
          isLoading={isLoading}
          emptyMessage="No memory entries match this search."
        />
      </Panel>
    </div>
  );
}
