import { useToast } from "./use-toast";
import { Toast } from "./toast";
import { ToastViewport } from "./toast-viewport";

export function ToastProvider() {
  const { toasts } = useToast();

  return (
    <>
      {toasts.map(({ id, title, description, action, ...props }) => {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <div className="text-sm font-semibold">{title}</div>}
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
            {action}
          </Toast>
        );
      })}
      <ToastViewport />
    </>
  );
} 