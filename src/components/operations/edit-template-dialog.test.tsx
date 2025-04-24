import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditTemplateDialog } from './edit-template-dialog';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import OperationService from '@/lib/services/operation/operation-service';

// Mock dependencies
vi.mock('@/components/ui/sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('@/lib/services/operation/operation-service', () => ({
  default: {
    syncOperationToPartTemplate: vi.fn()
  }
}));

// Mock fetch for work order data
global.fetch = vi.fn();

describe('EditTemplateDialog', () => {
  let queryClient: QueryClient;
  
  const mockOperation = {
    id: 'op-123',
    name: 'Test Operation',
    description: 'Test Description',
    machiningMethods: 'Test Methods',
    setupInstructions: 'Test Instructions',
    sequence: 1,
    documents: []
  };
  
  const mockWorkOrderId = 'wo-123';
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    vi.clearAllMocks();
    
    // Mock successful fetch response with proper JSON
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ part_id: 'part-123' })
    });
  });
  
  it('should handle API response parsing correctly', async () => {
    // Render component
    render(
      <QueryClientProvider client={queryClient}>
        <EditTemplateDialog
          operation={mockOperation}
          workOrderId={mockWorkOrderId}
          open={true}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>
    );
    
    // Find and click the submit button
    const submitButton = screen.getByRole('button', { name: /save as template/i });
    fireEvent.click(submitButton);
    
    // Verify fetch was called with correct URL
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/work-orders/${mockWorkOrderId}`);
    });
    
    // Verify service method was called
    await waitFor(() => {
      expect(OperationService.syncOperationToPartTemplate).toHaveBeenCalled();
    });
    
    // Verify success toast was shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });
  
  it('should handle HTML error response correctly', async () => {
    // Mock HTML error response (simulating the issue)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.reject(new SyntaxError('Unexpected token < in JSON at position 0'))
    });
    
    // Render component
    render(
      <QueryClientProvider client={queryClient}>
        <EditTemplateDialog
          operation={mockOperation}
          workOrderId={mockWorkOrderId}
          open={true}
          onOpenChange={vi.fn()}
        />
      </QueryClientProvider>
    );
    
    // Find and click the submit button
    const submitButton = screen.getByRole('button', { name: /save as template/i });
    fireEvent.click(submitButton);
    
    // Verify error toast was shown with the correct message
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Failed to save template'));
    });
  });
});
