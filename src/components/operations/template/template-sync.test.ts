import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '@/lib/api/client';;
import { syncOperationToPartTemplate, syncOperationDocuments } from '@/lib/services/operation/template-sync-service';

// Create proper mock response types
type MockSupabaseResponse<T> = {
  data: T;
  error: null;
  count: number | null;
  status: number;
  statusText: string;
};

// Mock the Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
  },
}));

describe('Template Sync Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('syncOperationToPartTemplate', () => {
    it('should update an existing template', async () => {
      // Mock template exists
      vi.mocked(apiClient.from().select().eq().maybeSingle).mockResolvedValue({
        data: { id: 'template-123' },
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      // Mock update success
      vi.mocked(apiClient.from().update().eq).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      // Mock documents sync
      vi.mocked(apiClient.from().select().eq).mockResolvedValue({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK'
      });

      const operationId = 'op-123';
      const partId = 'part-123';
      const operationName = 'Test Operation';
      const operationData = {
        name: 'Test Operation',
        description: 'Test Description',
        machining_methods: 'Test Methods',
        setup_instructions: 'Test Instructions',
        sequence: 1
      };

      await expect(syncOperationToPartTemplate(
        operationId,
        partId,
        operationName,
        operationData
      )).resolves.not.toThrow();

      // Verify template was updated
      expect(apiClient.from).toHaveBeenCalledWith('operation_templates');
      expect(apiClient.from().update).toHaveBeenCalled();
    });

    it('should create a new template if one does not exist', async () => {
      // Mock template doesn't exist
      vi.mocked(apiClient.from().select().eq().maybeSingle).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      // Mock insert success
      vi.mocked(apiClient.from().insert).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      // Mock documents sync
      vi.mocked(apiClient.from().select().eq).mockResolvedValue({
        data: [],
        error: null,
        count: 0,
        status: 200,
        statusText: 'OK'
      });

      const operationId = 'op-123';
      const partId = 'part-123';
      const operationName = 'Test Operation';
      const operationData = {
        name: 'Test Operation',
        description: 'Test Description',
        machining_methods: 'Test Methods',
        setup_instructions: 'Test Instructions',
        sequence: 1
      };

      await expect(syncOperationToPartTemplate(
        operationId,
        partId,
        operationName,
        operationData
      )).resolves.not.toThrow();

      // Verify template was created
      expect(apiClient.from).toHaveBeenCalledWith('operation_templates');
      expect(apiClient.from().insert).toHaveBeenCalled();
    });
  });

  describe('syncOperationDocuments', () => {
    it('should sync documents from operation to template', async () => {
      // Mock template exists
      vi.mocked(apiClient.from().select().eq().maybeSingle).mockResolvedValue({
        data: { id: 'template-123' },
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      // Mock documents exist
      vi.mocked(apiClient.from().select().eq).mockResolvedValue({
        data: [
          { 
            id: 'doc-1',
            name: 'Document 1',
            url: 'https://example.com/doc1',
            type: 'pdf',
            uploaded_at: '2023-01-01T00:00:00Z',
            size: 1024
          }
        ],
        error: null,
        count: 1,
        status: 200,
        statusText: 'OK'
      });

      // Mock delete success
      vi.mocked(apiClient.from().delete().eq).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      // Mock insert success
      vi.mocked(apiClient.from().insert).mockResolvedValue({
        data: null,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      const operationId = 'op-123';
      const partId = 'part-123';
      const operationName = 'Test Operation';

      await expect(syncOperationDocuments(
        operationId,
        partId,
        operationName
      )).resolves.not.toThrow();

      // Verify documents were synced
      expect(apiClient.from).toHaveBeenCalledWith('operation_documents');
      expect(apiClient.from).toHaveBeenCalledWith('template_documents');
      expect(apiClient.from().insert).toHaveBeenCalled();
    });
  });
});
