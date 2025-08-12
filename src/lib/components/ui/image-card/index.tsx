import React from "react";
import { clsx } from "clsx";

export interface ImageCardProps {
  name: string;
  description?: string;
  image?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode; // For custom icon
}

export const ImageCard = React.forwardRef<HTMLDivElement, ImageCardProps>(
  (
    { name, description, image, selected, onClick, className, children },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "relative p-2 bg-white rounded-lg border cursor-pointer transition-all hover:shadow-md",
          selected
            ? "border-brand ring-2 ring-brand"
            : "border-gray-200 hover:border-gray-300",
          className
        )}
        onClick={onClick}
      >
        <div className="text-center">
          {children ? (
            <div className="w-full aspect-auto mx-auto mb-3 flex items-center justify-center">
              {children}
            </div>
          ) : (
            <div className="w-full aspect-square rounded-lg mx-auto mb-3 overflow-hidden">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-brand-light rounded-lg flex items-center justify-center">
                  <span className="text-brand text-2xl">
                    {name?.charAt(0)?.toUpperCase() || "P"}
                  </span>
                </div>
              )}
            </div>
          )}

          <h3 className="text-lg font-medium text-gray-900 mb-1">{name}</h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>

        {selected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-brand rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }
);

ImageCard.displayName = "ImageCard";
