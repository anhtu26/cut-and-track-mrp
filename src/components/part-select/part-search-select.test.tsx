import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { usePartSearch } from '@/hooks/use-part-search';
import { PartSearchSelect } from './part-search-select';
import { BrowserRouter } from 'react-router-dom';

// Mock the custom hook
jest.mock('@/hooks/use-part-search', () => ({
  usePartSearch: jest.fn(),
}));

// Mock the react-router-dom Link component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: jest.fn().mockImplementation(({ children, ...props }) => (
    <a data-testid="mock-link" {...props}>
      {children}
    </a>
  )),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Sample part data for testing
const mockParts = [
  {
    id: '1',
    name: 'Part One',
    partNumber: 'P001',
    description: 'First test part',
    customerId: '100',
  },
  {
    id: '2',
    name: 'Part Two',
    partNumber: 'P002',
    description: 'Second test part',
    customerId: '100',
  },
  {
    id: '3',
    name: 'Special Part',
    partNumber: 'SP003',
    description: 'Special test part',
    customerId: '101',
  },
];

// Helper component for testing form integration
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: {
      partId: '',
    },
  });
  
  return (
    <BrowserRouter>
      <FormProvider {...methods}>
        <form>{children}</form>
      </FormProvider>
    </BrowserRouter>
  );
};

describe('PartSearchSelect', () => {
  beforeEach(() => {
    // Default mock implementation
    (usePartSearch as jest.Mock).mockReturnValue({
      searchQuery: '',
      setSearchQuery: jest.fn(),
      filteredParts: mockParts,
      allParts: mockParts,
      isLoading: false,
      refetch: jest.fn(),
      resetSearch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(
      <BrowserRouter>
        <PartSearchSelect />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Part')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('Select a part');
  });

  it('displays loading state', () => {
    (usePartSearch as jest.Mock).mockReturnValue({
      searchQuery: '',
      setSearchQuery: jest.fn(),
      filteredParts: [],
      allParts: [],
      isLoading: true,
      refetch: jest.fn(),
      resetSearch: jest.fn(),
    });

    render(
      <BrowserRouter>
        <PartSearchSelect />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Loading parts...')).toBeInTheDocument();
  });

  it('displays the selected part', () => {
    render(
      <BrowserRouter>
        <PartSearchSelect value="1" />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Part One - P001')).toBeInTheDocument();
  });

  it('opens popover when clicked', async () => {
    render(
      <BrowserRouter>
        <PartSearchSelect />
      </BrowserRouter>
    );
    
    // Click to open popover
    fireEvent.click(screen.getByRole('combobox'));
    
    // Wait for popover to open and display search input
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search parts...')).toBeInTheDocument();
    });
    
    // Check if parts are listed
    expect(screen.getByText('Part One - P001')).toBeInTheDocument();
    expect(screen.getByText('Part Two - P002')).toBeInTheDocument();
    expect(screen.getByText('Special Part - SP003')).toBeInTheDocument();
  });

  it('filters parts based on search input', async () => {
    const mockSetSearchQuery = jest.fn();
    
    (usePartSearch as jest.Mock).mockReturnValue({
      searchQuery: 'Special',
      setSearchQuery: mockSetSearchQuery,
      filteredParts: [mockParts[2]], // Only the "Special Part"
      allParts: mockParts,
      isLoading: false,
      refetch: jest.fn(),
      resetSearch: jest.fn(),
    });

    render(
      <BrowserRouter>
        <PartSearchSelect />
      </BrowserRouter>
    );
    
    // Click to open popover
    fireEvent.click(screen.getByRole('combobox'));
    
    // Wait for popover to open
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search parts...')).toBeInTheDocument();
    });
    
    // Type into search input
    const searchInput = screen.getByPlaceholderText('Search parts...');
    fireEvent.change(searchInput, { target: { value: 'Special' } });
    
    expect(mockSetSearchQuery).toHaveBeenCalledWith('Special');
    
    // Only the special part should be visible
    expect(screen.getByText('Special Part - SP003')).toBeInTheDocument();
    expect(screen.queryByText('Part One - P001')).not.toBeInTheDocument();
  });

  it('selects a part when clicked', async () => {
    const handleSelect = jest.fn();
    
    render(
      <BrowserRouter>
        <PartSearchSelect onSelect={handleSelect} />
      </BrowserRouter>
    );
    
    // Click to open popover
    fireEvent.click(screen.getByRole('combobox'));
    
    // Wait for popover to open
    await waitFor(() => {
      expect(screen.getByText('Part One - P001')).toBeInTheDocument();
    });
    
    // Click on a part
    fireEvent.click(screen.getByText('Part One - P001'));
    
    expect(handleSelect).toHaveBeenCalledWith('1');
  });

  it('works with keyboard navigation', async () => {
    const handleSelect = jest.fn();
    const user = userEvent.setup();
    
    render(
      <BrowserRouter>
        <PartSearchSelect onSelect={handleSelect} />
      </BrowserRouter>
    );
    
    // Click to open popover
    await user.click(screen.getByRole('combobox'));
    
    // Wait for popover to open
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search parts...')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search parts...');
    
    // Press arrow down to highlight first option
    await user.type(searchInput, '{arrowdown}');
    
    // Press Enter to select the highlighted option
    await user.type(searchInput, '{enter}');
    
    expect(handleSelect).toHaveBeenCalledWith('1');
  });

  it('integrates with react-hook-form', async () => {
    render(
      <FormWrapper>
        <PartSearchSelect name="partId" />
      </FormWrapper>
    );
    
    // Check form field is rendered
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Click to open popover
    fireEvent.click(screen.getByRole('combobox'));
    
    // Wait for popover to open
    await waitFor(() => {
      expect(screen.getByText('Part One - P001')).toBeInTheDocument();
    });
    
    // Click on a part
    fireEvent.click(screen.getByText('Part One - P001'));
    
    // Part should be selected in the form
    expect(screen.getByText('Part One - P001')).toBeInTheDocument();
  });

  it('shows "Add New" button by default', () => {
    render(
      <BrowserRouter>
        <PartSearchSelect />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Add New')).toBeInTheDocument();
  });

  it('hides "Add New" button when showAddNewButton is false', () => {
    render(
      <BrowserRouter>
        <PartSearchSelect showAddNewButton={false} />
      </BrowserRouter>
    );
    
    expect(screen.queryByText('Add New')).not.toBeInTheDocument();
  });

  it('clears selection when clear button is clicked', async () => {
    const handleSelect = jest.fn();
    
    render(
      <BrowserRouter>
        <PartSearchSelect value="1" onSelect={handleSelect} />
      </BrowserRouter>
    );
    
    // Part should be displayed
    expect(screen.getByText('Part One - P001')).toBeInTheDocument();
    
    // Clear button should be visible
    const clearButton = screen.getByLabelText('Clear selection');
    expect(clearButton).toBeInTheDocument();
    
    // Click clear button
    fireEvent.click(clearButton);
    
    expect(handleSelect).toHaveBeenCalledWith('');
  });

  it('displays custom label and description', () => {
    render(
      <BrowserRouter>
        <PartSearchSelect 
          label="Custom Label" 
          description="Custom description text"
        />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });
  
  it('displays custom placeholder', () => {
    render(
      <BrowserRouter>
        <PartSearchSelect placeholder="Choose a part" />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('combobox')).toHaveTextContent('Choose a part');
  });
});
