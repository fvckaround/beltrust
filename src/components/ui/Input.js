"use client";

import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, error, className = "", ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-ink mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 rounded-xl border bg-surface text-ink text-sm placeholder:text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-navy/20 ${
          error ? "border-red-400" : "border-border focus:border-navy/40"
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Input;