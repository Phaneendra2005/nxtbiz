import { useQuery } from "@tanstack/react-query";
import { Activity, DollarSign, Mail, Ticket, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client.js";
import { StatusBadge } from "../components/StatusBadge.jsx";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function MetricTile({ label, value, icon: Icon }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-mint" />
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-normal">{value}</div>
    </section>
  );
}

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/api/dashboard")).data
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading dashboard...</div>;
  }

  if (isError) {
    return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">Dashboard data could not be loaded.</div>;
  }

  const metrics = data.metrics;
  const chartData = [
    { name: "Paid", value: metrics.paidRevenue },
    { name: "Outstanding", value: metrics.outstandingRevenue },
    { name: "Health", value: metrics.health.score }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Revenue, customer health, activity, and execution history.</p>
        </div>
        <StatusBadge value={`health ${metrics.health.score}`} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricTile label="Customers" value={metrics.customers} icon={Users} />
        <MetricTile label="Open Tickets" value={metrics.openTickets} icon={Ticket} />
        <MetricTile label="Emails" value={metrics.emails} icon={Mail} />
        <MetricTile label="Paid Revenue" value={currency.format(metrics.paidRevenue)} icon={DollarSign} />
        <MetricTile label="Health Score" value={metrics.health.score} icon={Activity} />
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-semibold tracking-normal">Operating Snapshot</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1f9d7a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h2 className="text-base font-semibold tracking-normal">Agent Execution History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950">
              <tr>
                <th className="table-cell text-left font-medium">Agent</th>
                <th className="table-cell text-left font-medium">Status</th>
                <th className="table-cell text-left font-medium">Event</th>
                <th className="table-cell text-left font-medium">Finished</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.executionHistory.length === 0 ? (
                <tr>
                  <td className="table-cell text-slate-500" colSpan="4">No agent executions yet.</td>
                </tr>
              ) : (
                data.executionHistory.map((execution) => (
                  <tr key={execution._id}>
                    <td className="table-cell">{execution.agentId}</td>
                    <td className="table-cell"><StatusBadge value={execution.status} /></td>
                    <td className="table-cell">{execution.eventId}</td>
                    <td className="table-cell">{execution.finishedAt ? new Date(execution.finishedAt).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
