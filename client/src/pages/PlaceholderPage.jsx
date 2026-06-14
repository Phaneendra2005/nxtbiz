export function PlaceholderPage({ title }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <h1 className="text-xl font-semibold tracking-normal">{title}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        This module is wired into routing and API planning for the next implementation phase.
      </p>
    </section>
  );
}
