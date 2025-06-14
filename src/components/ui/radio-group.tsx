import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioGroupProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const RadioGroup = React.forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="radio"
          className={cn(
            "h-4 w-4 border-gray-300 text-primary focus:ring-primary",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

export { RadioGroup }; 