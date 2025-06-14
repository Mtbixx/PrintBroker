import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToastDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const ToastDescription = React.forwardRef<HTMLParagraphElement, ToastDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
);
ToastDescription.displayName = "ToastDescription";

export { ToastDescription }; 