import { EmptyState } from "./EmptyState.jsx";
import { LoadingState } from "./LoadingState.jsx";

export function DataTable({ columns, rows, rowKey = "_id", isLoading = false, emptyMessage = "No records found." }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-950">
          <tr>
            {columns.map((column) => (
              <th className="table-cell text-left font-medium" key={column.key}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            <tr>
              <td className="table-cell" colSpan={columns.length}>
                <LoadingState label="Loading records..." />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td className="table-cell" colSpan={columns.length}>
                <EmptyState message={emptyMessage} />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row[rowKey]}>
                {columns.map((column) => (
                  <td className="table-cell align-top" key={column.key}>
                    {column.render ? column.render(row) : row[column.key] ?? "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
