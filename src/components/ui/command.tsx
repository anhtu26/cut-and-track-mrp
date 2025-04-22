import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => {
  const internalRef = React.useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(ref, internalRef);
  const [mounted, setMounted] = React.useState(false);
  
  // Handle safe refs and props to prevent null access
  const safeProps = {
    ...props,
    children: Array.isArray(props.children) ? props.children : (props.children || [])
  };
  
  // Wait until component is mounted to prevent DOM errors
  useIsomorphicLayoutEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Handle potential DOM exceptions safely  
  React.useEffect(() => {
    // Add safety observer to handle potential DOM disconnections
    const element = internalRef.current;
    if (!element) return;
    
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && !document.contains(element)) {
          // Component has been disconnected from DOM, handle cleanup
          console.warn("Command component disconnected from DOM");
          observer.disconnect();
          return;
        }
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [mounted]);
  
  return (
    <CommandPrimitive
      ref={mergedRef}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      {...safeProps}
    />
  )
})

// Helper to merge refs safely
function useMergedRef<T>(
  externalRef: React.ForwardedRef<T>,
  internalRef: React.RefObject<T>
): React.RefCallback<T> {
  return React.useCallback(
    (value: T) => {
      if (typeof externalRef === 'function') {
        externalRef(value);
      } else if (externalRef) {
        (externalRef as React.MutableRefObject<T>).current = value;
      }
      // @ts-ignore - Different ref types
      internalRef.current = value;
    },
    [externalRef, internalRef]
  );
}
Command.displayName = CommandPrimitive.displayName

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  const safeChildren = Array.isArray(children) ? children : (children || [])
  
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {safeChildren}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => {
  const safeProps = {
    ...props,
    children: Array.isArray(props.children) ? props.children : (props.children || [])
  }
  
  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      {...safeProps}
    />
  )
})

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false);
  
  if (hasError) {
    return <div className="p-1 text-sm text-muted-foreground">Error displaying group</div>;
  }
  
  try {
    const safeProps = {
      ...props,
      children: Array.isArray(props.children) ? props.children : (props.children || [])
    };

    // Check if any children are null or undefined and filter them out
    if (Array.isArray(safeProps.children)) {
      safeProps.children = safeProps.children.filter(child => child !== null && child !== undefined);
    }

    return (
      <ErrorBoundary onError={() => setHasError(true)}>
        <CommandPrimitive.Group
          ref={ref}
          className={cn(
            "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
            className
          )}
          {...safeProps}
        />
      </ErrorBoundary>
    )
  } catch (error) {
    console.error("Error in CommandGroup:", error);
    setHasError(true);
    return <div className="p-1" ref={ref as any}>Error displaying items</div>;
  }
})

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

// Error boundary component for Command components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Command component error:", error, errorInfo);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return null; // Render nothing when error occurs to prevent cascade
    }
    return this.props.children;
  }
}

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false);
  
  if (hasError) {
    return null; // Don't render anything if error occurred
  }
  
  try {
    // Remove potentially problematic props
    const { onSelect, ...safeProps } = props;
    
    // Create a safe onSelect handler
    const safeOnSelect = onSelect ? (...args: any[]) => {
      try {
        return onSelect(...args);
      } catch (error) {
        console.error("Error in CommandItem onSelect:", error);
        return undefined;
      }
    } : undefined;
    
    return (
      <ErrorBoundary onError={() => setHasError(true)}>
        <CommandPrimitive.Item
          ref={ref}
          className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
            className
          )}
          {...safeProps}
          onSelect={safeOnSelect}
        />
      </ErrorBoundary>
    )
  } catch (error) {
    console.error("Error in CommandItem:", error);
    setHasError(true);
    return null;
  }
})

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
