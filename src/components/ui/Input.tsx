"use client";

import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3
            bg-gray-50
            border border-gray-300
            rounded-xl
            text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-all duration-200
            ${error ? "border-red-400 focus:ring-red-400" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
