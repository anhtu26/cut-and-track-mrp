
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { WorkOrderDatePicker } from "./work-order-date-picker";
import { CustomerSelect } from "./work-order-customer-select";
import { PartSelect } from "./work-order-part-select";

export function WorkOrderFormContent({ 
  form, 
  initialData, 
  isSubmitting 
}: { 
  form: any, 
  initialData?: any, 
  isSubmitting: boolean 
}) {
  return (
    <>
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

      <CustomerSelect field={form} isLoading={isSubmitting} />
      <PartSelect field={form} isLoading={isSubmitting} />

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

      <WorkOrderDatePicker 
        control={form.control} 
        name="startDate" 
        label="Start Date" 
        optional 
      />

      <WorkOrderDatePicker 
        control={form.control} 
        name="dueDate" 
        label="Due Date" 
      />

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
    </>
  );
}
