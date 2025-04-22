import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PartSelector } from './part-selector';
import * as useParts from '@/hooks/use-parts';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserver;

// Mock the useParts hook
jest.mock('@/hooks/use-parts', () => ({
  useParts: jest.fn()
}));

// Create a test form schema
const testSchema = z.object({
  partId: z.string().optional(),
});

type TestFormValues = z.infer<typeof testSchema>;

// Test wrapper component with form context
const TestFormWrapper = ({ children, defaultValues = { partId: '' } }: { children: React.ReactNode, defaultValues?: TestFormValues }) => {
  const methods = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues,
  });
  
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('PartSelector', () => {
  let queryClient: QueryClient;
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Mock the parts data
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: [
        {
          id: 'part1',
          name: 'Test Part 1',
          partNumber: 'TP-001',
          description: 'This is test part 1',
          active: true,
          materials: ['material1'],
          customerId: 'customer1',
        },
        {
          id: 'part2',
          name: 'Test Part 2',
          partNumber: 'TP-002',
          description: 'This is test part 2',
          active: true,
          materials: ['material2'],
          customerId: 'customer1',
        },
      ],
      isLoading: false,
      refetch: jest.fn(),
    });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders the part selector correctly and handles selection', async () => {
    const user = userEvent.setup();
    let submittedValue: string | undefined;
    
    const TestComponent = () => {
      const methods = useForm<TestFormValues>({
        resolver: zodResolver(testSchema),
        defaultValues: { partId: '' },
      });
      const { control, handleSubmit, watch } = methods;
      
      const onSubmit = (data: TestFormValues) => {
        submittedValue = data.partId;
      };
      
      const selectedValue = watch('partId');
      
      return (
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} data-testid="form">
            <Controller
              name="partId"
              control={control}
              render={({ field }) => (
                <PartSelector
                  field={field}
                  label="Test Part Field"
                  description="Select a test part"
                />
              )}
            />
            <button type="submit">Submit</button>
            <div data-testid="selected-value">{selectedValue}</div>
          </form>
        </FormProvider>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    );
    
    // Check if the combobox and description render (label is associated via FormField internally)
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
    // Check the label text is associated with the combobox
    expect(screen.getByLabelText('Test Part Field')).toBe(combobox);
    expect(screen.getByText('Select a test part')).toBeInTheDocument(); // Check description
    
    // Open the popover
    await user.click(combobox);
    
    // Check if the options are displayed
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search parts...')).toBeInTheDocument();
      expect(screen.getByText('Test Part 1 - TP-001')).toBeInTheDocument();
      expect(screen.getByText('Test Part 2 - TP-002')).toBeInTheDocument();
    });
    
    // Select an option
    const option1 = screen.getByText('Test Part 1 - TP-001');
    await user.click(option1);
    
    // Verify the trigger button updates
    await waitFor(() => {
      expect(combobox).toHaveTextContent('Test Part 1 - TP-001');
    });

    // Verify form state updates
    expect(screen.getByTestId('selected-value')).toHaveTextContent('part1');
    
    // Submit form to check if value is passed correctly
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(submittedValue).toBe('part1');
  });
  
  test('shows loading state correctly', async () => {
    // Mock loading state
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      refetch: jest.fn(),
    });
    
    const TestComponent = () => {
      const methods = useForm<TestFormValues>({
        resolver: zodResolver(testSchema),
        defaultValues: { partId: '' },
      });
      const { control } = methods;
      
      return (
        <FormProvider {...methods}>
          <Controller
            name="partId"
            control={control}
            render={({ field }) => <PartSelector field={field} />}
          />
        </FormProvider>
      );
    };
    
    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    );
    
    // Check for loading indicator
    expect(screen.getByText('Loading parts...')).toBeInTheDocument();
  });
  
  test('filters parts based on search query', async () => {
    const user = userEvent.setup();
    const TestComponent = () => {
      const methods = useForm<TestFormValues>({
        resolver: zodResolver(testSchema),
        defaultValues: { partId: '' },
      });
      const { control } = methods;
      
      return (
        <FormProvider {...methods}>
          <Controller
            name="partId"
            control={control}
            render={({ field }) => <PartSelector field={field} />}
          />
        </FormProvider>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    );
    
    // Open the popover
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    
    // Wait for the search input to appear and then type
    const searchInput = await screen.findByPlaceholderText('Search parts...');
    expect(searchInput).toBeInTheDocument();
    await user.type(searchInput, 'Test Part 2');
    
    // Check if only the matching part is displayed
    await waitFor(() => {
      expect(screen.queryByText('Test Part 1 - TP-001')).not.toBeInTheDocument();
      expect(screen.getByText('Test Part 2 - TP-002')).toBeInTheDocument();
    });
  });
  
  test('displays selected part in trigger button when initialized', async () => {
    const TestComponent = () => {
      const methods = useForm<TestFormValues>({
        resolver: zodResolver(testSchema),
        defaultValues: { partId: 'part1' }, // Initialize with a value
      });
      const { control } = methods;
      
      return (
        <FormProvider {...methods}>
          <Controller
            name="partId"
            control={control}
            render={({ field }) => <PartSelector field={field} />}
          />
        </FormProvider>
      );
    };

    render(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    );
    
    // Check if the selected part is displayed in the button immediately
    await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveTextContent('Test Part 1 - TP-001');
    });
  });
}); 