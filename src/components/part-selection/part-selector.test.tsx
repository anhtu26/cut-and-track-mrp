import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PartSelector } from './part-selector';
import * as useParts from '@/hooks/use-parts';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
const TestForm = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      partId: '',
    }
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
  
  test('renders the part selector correctly', async () => {
    const user = userEvent.setup();
    const mockField = {
      value: '',
      onChange: jest.fn(),
      control: {
        register: jest.fn(),
        unregister: jest.fn(),
        getFieldState: jest.fn(),
        _formValues: {},
        _defaultValues: {},
      },
    };
    
    render(
      <QueryClientProvider client={queryClient}>
        <PartSelector
          field={mockField}
          label="Test Part Field"
          description="Select a test part"
        />
      </QueryClientProvider>
    );
    
    // Check if the component renders properly
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Test Part Field')).toBeInTheDocument();
    expect(screen.getByText('Select a test part')).toBeInTheDocument();
    
    // Open the popover
    await user.click(screen.getByRole('combobox'));
    
    // Check if the options are displayed
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search parts...')).toBeInTheDocument();
      expect(screen.getByText('Test Part 1 - TP-001')).toBeInTheDocument();
      expect(screen.getByText('Test Part 2 - TP-002')).toBeInTheDocument();
    });
    
    // Select an option
    await user.click(screen.getByText('Test Part 1 - TP-001'));
    
    // Check if onChange was called with the correct value
    expect(mockField.onChange).toHaveBeenCalledWith('part1');
  });
  
  test('shows loading state correctly', async () => {
    // Mock loading state
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      refetch: jest.fn(),
    });
    
    const mockField = {
      value: '',
      onChange: jest.fn(),
      control: {
        register: jest.fn(),
        unregister: jest.fn(),
        getFieldState: jest.fn(),
        _formValues: {},
        _defaultValues: {},
      },
    };
    
    render(
      <QueryClientProvider client={queryClient}>
        <PartSelector field={mockField} />
      </QueryClientProvider>
    );
    
    // Check for loading indicator
    expect(screen.getByText('Loading parts...')).toBeInTheDocument();
  });
  
  test('filters parts based on search query', async () => {
    const user = userEvent.setup();
    const mockField = {
      value: '',
      onChange: jest.fn(),
      control: {
        register: jest.fn(),
        unregister: jest.fn(),
        getFieldState: jest.fn(),
        _formValues: {},
        _defaultValues: {},
      },
    };
    
    render(
      <QueryClientProvider client={queryClient}>
        <PartSelector field={mockField} />
      </QueryClientProvider>
    );
    
    // Open the popover
    await user.click(screen.getByRole('combobox'));
    
    // Type in the search box
    const searchInput = screen.getByPlaceholderText('Search parts...');
    await user.type(searchInput, 'Test Part 2');
    
    // Check if only the matching part is displayed
    await waitFor(() => {
      expect(screen.queryByText('Test Part 1 - TP-001')).not.toBeInTheDocument();
      expect(screen.getByText('Test Part 2 - TP-002')).toBeInTheDocument();
    });
  });
  
  test('displays selected part in trigger button', async () => {
    const user = userEvent.setup();
    const mockField = {
      value: 'part1',
      onChange: jest.fn(),
      control: {
        register: jest.fn(),
        unregister: jest.fn(),
        getFieldState: jest.fn(),
        _formValues: {},
        _defaultValues: {},
      },
    };
    
    render(
      <QueryClientProvider client={queryClient}>
        <PartSelector field={mockField} />
      </QueryClientProvider>
    );
    
    // Check if the selected part is displayed in the button
    expect(screen.getByText('Test Part 1 - TP-001')).toBeInTheDocument();
  });
}); 