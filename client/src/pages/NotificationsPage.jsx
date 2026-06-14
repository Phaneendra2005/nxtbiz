import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "../api/client.js";
import { DataTable } from "../components/DataTable.jsx";
import { PageHeader } from "../components/PageHeader.jsx";
import { Panel } from "../components/Panel.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { formatDate } from "../utils/format.js";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/api/notifications")).data
  });

  const markRead = useMutation({
    mutationFn: async (id) => (await api.put(`/api/notifications/${id}`, { read: true })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification marked read");
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Realtime operational alerts and system messages." />
      <Panel title="Alerts">
        <DataTable
          columns={[
            { key: "createdAt", header: "Time", render: (row) => formatDate(row.createdAt) },
            { key: "type", header: "Type" },
            { key: "title", header: "Title" },
            { key: "message", header: "Message" },
            { key: "read", header: "Status", render: (row) => <StatusBadge value={row.read ? "inactive" : "active"} /> },
            {
              key: "actions",
              header: "Actions",
              render: (row) =>
                row.read ? "-" : (
                  <button className="rounded-md bg-mint px-3 py-2 text-sm font-semibold text-white" type="button" onClick={() => markRead.mutate(row._id)}>
                    Mark Read
                  </button>
                )
            }
          ]}
          rows={data?.notifications ?? []}
          isLoading={isLoading}
          emptyMessage="No notifications yet."
        />
      </Panel>
    </div>
  );
}
