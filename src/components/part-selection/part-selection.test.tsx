import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PartSelection } from "./part-selection";
import * as useParts from "@/hooks/use-parts";

// Mock the useParts hook
jest.mock("@/hooks/use-parts", () => ({
  useParts: jest.fn()
}));

// Create a mock field object with the structure expected by react-hook-form
const mockField = {
  value: "",
  onChange: jest.fn(),
  onBlur: jest.fn(),
  name: "partId",
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

// Sample test data
const mockParts = [
  {
    id: "part1",
    name: "Test Part 1",
    partNumber: "TP-001",
    description: "A test part",
    active: true,
    materials: ["Aluminum"],
    customerId: "customer1"
  },
  {
    id: "part2",
    name: "Test Part 2",
    partNumber: "TP-002",
    description: "Another test part",
    active: true,
    materials: ["Steel"],
    customerId: "customer1"
  },
  {
    id: "part3",
    name: "Special Part",
    partNumber: "SP-001",
    description: "A special part",
    active: true,
    materials: ["Plastic"],
    customerId: "customer2"
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
      <PartSelection field={field} />
    </QueryClientProvider>
  );
};

describe("PartSelection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: mockParts,
      isLoading: false,
      refetch: jest.fn(),
    });
  });

  test("renders without crashing", async () => {
    renderComponent();
    expect(screen.getByText("Part")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("opens dropdown and shows all parts", async () => {
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // All parts should be visible
    await waitFor(() => {
      expect(screen.getByText("Test Part 1 - TP-001")).toBeInTheDocument();
      expect(screen.getByText("Test Part 2 - TP-002")).toBeInTheDocument();
      expect(screen.getByText("Special Part - SP-001")).toBeInTheDocument();
    });
  });

  test("filters parts with type-ahead search", async () => {
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Type in the search box
    await userEvent.type(screen.getByPlaceholderText("Search parts..."), "Special");
    
    // Only the matching part should be visible
    await waitFor(() => {
      expect(screen.getByText("Special Part - SP-001")).toBeInTheDocument();
      expect(screen.queryByText("Test Part 1 - TP-001")).not.toBeInTheDocument();
      expect(screen.queryByText("Test Part 2 - TP-002")).not.toBeInTheDocument();
    });
  });

  test("filters by part number", async () => {
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Type in the search box
    await userEvent.type(screen.getByPlaceholderText("Search parts..."), "TP-002");
    
    // Only the matching part should be visible
    await waitFor(() => {
      expect(screen.queryByText("Test Part 1 - TP-001")).not.toBeInTheDocument();
      expect(screen.getByText("Test Part 2 - TP-002")).toBeInTheDocument();
      expect(screen.queryByText("Special Part - SP-001")).not.toBeInTheDocument();
    });
  });

  test("filters by description", async () => {
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Type in the search box
    await userEvent.type(screen.getByPlaceholderText("Search parts..."), "Another");
    
    // Only the matching part should be visible
    await waitFor(() => {
      expect(screen.queryByText("Test Part 1 - TP-001")).not.toBeInTheDocument();
      expect(screen.getByText("Test Part 2 - TP-002")).toBeInTheDocument();
      expect(screen.queryByText("Special Part - SP-001")).not.toBeInTheDocument();
    });
  });

  test("selecting a part calls onChange with part ID", async () => {
    const onChange = jest.fn();
    renderComponent({ onChange });
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Select a part
    await userEvent.click(screen.getByText("Special Part - SP-001"));
    
    // onChange should be called with the part ID
    expect(onChange).toHaveBeenCalledWith("part3");
  });

  test("handles loading state correctly", async () => {
    // Mock loading state
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      refetch: jest.fn(),
    });
    
    renderComponent();
    
    // Should show loading indicator
    expect(screen.getByText("Loading parts...")).toBeInTheDocument();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Should show loading indicator in the dropdown
    await waitFor(() => {
      expect(screen.getAllByText("Loading parts...").length).toBeGreaterThan(0);
    });
  });

  test("handles empty parts array safely", async () => {
    // Mock empty response
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });
    
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Should show "No parts found"
    await waitFor(() => {
      expect(screen.getByText("No parts found")).toBeInTheDocument();
    });
  });

  test("handles undefined field gracefully", async () => {
    // Suppress expected console errors for this test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // @ts-ignore - intentionally passing invalid props to test error handling
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <PartSelection field={undefined} />
      </QueryClientProvider>
    );
    
    // Should not crash with undefined field
    expect(container).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });

  test("renders with customerId prop and filters parts", async () => {
    renderComponent();
    
    // Verify useParts was called with the proper customerId
    expect(useParts.useParts).toHaveBeenCalledWith(expect.objectContaining({
      customerId: undefined
    }));
    
    // Re-render with customerId
    (useParts.useParts as jest.Mock).mockClear();
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PartSelection field={mockField} customerId="customer1" />
      </QueryClientProvider>
    );
    
    // Verify useParts was called with the customer ID
    expect(useParts.useParts).toHaveBeenCalledWith(expect.objectContaining({
      customerId: "customer1"
    }));
  });

  test("shows previously selected part correctly", async () => {
    // Set a previously selected value
    renderComponent({ value: "part2" });
    
    // Should show the selected part
    expect(screen.getByText("Test Part 2 - TP-002")).toBeInTheDocument();
  });

  test("handles null parts in the array", async () => {
    // Mock response with null items
    (useParts.useParts as jest.Mock).mockReturnValue({
      data: [
        mockParts[0],
        null,
        mockParts[2]
      ],
      isLoading: false,
      refetch: jest.fn(),
    });
    
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Should show valid parts and handle null gracefully
    await waitFor(() => {
      expect(screen.getByText("Test Part 1 - TP-001")).toBeInTheDocument();
      expect(screen.getByText("Special Part - SP-001")).toBeInTheDocument();
      // Only 2 parts should be visible (the null one is filtered out)
      expect(screen.getAllByRole("option").length).toBe(2);
    });
  });
}); 