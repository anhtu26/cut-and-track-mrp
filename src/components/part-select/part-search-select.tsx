import React, { useRef, useState, useEffect, KeyboardEvent, forwardRef } from "react";
import { usePartSearch } from "@/hooks/use-part-search";
import { partSearchSelectSchema } from "@/schemas/part";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useFormContext, Controller } from "react-hook-form";
import { Check, ChevronsUpDown, Loader2, PlusCircle, X } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Extract the TypeScript type from our Zod schema
export type PartSearchSelectProps = z.infer<typeof partSearchSelectSchema>;

/**
 * A reusable part selection component that uses only shadcn/ui primitives.
 * Supports form integration, keyboard navigation, and accessibility features.
 * 
 * @example
 * // Uncontrolled with react-hook-form
 * <FormField
 *   control={form.control}
 *   name="partId"
 *   render={({ field }) => (
 *     <PartSearchSelect 
 *       {...field}
 *       customerId={customerId}
 *       label="Part"
 *     />
 *   )}
 * />
 * 
 * @example
 * // Controlled usage
 * const [selectedPartId, setSelectedPartId] = useState<string | undefined>();
 * 
 * <PartSearchSelect 
 *   value={selectedPartId}
 *   onSelect={setSelectedPartId}
 *   customerId={customerId}
 * />
 */
