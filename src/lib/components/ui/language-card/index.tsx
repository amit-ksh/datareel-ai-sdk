import React from "react";
import { clsx } from "clsx";

export interface LanguageCardProps {
  flag?: string;
  name: string;
  description: string;
  selected: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  isPopular?: boolean;
}

export const LanguageCard = React.forwardRef<HTMLDivElement, LanguageCardProps>(
  (
    { flag, name, description, selected, onClick, children, isPopular = false },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
          selected
            ? "border-green-500 ring-2 ring-green-200"
            : "border-gray-200 hover:border-gray-300"
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Flag */}
            <div className="size-10 rounded-sm overflow-hidden flex-shrink-0">
              {children || (
                <p className="w-full h-full bg-gray-200 flex items-center justify-center text-lg">
                  {flag || name.charAt(0)}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">{name}</h3>
                {isPopular && (
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded">
                    Popular
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          {/* Selection indicator - vertically centered */}
          <div className="flex items-center">
            {selected && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

LanguageCard.displayName = "LanguageCard";
