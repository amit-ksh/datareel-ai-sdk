import React, { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";

export interface MultiInputProps {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (values: string[]) => void;
  validator?: (value: string) => boolean;
  error?: string;
  helperText?: string;
  className?: string;
  maxItems?: number;
  leftIcon?: React.ReactNode;
}

export const MultiInput = React.forwardRef<HTMLInputElement, MultiInputProps>(
  (
    {
      label,
      placeholder,
      value = [],
      onChange,
      validator,
      error,
      helperText,
      className = "",
      maxItems,
      leftIcon,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState("");
    const [inputError, setInputError] = useState("");

    const hasLeftIcon = !!leftIcon;

    const addValue = (newValue: string) => {
      const trimmedValue = newValue.trim();
      if (!trimmedValue) return;

      // Check if already exists
      if (value.includes(trimmedValue)) {
        setInputError("This value already exists");
        return;
      }

      // Check validator
      if (validator && !validator(trimmedValue)) {
        setInputError("Invalid format");
        return;
      }

      // Check max items
      if (maxItems && value.length >= maxItems) {
        setInputError(`Maximum ${maxItems} items allowed`);
        return;
      }

      // Add the value
      onChange([...value, trimmedValue]);
      setInputValue("");
      setInputError("");
    };

    const removeValue = (index: number) => {
      const newValues = [...value];
      newValues.splice(index, 1);
      onChange(newValues);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addValue(inputValue);
      } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeValue(value.length - 1);
      }
    };

    const handleBlur = () => {
      if (inputValue.trim()) {
        addValue(inputValue);
      }
    };

    const currentError = error || inputError;

    return (
      <div className={clsx("w-full", className)}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>

        <div
          className={clsx(
            "min-h-[48px] px-4 py-2 border rounded-md transition-colors",
            "flex flex-wrap items-center gap-2",
            currentError
              ? "border-red-300 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500"
              : "border-gray-300 focus-within:ring-2 focus-within:ring-brand focus-within:border-brand"
          )}
        >
          {hasLeftIcon && (
            <div className="text-gray-400 flex-shrink-0">{leftIcon}</div>
          )}

          {/* Tags */}
          {value.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-brand-light text-brand text-sm rounded-md"
            >
              {item}
              <button
                type="button"
                onClick={() => removeValue(index)}
                className="text-brand hover:text-brand-hover transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {/* Input */}
          <input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInputError("");
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] outline-none bg-transparent"
            disabled={maxItems && value.length >= maxItems}
          />
        </div>

        {currentError && (
          <p className="mt-1 text-sm text-red-600">{currentError}</p>
        )}

        {helperText && !currentError && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

MultiInput.displayName = "MultiInput";
