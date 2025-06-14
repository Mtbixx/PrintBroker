import * as React from "react";
import { useToast } from "./use-toast";

export const ToastContext = React.createContext<ReturnType<typeof useToast> | null>(
  null
);

export function ToastContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastContextProvider");
  }
  return context;
} 