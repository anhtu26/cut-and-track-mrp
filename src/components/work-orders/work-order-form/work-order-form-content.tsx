
// Add a checkbox to select if we want to use operation templates
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSelect } from "./work-order-customer-select";
import { PartSelect } from "./work-order-part-select";
import { WorkOrderDatePicker } from "./work-order-date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { WorkOrder } from "@/types/work-order";

interface WorkOrderFormContentProps {
  form: any;
  isSubmitting: boolean;
  isEditMode?: boolean;
  initialData?: WorkOrder; // Added initialData to the props interface
}

export function WorkOrderFormContent({
  form,
  isSubmitting,
  isEditMode = false,
  initialData,
}: WorkOrderFormContentProps) {
  const [useTemplates, setUseTemplates] = useState(true);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {!isEditMode && (
          <FormField
            control={form.control}
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
          control={form.control}
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
        <CustomerSelect field={form} isLoading={isSubmitting} />
        <PartSelect field={form} isLoading={isSubmitting} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <WorkOrderDatePicker
          control={form.control}
          name="startDate"
          label="Start Date"
          optional={true}
        />
        <WorkOrderDatePicker
          control={form.control}
          name="dueDate"
          label="Due Date"
          optional={false}
        />
      </div>

      {!isEditMode && (
        <FormField
          control={form.control}
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
        control={form.control}
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
