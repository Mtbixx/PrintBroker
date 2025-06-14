import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning" | "info";
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-white text-gray-900",
      success: "bg-green-50 text-green-800",
      error: "bg-red-50 text-red-800",
      warning: "bg-yellow-50 text-yellow-800",
      info: "bg-blue-50 text-blue-800",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg p-4 shadow-lg",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Toast.displayName = "Toast";

export { Toast }; 