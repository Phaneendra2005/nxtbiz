export function Panel({ title, children, actions = null, className = "" }) {
  return (
    <section className={`rounded-md border border-slate-200 bg-white shadow-panel dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {(title || actions) && (
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          {title && <h2 className="text-base font-semibold tracking-normal">{title}</h2>}
          {actions}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
