import React from "react";
import { clsx } from "clsx";

export interface ItemSelectorProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  step?: number;
}

export const ItemSelector = React.forwardRef<HTMLDivElement, ItemSelectorProps>(
  ({ title, subtitle, children, className, step }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "w-full shadow-lg p-4 bg-white border border-gray-300 rounded-xl",
          className
        )}
      >
        <div className="mb-6">
          {step && (
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-brand text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                {step}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
          )}
          {!step && (
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h2>
          )}
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>

        <div className="space-y-4">{children}</div>
      </div>
    );
  }
);

ItemSelector.displayName = "ItemSelector";
