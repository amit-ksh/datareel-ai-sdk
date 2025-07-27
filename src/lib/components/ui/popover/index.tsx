import React, { useState, useRef, useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";

const popoverVariants = cva(
  "absolute z-50 w-72 rounded-md border bg-white p-4 shadow-lg outline-none",
  {
    variants: {
      side: {
        top: "bottom-full mb-2",
        bottom: "top-full mt-2",
        left: "right-full mr-2",
        right: "left-full ml-2",
      },
      align: {
        start: "",
        center: "",
        end: "",
      },
    },
    compoundVariants: [
      // Top
      { side: "top", align: "start", class: "left-0" },
      { side: "top", align: "center", class: "left-1/2 -translate-x-1/2" },
      { side: "top", align: "end", class: "right-0" },
      // Bottom
      { side: "bottom", align: "start", class: "left-0" },
      { side: "bottom", align: "center", class: "left-1/2 -translate-x-1/2" },
      { side: "bottom", align: "end", class: "right-0" },
      // Left
      { side: "left", align: "start", class: "top-0" },
      { side: "left", align: "center", class: "top-1/2 -translate-y-1/2" },
      { side: "left", align: "end", class: "bottom-0" },
      // Right
      { side: "right", align: "start", class: "top-0" },
      { side: "right", align: "center", class: "top-1/2 -translate-y-1/2" },
      { side: "right", align: "end", class: "bottom-0" },
    ],
    defaultVariants: {
      side: "bottom",
      align: "center",
    },
  }
);

export interface PopoverProps extends VariantProps<typeof popoverVariants> {
  children: React.ReactNode;
  content: React.ReactNode;
  trigger?: "click" | "hover";
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      children,
      content,
      side,
      align,
      trigger = "click",
      disabled = false,
      className,
      contentClassName,
      onOpenChange,
      defaultOpen = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
      if (disabled) return;
      const newOpen = !isOpen;
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    const handleClose = () => {
      setIsOpen(false);
      onOpenChange?.(false);
    };

    const handleMouseEnter = () => {
      if (trigger === "hover" && !disabled) {
        setIsOpen(true);
        onOpenChange?.(true);
      }
    };

    const handleMouseLeave = () => {
      if (trigger === "hover") {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    // Click outside to close
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          isOpen &&
          popoverRef.current &&
          triggerRef.current &&
          !popoverRef.current.contains(event.target as Node) &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          handleClose();
        }
      };

      if (trigger === "click") {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen, trigger]);

    // Escape key to close
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && isOpen) {
          handleClose();
        }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    return (
      <div
        className={clsx("relative inline-block", className)}
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Trigger */}
        <div
          ref={triggerRef}
          onClick={trigger === "click" ? handleToggle : undefined}
          className={clsx(
            "cursor-pointer",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {children}
        </div>

        {/* Content */}
        {isOpen && (
          <div
            ref={popoverRef}
            className={clsx(popoverVariants({ side, align }), contentClassName)}
          >
            {content}
          </div>
        )}
      </div>
    );
  }
);

Popover.displayName = "Popover";
