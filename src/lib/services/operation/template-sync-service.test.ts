import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '@/lib/api/client';;
import { syncOperationToTemplate } from './template-sync-service';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Template Sync Service Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should handle missing work order gracefully', async () => {
    // Set up mock chain for first call (operations)
    const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
      data: { 
        id: 'op-123',
        work_order_id: 'e4732e6f-8eb8-45b5-a159-f5dac30ce600',
        name: 'Test Operation'
      },
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    // Set up mock chain for second call (work_orders)
    const mockMaybeSingle2 = vi.fn().mockResolvedValueOnce({
      data: null,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    });
    const mockEq2 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle2 });
    const mockSelect2 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockFrom2 = vi.fn().mockReturnValue({ select: mockSelect2 });
    
    // Replace the global mock with our specific mocks
    vi.mocked(apiClient.from)
      .mockImplementationOnce(mockFrom)
      .mockImplementationOnce(mockFrom2);

    const operationId = 'op-123';
    const operationData = {
      name: 'Test Operation',
      description: 'Test Description',
      machining_methods: 'Test Methods',
      setup_instructions: 'Test Instructions',
      sequence: 1
    };

    // This should log a warning but not throw an error
    await expect(syncOperationToTemplate(
      operationId,
      operationData
    )).resolves.not.toThrow();

    // Verify appropriate queries were made
    expect(apiClient.from).toHaveBeenCalledWith('operations');
    expect(apiClient.from).toHaveBeenCalledWith('work_orders');
  });

  it('should handle work order without part_id gracefully', async () => {
    // Set up mock chain for first call (operations)
    const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
      data: { 
        id: 'op-123',
        work_order_id: 'e4732e6f-8eb8-45b5-a159-f5dac30ce600',
        name: 'Test Operation'
      },
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    // Set up mock chain for second call (work_orders)
    const mockMaybeSingle2 = vi.fn().mockResolvedValueOnce({
      data: { 
        id: 'e4732e6f-8eb8-45b5-a159-f5dac30ce600',
        part_id: null
      },
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    });
    const mockEq2 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle2 });
    const mockSelect2 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockFrom2 = vi.fn().mockReturnValue({ select: mockSelect2 });
    
    // Replace the global mock with our specific mocks
    vi.mocked(apiClient.from)
      .mockImplementationOnce(mockFrom)
      .mockImplementationOnce(mockFrom2);

    const operationId = 'op-123';
    const operationData = {
      name: 'Test Operation',
      description: 'Test Description',
      machining_methods: 'Test Methods',
      setup_instructions: 'Test Instructions',
      sequence: 1
    };

    // This should log a warning but not throw an error
    await expect(syncOperationToTemplate(
      operationId,
      operationData
    )).resolves.not.toThrow();

    // Verify appropriate queries were made
    expect(apiClient.from).toHaveBeenCalledWith('operations');
    expect(apiClient.from).toHaveBeenCalledWith('work_orders');
  });

  it('should handle work order that exists but has no part record gracefully', async () => {
    // Set up mock chain for first call (operations)
    const mockMaybeSingle = vi.fn().mockResolvedValueOnce({
      data: { 
        id: 'op-123',
        work_order_id: 'e4732e6f-8eb8-45b5-a159-f5dac30ce600',
        name: 'Test Operation'
      },
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    });
    const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    
    // Mock work order exists but has no part_id (returns empty object)
    const mockMaybeSingle2 = vi.fn().mockResolvedValueOnce({
      data: { 
        id: 'e4732e6f-8eb8-45b5-a159-f5dac30ce600'
        // part_id is missing entirely
      },
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    });
    const mockEq2 = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle2 });
    const mockSelect2 = vi.fn().mockReturnValue({ eq: mockEq2 });
    const mockFrom2 = vi.fn().mockReturnValue({ select: mockSelect2 });
    
    // Replace the global mock with our specific mocks
    vi.mocked(apiClient.from)
      .mockImplementationOnce(mockFrom)
      .mockImplementationOnce(mockFrom2);

    const operationId = 'op-123';
    const operationData = {
      name: 'Test Operation',
      description: 'Test Description',
      machining_methods: 'Test Methods',
      setup_instructions: 'Test Instructions',
      sequence: 1
    };

    // This should log a warning but not throw an error
    await expect(syncOperationToTemplate(
      operationId,
      operationData
    )).resolves.not.toThrow();

    // Verify appropriate queries were made
    expect(apiClient.from).toHaveBeenCalledWith('operations');
    expect(apiClient.from).toHaveBeenCalledWith('work_orders');
  });
});
