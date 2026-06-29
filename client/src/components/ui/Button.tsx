import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "ai";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantClasses = {
  primary:
    "bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-200 disabled:bg-blue-300",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200 disabled:text-slate-400",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-200 disabled:text-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 disabled:bg-red-300",
  ai: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-200 disabled:bg-orange-300",
};

const sizeClasses = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {isLoading ? "Please wait..." : children}
    </button>
  );
}