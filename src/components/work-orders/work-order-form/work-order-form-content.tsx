
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { WorkOrderDatePicker } from "./work-order-date-picker";
import { WorkOrderCustomerSelect } from "./work-order-customer-select";
import { WorkOrder, WorkOrderPriority, WorkOrderStatus } from "@/types/work-order";
import { PartSelector } from "@/components/part-selection/part-selector";
import { WorkOrderFormValues } from "../work-order-schema";

interface WorkOrderFormContentProps {
  form: UseFormReturn<WorkOrderFormValues>;
  initialData?: Partial<WorkOrder>;
  isSubmitting?: boolean;
  isEditMode?: boolean;
}

export function WorkOrderFormContent({ 
  form, 
  initialData, 
  isSubmitting = false,
  isEditMode = false 
}: WorkOrderFormContentProps) {
  // Check if work order status allows changing the part
  const canChangePartId = !isEditMode || initialData?.status === "Not Started";
  const { control } = form;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Work Order Number */}
      <FormField
        control={control}
        name="workOrderNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Work Order Number</FormLabel>
            <FormControl>
              <Input
                placeholder="Auto-generated if blank"
                {...field}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormDescription>
              Unique identifier for this work order
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Purchase Order Number */}
      <FormField
        control={control}
        name="purchaseOrderNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purchase Order Number</FormLabel>
            <FormControl>
              <Input
                placeholder="Optional reference number"
                {...field}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormDescription>
              Customer's reference number (optional)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Customer Selection */}
      <div className="md:col-span-2">
        <WorkOrderCustomerSelect
          form={form}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Part Selection */}
      <div className="md:col-span-2">
        <FormField
          control={control}
          name="partId"
          render={({ field }) => (
            <PartSelector
              field={{ ...field, control }}
              disabled={isSubmitting || !canChangePartId}
              customerId={form.watch('customerId')}
            />
          )}
        />
      </div>

      {/* Quantity */}
      <FormField
        control={control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Status Selection */}
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Status</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
                disabled={isSubmitting}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Not Started" id="not-started" />
                  <Label htmlFor="not-started">Not Started</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="In Progress" id="in-progress" />
                  <Label htmlFor="in-progress">In Progress</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="On Hold" id="on-hold" />
                  <Label htmlFor="on-hold">On Hold</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Completed" id="completed" />
                  <Label htmlFor="completed">Completed</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Priority Selection */}
      <FormField
        control={control}
        name="priority"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Priority</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
                disabled={isSubmitting}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Low" id="low-priority" />
                  <Label htmlFor="low-priority">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Normal" id="normal-priority" />
                  <Label htmlFor="normal-priority">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="High" id="high-priority" />
                  <Label htmlFor="high-priority">High</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Urgent" id="urgent-priority" />
                  <Label htmlFor="urgent-priority">Urgent</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Start Date */}
      <WorkOrderDatePicker
        control={control}
        name="startDate"
        label="Start Date"
        description="When work should begin (optional)"
        disabled={isSubmitting}
        required={false}
      />

      {/* Due Date */}
      <WorkOrderDatePicker
        control={control}
        name="dueDate"
        label="Due Date"
        description="When work must be completed"
        disabled={isSubmitting}
        required={true}
      />

      {/* Use Operation Templates */}
      <div className="md:col-span-2">
        <FormField
          control={control}
          name="useOperationTemplates"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Use Operation Templates
                </FormLabel>
                <FormDescription>
                  Automatically add operations from the part's templates
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Notes */}
      <div className="md:col-span-2">
        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special instructions or information for this work order"
                  className="min-h-[100px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
