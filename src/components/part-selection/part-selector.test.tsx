import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PartSelector } from './part-selector';
import * as useParts from '@/hooks/use-parts';

// Mock the useParts hook
jest.mock('@/hooks/use-parts', () => ({
  useParts: jest.fn()
}));

// Create a mock field object with react-hook-form structure
const mockField = {
  value: '',
  onChange: jest.fn(),
  onBlur: jest.fn(),
  name: 'partId',
  ref: jest.fn(),
  control: {
    register: jest.fn(),
    unregister: jest.fn(),
    getFieldState: jest.fn(),
    _formValues: {},
    _defaultValues: {},
  },
  watch: jest.fn(),
};

// Test data
const mockParts = [
  {
    id: 'part1',
    name: 'Test Part 1',
    partNumber: 'TP-001',
    description: 'A test part',
    active: true,
    materials: ['Aluminum'],
    customerId: 'customer1'
  },
  {
    id: 'part2',
    name: 'Test Part 2',
    partNumber: 'TP-002',
    description: 'Another test part',
    active: true,
    materials: ['Steel'],
    customerId: 'customer1'
  },
  {
    id: 'part3',
    name: 'Special Part',
    partNumber: 'SP-001',
    description: 'A special part',
    active: true,
    materials: ['Plastic'],
    customerId: 'customer2'
  }
];

const renderComponent = (fieldOverrides = {}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const field = { ...mockField, ...fieldOverrides };

  return render(
    <QueryClientProvider client={queryClient}>
      <PartSelector field={field} />
    </QueryClientProvider>
  );
};

describe('PartSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: mockParts,
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  test('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Part')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  test('opens dropdown and shows all parts', async () => {
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole('combobox'));
    
    // Check that all parts are visible
    await waitFor(() => {
      expect(screen.getByText('Test Part 1 - TP-001')).toBeInTheDocument();
      expect(screen.getByText('Test Part 2 - TP-002')).toBeInTheDocument();
      expect(screen.getByText('Special Part - SP-001')).toBeInTheDocument();
    });
  });

  test('filters parts with inline search', async () => {
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole('combobox'));
    
    // Search for 'Special'
    await userEvent.type(screen.getByPlaceholderText('Search parts...'), 'Special');
    
    // Check filtering is working
    await waitFor(() => {
      expect(screen.getByText('Special Part - SP-001')).toBeInTheDocument();
      expect(screen.queryByText('Test Part 1 - TP-001')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Part 2 - TP-002')).not.toBeInTheDocument();
    });
  });

  test('shows loading state correctly', async () => {
    // Mock loading state
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      refetch: jest.fn(),
    });
    
    renderComponent();
    
    // Check that loading indicator is shown
    expect(screen.getByText('Loading parts...')).toBeInTheDocument();
  });

  test('handles empty parts array safely', async () => {
    // Mock empty response
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });
    
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole('combobox'));
    
    // Check that "No parts found" is shown
    await waitFor(() => {
      expect(screen.getByText('No parts found.')).toBeInTheDocument();
    });
  });

  test('handles null parts array safely', async () => {
    // Mock null response
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      refetch: jest.fn(),
    });
    
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole('combobox'));
    
    // Check that "No parts found" is shown
    await waitFor(() => {
      expect(screen.getByText('No parts found.')).toBeInTheDocument();
    });
  });

  test('handles selection of a part', async () => {
    const onChange = jest.fn();
    renderComponent({ onChange });
    
    // Open the dropdown
    await userEvent.click(screen.getByRole('combobox'));
    
    // Select a part
    await userEvent.click(screen.getByText('Special Part - SP-001'));
    
    // Check that onChange was called
    expect(onChange).toHaveBeenCalledWith('part3');
  });

  test('renders with a preselected part', async () => {
    // Mock a preselected part
    renderComponent({ value: 'part2' });
    
    // Check that the selected part is shown
    expect(screen.getByText('Test Part 2 - TP-002')).toBeInTheDocument();
  });

  test('handles error in hook gracefully', async () => {
    // Mock an error in the hook
    (useParts.useParts as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });
    
    // This shouldn't crash
    renderComponent();
  });

  test('filters by part number', async () => {
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole('combobox'));
    
    // Type in the search box
    await userEvent.type(screen.getByPlaceholderText('Search parts...'), 'TP-002');
    
    // Only the matching part should be visible
    await waitFor(() => {
      expect(screen.queryByText('Test Part 1 - TP-001')).not.toBeInTheDocument();
      expect(screen.getByText('Test Part 2 - TP-002')).toBeInTheDocument();
      expect(screen.queryByText('Special Part - SP-001')).not.toBeInTheDocument();
    });
  });

  test('handles parts with missing properties safely', async () => {
    // Parts with missing properties
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: [
        { id: 'part1' }, // Missing name and partNumber
        { id: 'part2', name: 'Test Part 2' }, // Missing partNumber
        { id: 'part3', partNumber: 'SP-001' }, // Missing name
      ],
      isLoading: false,
      refetch: jest.fn(),
    });
    
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole('combobox'));
    
    // All parts should be visible with fallback values
    await waitFor(() => {
      expect(screen.getByText('Unknown - No part number')).toBeInTheDocument();
      expect(screen.getByText('Test Part 2 - No part number')).toBeInTheDocument();
      expect(screen.getByText('Unknown - SP-001')).toBeInTheDocument();
    });
  });

  test('handles invalid field prop gracefully', () => {
    // Suppress expected console errors for this test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Render with undefined field - should not crash
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <PartSelector field={undefined} />
      </QueryClientProvider>
    );
    
    // Component should return null rather than crashing
    expect(container).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });
}); 