
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrderCustomerSelect } from "./work-order-customer-select";
import { WorkOrderDatePicker } from "./work-order-date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { WorkOrder } from "@/types/work-order";
import { PartSelector } from "@/components/part-selection/part-selector";
import { Control } from "react-hook-form";

interface WorkOrderFormContentProps {
  form: any;
  isSubmitting: boolean;
  isEditMode?: boolean;
  initialData?: Partial<WorkOrder>; // Updated to accept partial work order
}

export function WorkOrderFormContent({
  form,
  isSubmitting,
  isEditMode = false,
  initialData,
}: WorkOrderFormContentProps) {
  // Using optional chaining to safely access useOperationTemplates
  const [useTemplates, setUseTemplates] = useState(
    initialData?.useOperationTemplates !== undefined 
      ? !!initialData.useOperationTemplates 
      : true
  );

  // Get the currently selected customer ID for filtering parts
  const customerId = form.watch("customerId");
  const control: Control = form.control;

  if (!control) {
    console.error("WorkOrderFormContent: Form control is missing");
    return <div className="p-4 border rounded bg-red-50 text-red-600">Form configuration error</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {!isEditMode && (
          <FormField
            control={control}
            name="workOrderNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Order Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Leave blank for auto-generate"
                    disabled={isSubmitting}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="purchaseOrderNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Order Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="Customer PO#"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <WorkOrderCustomerSelect 
          control={control} 
          isDisabled={isSubmitting}
        />
        
        <PartSelector 
          field={{
            control,
            name: "partId",
            value: form.watch("partId"),
            onChange: (value: string) => form.setValue("partId", value)
          }} 
          disabled={isSubmitting}
          customerId={customerId}
          description="Select a part for this work order"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField
          control={control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1"
                  disabled={isSubmitting}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value || "Not Started"}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="QC">QC</option>
                  <option value="Complete">Complete</option>
                  <option value="Shipped">Shipped</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value || "Normal"}
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <WorkOrderDatePicker
          control={control}
          name="startDate"
          label="Start Date"
          optional={true}
        />
        <WorkOrderDatePicker
          control={control}
          name="dueDate"
          label="Due Date"
          optional={false}
        />
      </div>

      {!isEditMode && (
        <FormField
          control={control}
          name="useOperationTemplates"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setUseTemplates(!!checked);
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Use operation templates from part</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Automatically create operations based on the part's operation templates
                </p>
              </div>
            </FormItem>
          )}
        />
      )}

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Any additional information about this work order"
                className="h-24"
                disabled={isSubmitting}
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
