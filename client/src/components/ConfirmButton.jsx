export function ConfirmButton({ children, onConfirm, className = "", message = "Are you sure?", disabled = false }) {
  return (
    <button
      className={`rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950 ${className}`}
      disabled={disabled}
      type="button"
      onClick={() => {
        if (window.confirm(message)) {
          onConfirm();
        }
      }}
    >
      {children}
    </button>
  );
}
