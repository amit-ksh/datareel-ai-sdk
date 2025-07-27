import React from "react";
import { clsx } from "clsx";

export interface IconCardProps {
  icon?: string;
  title: string;
  description: string;
  selected: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  iconBg?: string;
  isCustom?: boolean;
}

export const IconCard = React.forwardRef<HTMLDivElement, IconCardProps>(
  (
    {
      icon,
      title,
      description,
      selected,
      onClick,
      children,
      iconBg = "bg-blue-100",
    },
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
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Icon at top center - small 8x8 */}
          <div
            className={clsx(
              "size-10 rounded flex items-center justify-center",
              iconBg
            )}
          >
            {children || (
              <span className="text-xs font-medium">
                {icon || title.charAt(0)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-medium text-gray-900">{title}</h3>

          {/* Description */}
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    );
  }
);

IconCard.displayName = "IconCard";