export const PartSearchSelect = forwardRef<HTMLDivElement, PartSearchSelectProps>(
  ({
    customerId,
    disabled = false,
    label = "Part",
    description,
    placeholder = "Select a part",
    onSelect,
    value,
    defaultValue,
    name,
    showAddNewButton = true,
    required = false,
    error,
    ...props
  }, ref) => {
    // State for popover
    const [open, setOpen] = useState(false);
    
    // Access form context if it exists
    const formContext = useFormContext();
    const isInFormContext = !!formContext && !!name;
    
    // Track highlighted index for keyboard navigation
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    
    // Refs for DOM elements
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listItemsRef = useRef<(HTMLLIElement | null)[]>([]);
    
    // Use our custom hook for part search and filtering
    const {
      searchQuery,
      setSearchQuery,
      filteredParts,
      isLoading,
      refetch,
      resetSearch
    } = usePartSearch({
      customerId,
      debounceMs: 300
    });
    
    // Find the currently selected part for display
    const selectedPart = value
      ? filteredParts.find(part => part.id === value)
      : null;
    
    // Refetch when opened to ensure latest data
    useEffect(() => {
      if (open) {
        refetch();
      }
    }, [open, refetch]);
    
    // Reset highlighted index when filtered results change
    useEffect(() => {
      setHighlightedIndex(-1);
    }, [filteredParts]);
    
    // Focus search input when popover opens
    useEffect(() => {
      if (open && searchInputRef.current) {
        // Small delay to ensure popover is fully rendered
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
      }
    }, [open]);
    
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!open) return;
      
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(prevIndex => {
            const newIndex = prevIndex + 1 >= filteredParts.length ? 0 : prevIndex + 1;
            listItemsRef.current[newIndex]?.scrollIntoView({ block: "nearest" });
            return newIndex;
          });
          break;
          
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(prevIndex => {
            const newIndex = prevIndex <= 0 ? filteredParts.length - 1 : prevIndex - 1;
            listItemsRef.current[newIndex]?.scrollIntoView({ block: "nearest" });
            return newIndex;
          });
          break;
          
        case "Enter":
          e.preventDefault();
          if (highlightedIndex !== -1 && filteredParts[highlightedIndex]) {
            handleSelect(filteredParts[highlightedIndex].id);
          }
          break;
          
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
      }
    };
    
    // Handle part selection
    const handleSelect = (partId: string) => {
      if (onSelect) {
        onSelect(partId);
      }
      setOpen(false);
      resetSearch();
    };
    
    // Handle clearing the selection
    const handleClear = () => {
      if (onSelect) {
        onSelect("");
      }
      resetSearch();
    };
    
    // Render function for part list items
    const renderPartsList = () => {
      if (isLoading) {
        return (
          <div className="py-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Loading parts...</p>
          </div>
        );
      }
      
      if (filteredParts.length === 0) {
        return (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">No parts found</p>
          </div>
        );
      }
      
      return (
        <ul className="max-h-[300px] overflow-auto p-1">
          {filteredParts.map((part, index) => (
            <li
              key={part.id}
              ref={el => (listItemsRef.current[index] = el)}
              className={cn(
                "relative flex select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors",
                "cursor-pointer data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                highlightedIndex === index ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
                value === part.id && "bg-muted"
              )}
              role="option"
              aria-selected={value === part.id}
              data-highlighted={highlightedIndex === index ? "true" : undefined}
              onClick={() => handleSelect(part.id)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === part.id ? "opacity-100" : "opacity-0"
                )}
              />
              <div className="flex flex-col">
                <span className="font-medium">
                  {part.name || 'Unknown'} - {part.partNumber || 'No part number'}
                </span>
                {part.description && (
                  <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                    {part.description}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      );
    };
    
    // Render the component wrapped in FormField if used inside a form
    if (isInFormContext) {
      return (
        <Controller
          control={formContext.control}
          name={name}
          defaultValue={defaultValue}
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col" ref={ref}>
              <div className="flex items-center justify-between">
                {label && <FormLabel className={required ? "required" : ""}>{label}</FormLabel>}
                
                {showAddNewButton && (
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs"
                    asChild
                  >
                    <Link to="/parts/new" target="_blank">
                      <PlusCircle className="mr-1 h-3 w-3" />
                      Add New
                    </Link>
                  </Button>
                )}
              </div>
              
              {description && <FormDescription>{description}</FormDescription>}
              
              <Popover open={open} onOpenChange={setOpen}>
                <div className="flex items-center gap-2">
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        type="button"
                        aria-expanded={open}
                        aria-autocomplete="list"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading || disabled}
                        onClick={() => setOpen(true)}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading parts...</span>
                          </div>
                        ) : field.value && selectedPart ? (
                          <span className="truncate">
                            {selectedPart.name || 'Unknown'} - {selectedPart.partNumber || 'No part number'}
                          </span>
                        ) : (
                          placeholder
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  
                  {field.value && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => field.onChange("")}
                      className="h-9 w-9 p-0"
                      aria-label="Clear selection"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <PopoverContent 
                  className="w-[300px] p-0" 
                  align="start"
                  onKeyDown={handleKeyDown}
                  role="listbox"
                >
                  <div className="flex flex-col">
                    <div className="p-2 border-b">
                      <Input
                        ref={searchInputRef}
                        placeholder="Search parts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    {renderPartsList()}
                  </div>
                </PopoverContent>
              </Popover>
              
              {fieldState.error && (
                <FormMessage>
                  {fieldState.error.message}
                </FormMessage>
              )}
            </FormItem>
          )}
        />
      );
    }
    
    // Render standalone component (not in a form)
    return (
      <div className="flex flex-col space-y-1.5" ref={ref} {...props}>
        <div className="flex items-center justify-between">
          {label && <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", required ? "required" : "")}>{label}</label>}
          
          {showAddNewButton && (
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs"
              asChild
            >
              <Link to="/parts/new" target="_blank">
                <PlusCircle className="mr-1 h-3 w-3" />
                Add New
              </Link>
            </Button>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        
        <Popover open={open} onOpenChange={setOpen}>
          <div className="flex items-center gap-2">
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                type="button"
                aria-expanded={open}
                aria-autocomplete="list"
                className={cn(
                  "w-full justify-between",
                  !value && "text-muted-foreground"
                )}
                disabled={isLoading || disabled}
                onClick={() => setOpen(true)}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading parts...</span>
                  </div>
                ) : value && selectedPart ? (
                  <span className="truncate">
                    {selectedPart.name || 'Unknown'} - {selectedPart.partNumber || 'No part number'}
                  </span>
                ) : (
                  placeholder
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="h-9 w-9 p-0"
                aria-label="Clear selection"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <PopoverContent 
            className="w-[300px] p-0" 
            align="start"
            onKeyDown={handleKeyDown}
            role="listbox"
          >
            <div className="flex flex-col">
              <div className="p-2 border-b">
                <Input
                  ref={searchInputRef}
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9"
                />
              </div>
              {renderPartsList()}
            </div>
          </PopoverContent>
        </Popover>
        
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

PartSearchSelect.displayName = "PartSearchSelect";

export default PartSearchSelect;
