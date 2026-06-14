import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Panel } from "../components/Panel.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { formatDate } from "../utils/format.js";

export function AiControlPage() {
  const queryClient = useQueryClient();
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => (await api.get("/api/agents")).data
  });

  const { data: executionsData, isLoading: executionsLoading } = useQuery({
    queryKey: ["agent-executions"],
    queryFn: async () => (await api.get("/api/agents/executions")).data
  });

  const runAgents = useMutation({
    mutationFn: async () =>
      (await api.post("/api/agents/run", {
        payload: {
          intent: "general_inquiry",
          sentiment: "neutral",
          urgency: "low",
          recommendations: ["Review operational context and summarize next steps."]
        }
      })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent-executions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Agent orchestration started");
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Agents could not be started")
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Control Center"
        description="Agent definitions, manual orchestration, and execution history."
        actions={<button className="rounded-md bg-mint px-4 py-2 text-sm font-semibold text-white" type="button" onClick={() => runAgents.mutate()}>Run Agents</button>}
      />
      <Panel title="Agents">
        <DataTable
          columns={[
            { key: "agentId", header: "Agent ID" },
            { key: "name", header: "Name" },
            { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { key: "lastExecution", header: "Last Execution", render: (row) => formatDate(row.lastExecution) },
            { key: "capabilities", header: "Capabilities", render: (row) => row.capabilities?.join(", ") || "-" }
          ]}
          rows={agentsData?.agents ?? []}
          isLoading={agentsLoading}
          emptyMessage="No agents seeded yet."
        />
      </Panel>
      <Panel title="Execution History">
        <DataTable
          columns={[
            { key: "startedAt", header: "Started", render: (row) => formatDate(row.startedAt) },
            { key: "agentId", header: "Agent" },
            { key: "eventId", header: "Event" },
            { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
            { key: "finishedAt", header: "Finished", render: (row) => formatDate(row.finishedAt) }
          ]}
          rows={executionsData?.executions ?? []}
          isLoading={executionsLoading}
          emptyMessage="No agent executions yet."
        />
      </Panel>
    </div>
  );
}
