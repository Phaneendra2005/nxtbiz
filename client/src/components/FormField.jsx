export function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  options = null,
  rows = 4,
  placeholder = ""
}) {
  const commonProps = {
    className: "form-input mt-1",
    id: name,
    name,
    value,
    required,
    placeholder,
    onChange: (event) => onChange(event.target.value)
  };

  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={name}>
      {label}
      {options ? (
        <select {...commonProps}>
          {options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input {...commonProps} type={type} />
      )}
    </label>
  );
}
