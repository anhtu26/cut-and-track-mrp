
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Customer } from "@/types/customer";
import { Part } from "@/types/part";
import { CreateWorkOrderInput, UpdateWorkOrderInput, WorkOrder } from "@/types/work-order";
import { WorkOrderPriority, WorkOrderStatus } from "@/types/work-order-status";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const workOrderSchema = z.object({
  workOrderNumber: z.string().optional(),
  purchaseOrderNumber: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
  partId: z.string().min(1, "Part is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  status: z.enum(["Not Started", "In Progress", "QC", "Complete", "Shipped"]).default("Not Started"),
  priority: z.enum(["Low", "Normal", "High", "Critical"]).default("Normal"),
  startDate: z.date().optional(),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface WorkOrderFormProps {
  initialData?: WorkOrder;
  onSubmit: (data: CreateWorkOrderInput | UpdateWorkOrderInput) => Promise<void>;
  isSubmitting: boolean;
}

export function WorkOrderForm({ initialData, onSubmit, isSubmitting }: WorkOrderFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Customer[];
    },
  });

  const { data: parts = [], isLoading: isLoadingParts } = useQuery({
    queryKey: ["parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parts")
        .select("*")
        .eq('archived', false)
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        partNumber: item.part_number,
        // Include other fields as needed
      })) as Part[];
    },
  });
  
  // Prepare default values from initialData if provided
  const defaultValues: Partial<WorkOrderFormData> = {
    workOrderNumber: initialData?.workOrderNumber || "",
    purchaseOrderNumber: initialData?.purchaseOrderNumber || "",
    customerId: initialData?.customerId || "",
    partId: initialData?.partId || "",
    quantity: initialData?.quantity || 1,
    status: initialData?.status || "Not Started",
    priority: initialData?.priority || "Normal",
    startDate: initialData?.startDate ? new Date(initialData.startDate) : undefined,
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    assignedToId: initialData?.assignedTo?.id || "",
    notes: initialData?.notes || "",
  };

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues,
  });

  // Handle form submission
  const handleSubmit = async (data: WorkOrderFormData) => {
    setSubmitError(null);
    try {
      const formattedData = {
        ...(initialData?.id ? { id: initialData.id } : {}),
        workOrderNumber: data.workOrderNumber,
        purchaseOrderNumber: data.purchaseOrderNumber,
        customerId: data.customerId,
        partId: data.partId,
        quantity: data.quantity,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate ? format(data.startDate, "yyyy-MM-dd") : undefined,
        dueDate: format(data.dueDate, "yyyy-MM-dd"),
        assignedToId: data.assignedToId,
        notes: data.notes,
      };
      
      await onSubmit(formattedData);
    } catch (error: any) {
      console.error("Form submission error:", error);
      setSubmitError(error.message || "Failed to submit form");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Work Order Number - Optional, system generated if not provided */}
        <FormField
          control={form.control}
          name="workOrderNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Order Number (Optional)</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Will be auto-generated if left blank"
                  disabled={!!initialData?.workOrderNumber}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Purchase Order Number */}
        <FormField
          control={form.control}
          name="purchaseOrderNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Order Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer Selection */}
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value} 
                disabled={isLoadingCustomers}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Part Selection */}
        <FormField
          control={form.control}
          name="partId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Part</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={isLoadingParts}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a part" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {parts.map(part => (
                    <SelectItem key={part.id} value={part.id}>
                      {part.name} - {part.partNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Quantity */}
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="number" 
                  min="1" 
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="QC">QC</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Date - Optional */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Due Date - Required */}
        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes - Optional */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Error display */}
        {submitError && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Work Order" : "Create Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
