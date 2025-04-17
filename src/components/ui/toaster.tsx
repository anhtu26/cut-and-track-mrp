
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useEffect, useState } from "react";

export function Toaster() {
  // FIXED: Ensure hooks are called in the same order every render
  // Always initialize state variables first, then use them conditionally
  const [mounted, setMounted] = useState(false);
  // Create a state to hold the toast data once we're mounted
  const [toastState, setToastState] = useState<{ toasts: any[] }>({ toasts: [] });
  
  useEffect(() => {
    // Only access useToast hook on the client side
    if (typeof window !== 'undefined') {
      setMounted(true);
      try {
        // Get toasts once we're mounted
        const { toasts } = useToast();
        setToastState({ toasts });
        
        if (process.env.NODE_ENV === 'development') {
          console.debug("Toaster mounted successfully, hooks intact");
        }
      } catch (error) {
        console.error("Error initializing toast system:", error);
      }
    }
  }, []);
  
  // Don't render anything during SSR or before mounting
  if (!mounted) {
    return null;
  }

  return (
    <ToastProvider>
      {toastState.toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
