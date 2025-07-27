import React from "react";

export interface ScriptInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  rows?: number;
}

export const ScriptInput = React.forwardRef<
  HTMLTextAreaElement,
  ScriptInputProps
>(({ label, error, helperText, className = "", rows = 6, ...props }, ref) => {
  return (
    <div className="w-full">
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>

      <div className="relative">
        <textarea
          ref={ref}
          rows={rows}
          className={`
              w-full px-4 py-3 border rounded-md outline-none transition-colors resize-none
              font-mono text-sm
              ${
                error
                  ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              }
              ${className}
            `.trim()}
          {...props}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

ScriptInput.displayName = "ScriptInput";
