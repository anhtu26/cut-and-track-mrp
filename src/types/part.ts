
export interface Part {
  id: string;
  name: string;
  partNumber: string; // Mapped from part_number
  description: string;
  active: boolean;
  materials: string[];
  setupInstructions?: string; // Mapped from setup_instructions
  machiningMethods?: string; // Mapped from machining_methods
  revisionNumber?: string; // Mapped from revision_number
  createdAt: string; // Mapped from created_at
  updatedAt: string; // Mapped from updated_at
  documents: PartDocument[];
  archived: boolean;
  archivedAt?: string; // Mapped from archived_at
  archiveReason?: string; // Mapped from archive_reason
}

export interface PartDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string; // This needs to match the field in part-detail-tabs.tsx
  type: string;
}
