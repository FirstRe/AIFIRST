"use client";

import { forwardRef } from "react";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onChange, label, disabled = false, className = "" }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent
          ${checked ? "bg-green-500" : "bg-gray-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
      >
        {label && <span className="sr-only">{label}</span>}
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white shadow-lg
            transition-transform duration-200 ease-in-out
            ${checked ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    );
  },
);

Toggle.displayName = "Toggle";
