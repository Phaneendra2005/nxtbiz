export function LoadingState({ label = "Loading..." }) {
  return <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>;
}

export function ErrorState({ message = "Something went wrong." }) {
  return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{message}</div>;
}

export function EmptyState({ message = "No records found." }) {
  return <div className="py-3 text-sm text-slate-500 dark:text-slate-400">{message}</div>;
}
