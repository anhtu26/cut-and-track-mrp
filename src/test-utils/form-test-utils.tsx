import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

/**
 * Wrapper component that provides react-hook-form context for testing components
 * that rely on FormField and other form components
 */
export function FormProviderWrapper({ children, defaultValues = {} }: { 
  children: React.ReactNode, 
  defaultValues?: Record<string, any> 
}) {
  const methods = useForm({
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  );
}

/**
 * Create a properly structured mock field object for react-hook-form
 * This should be used when testing components that expect a FormField prop
 */
export function createMockFieldProps(overrides: Record<string, any> = {}) {
  // Create a mock form methods object that simulates react-hook-form's methods
  const mockMethods = {
    control: {
      _names: { mount: new Set(), unMount: new Set(), array: new Set(), watch: new Set() },
      _formState: {},
      _options: { 
        shouldUnregister: false,
        defaultValues: {}
      },
      register: jest.fn(),
      unregister: jest.fn(),
      getFieldState: jest.fn(),
      _subjects: {
        watch: { next: jest.fn() },
        array: { next: jest.fn() },
        state: { next: jest.fn() }
      },
      // Add other required methods as needed
    },
    formState: { errors: {} },
    getValues: jest.fn(),
    setValue: jest.fn(),
    watch: jest.fn(),
    handleSubmit: jest.fn(),
    reset: jest.fn(),
    clearErrors: jest.fn(),
    setError: jest.fn(),
    trigger: jest.fn(),
  };
  
  // Create a field object for testing form components
  const mockField = {
    onChange: jest.fn(),
    onBlur: jest.fn(),
    value: '',
    name: 'mockField',
    ref: jest.fn(),
    ...mockMethods,
    ...overrides
  };
  
  return mockField;
} 