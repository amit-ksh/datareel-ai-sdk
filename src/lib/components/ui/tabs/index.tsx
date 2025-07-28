import React from "react";
import { clsx } from "clsx";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline";
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ items, activeTab, onTabChange, className, variant = "default" }, ref) => {
    const [internalActiveTab, setInternalActiveTab] = React.useState(
      activeTab || items[0]?.id || ""
    );

    const currentActiveTab = activeTab || internalActiveTab;

    const handleTabChange = (tabId: string) => {
      if (onTabChange) {
        onTabChange(tabId);
      } else {
        setInternalActiveTab(tabId);
      }
    };

    const activeContent = items.find(
      (item) => item.id === currentActiveTab
    )?.content;

    const getTabListClasses = () => {
      const base = "flex";
      switch (variant) {
        case "pills":
          return clsx(base, "gap-1 p-1 bg-gray-100 rounded-lg");
        case "underline":
          return clsx(base, "border-b border-gray-200");
        default:
          return clsx(base, "border-0 border-gray-200");
      }
    };

    const getTabClasses = (item: TabItem, isActive: boolean) => {
      const base =
        "px-4 py-2 cursor-pointer rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

      if (item.disabled) {
        return clsx(base, "cursor-not-allowed opacity-50 text-gray-400");
      }

      switch (variant) {
        case "pills":
          return clsx(
            base,
            "rounded-md",
            isActive
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          );
        case "underline":
          return clsx(
            base,
            "border-b-2 -mb-px",
            isActive
              ? "border-brand bg-brand text-white"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          );
        default:
          return clsx(
            base,
            "border-b-2 -mb-px",
            isActive
              ? "border-brand bg-brand text-white"
              : "border-transparent text-gray-500 hover:text-gray-700"
          );
      }
    };

    return (
      <div ref={ref} className={clsx("w-full", className)}>
        <div className={getTabListClasses()}>
          {items.map((item) => {
            const isActive = item.id === currentActiveTab;
            return (
              <button
                key={item.id}
                className={getTabClasses(item, isActive)}
                onClick={() => !item.disabled && handleTabChange(item.id)}
                disabled={item.disabled}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${item.id}`}
                id={`tab-${item.id}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          {items.map((item) => (
            <div
              key={item.id}
              id={`tabpanel-${item.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${item.id}`}
              className={clsx(
                "focus-visible:outline-none",
                item.id === currentActiveTab ? "block" : "hidden"
              )}
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

Tabs.displayName = "Tabs";
