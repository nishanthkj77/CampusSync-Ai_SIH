import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div>
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        id={inputId}
        className={[
          "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100",
          className,
        ].join(" ")}
        {...props}
      />

      {hint && !error && <p className="mt-2 text-xs text-slate-500">{hint}</p>}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}