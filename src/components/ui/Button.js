export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-full px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-navy text-background hover:bg-navy-light",
    secondary: "border border-border text-ink hover:bg-surface",
    ghost: "text-ink hover:bg-surface",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}