import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PartSelectSearch } from "./work-order-part-select-search";
import { supabase } from "@/integrations/supabase/client";

// Mock Supabase client
jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  },
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
};

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
      <PartSelectSearch field={field} />
    </QueryClientProvider>
  );
};

describe("PartSelectSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful data response from Supabase
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => {
        return Promise.resolve(
          callback({
            data: [
              {
                id: "1",
                name: "Test Part",
                part_number: "TP-001",
                description: "A test part",
                active: true,
                materials: [],
                customer_id: "c1",
              },
            ],
            error: null,
          })
        );
      }),
    }));
  });

  test("renders without crashing", async () => {
    renderComponent();
    expect(screen.getByText("Part")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  test("handles clicking the dropdown and selecting a part", async () => {
    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Wait for parts to load
    await waitFor(() => {
      expect(screen.getByText("Test Part - TP-001")).toBeInTheDocument();
    });
    
    // Select a part
    await userEvent.click(screen.getByText("Test Part - TP-001"));
    
    // Check if onChange was called with correct ID
    expect(mockField.onChange).toHaveBeenCalledWith("1");
  });

  test("handles empty parts array safely", async () => {
    // Mock empty response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => {
        return Promise.resolve(
          callback({
            data: [],
            error: null,
          })
        );
      }),
    }));

    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Should show "No parts found"
    await waitFor(() => {
      expect(screen.getByText("No parts found")).toBeInTheDocument();
    });
  });

  test("handles null response from API safely", async () => {
    // Mock null response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => {
        return Promise.resolve(
          callback({
            data: null,
            error: null,
          })
        );
      }),
    }));

    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Should handle null data without crashing
    await waitFor(() => {
      expect(screen.getByText("No parts found")).toBeInTheDocument();
    });
  });

  test("handles API error gracefully", async () => {
    // Mock error response
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => {
        return Promise.resolve(
          callback({
            data: null,
            error: { message: "API error" },
          })
        );
      }),
    }));

    renderComponent();
    
    // Should not crash with API error
    expect(screen.getByText("Part")).toBeInTheDocument();
  });

  test("handles undefined field prop gracefully", async () => {
    // Suppress expected console errors for this test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // @ts-ignore - intentionally passing invalid props to test error handling
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <PartSelectSearch field={undefined} />
      </QueryClientProvider>
    );
    
    // Should not crash even with undefined field
    expect(container).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });

  test("handles malformed field object gracefully", async () => {
    // Suppress expected console errors for this test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Render with malformed field (missing control property)
    const { container } = renderComponent({ control: undefined });
    
    // Should not crash even with malformed field
    expect(container).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
    
    // Restore console.error
    (console.error as jest.Mock).mockRestore();
  });

  test("handles null/undefined parts in the list", async () => {
    // Mock response with null items
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => {
        return Promise.resolve(
          callback({
            data: [
              {
                id: "1",
                name: "Test Part",
                part_number: "TP-001"
              },
              null, // Add a null item to test handling
              undefined, // Add undefined to test handling
              {
                id: "2",
                name: undefined, // Missing name
                part_number: "TP-002"
              }
            ],
            error: null,
          })
        );
      }),
    }));

    renderComponent();
    
    // Open the dropdown
    await userEvent.click(screen.getByRole("combobox"));
    
    // Should show the valid parts and handle the null/undefined gracefully
    await waitFor(() => {
      expect(screen.getByText("Test Part - TP-001")).toBeInTheDocument();
      // Should show fallback text for the part with undefined name
      expect(screen.getByText("Unknown - TP-002")).toBeInTheDocument();
    });
  });
}); 