import { LoaderCircleIcon, AlertCircleIcon, Building2Icon } from "lucide-react";
import React from "react";

export interface OrganizationProps {
  onCreateOrganization?: () => void;
  onContinueWithoutOrganization?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isCreating?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  organizationName?: string;
  title?: string;
  description?: string;
  createButtonText?: string;
  continueButtonText?: string;
  cancelButtonText?: string;
  icon?: React.ReactNode;
  variant?: "not-found" | "creating" | "error";
  customizable?: {
    showIcon?: boolean;
    showDescription?: boolean;
    showContinueOption?: boolean;
    showCancelOption?: boolean;
  };
}

export const Organization = ({
  onCreateOrganization,
  onContinueWithoutOrganization,
  onCancel,
  isLoading = false,
  isCreating = false,
  hasError = false,
  errorMessage = "Something went wrong. Please try again.",
  organizationName,
  title,
  description,
  createButtonText = "Yes, Create Organization",
  continueButtonText = "No, Continue Without Organization",
  cancelButtonText = "Cancel",
  icon,
  variant = "not-found",
  customizable = {
    showIcon: true,
    showDescription: true,
    showContinueOption: true,
    showCancelOption: true,
  },
}: OrganizationProps) => {
  const getVariantContent = () => {
    switch (variant) {
      case "creating":
        return {
          title: title || "Creating Organization",
          description:
            description || "Please wait while we set up your organization...",
          icon: icon || (
            <LoaderCircleIcon className="animate-spin size-12 text-green-500" />
          ),
        };
      case "error":
        return {
          title: title || "Error Creating Organization",
          description: description || errorMessage,
          icon: icon || <AlertCircleIcon className="size-12 text-red-500" />,
        };
      default: // "not-found"
        return {
          title: title || "Organization Not Found",
          description:
            description ||
            (organizationName
              ? `It seems we don't have your organization "${organizationName}". Do you want to create a new one?`
              : "It seems we don't have your organization. Do you want to create a new one?"),
          icon: icon || (
            <div className="size-12 bg-green-100 rounded-full flex items-center justify-center">
              <Building2Icon className="size-6 text-green-600" />
            </div>
          ),
        };
    }
  };

  const variantContent = getVariantContent();
  const isDisabled = isLoading || isCreating;

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow-lg p-8">
      {/* Icon */}
      {customizable.showIcon && (
        <div className="flex justify-center mb-6">{variantContent.icon}</div>
      )}

      {/* Title */}
      <h1 className="text-xl font-semibold text-gray-900 text-center mb-4">
        {variantContent.title}
      </h1>

      {/* Description */}
      {customizable.showDescription && (
        <p className="text-gray-600 text-center mb-8 leading-relaxed">
          {variantContent.description}
        </p>
      )}

      {/* Error Message */}
      {hasError && variant !== "error" && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <AlertCircleIcon className="size-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Create Organization Button */}
        <button
          type="button"
          onClick={onCreateOrganization}
          disabled={isDisabled}
          className="w-full flex items-center justify-center gap-3 bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating && <LoaderCircleIcon className="animate-spin size-5" />}
          {isCreating ? "Creating..." : createButtonText}
        </button>

        {/* Continue Without Organization Button */}
        {customizable.showContinueOption && (
          <button
            type="button"
            onClick={onContinueWithoutOrganization}
            disabled={isDisabled}
            className="w-full py-3 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {continueButtonText}
          </button>
        )}

        {/* Cancel Button */}
        {customizable.showCancelOption && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isDisabled}
            className="w-full py-3 px-4 text-gray-500 hover:text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelButtonText}
          </button>
        )}
      </div>

      {/* Additional Information */}
      {variant === "not-found" && !hasError && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Creating an organization will help you manage your team and projects
            more effectively.
          </p>
        </div>
      )}

      {/* Loading Overlay for Creating State */}
      {variant === "creating" && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <LoaderCircleIcon className="animate-spin size-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Setting up your organization...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
