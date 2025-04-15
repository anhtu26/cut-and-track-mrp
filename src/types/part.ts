
export interface Part {
  id: string;
  name: string;
  partNumber: string;
  description: string;
  active: boolean;
  materials: string[];
  setupInstructions?: string;
  machiningMethods?: string;
  revisionNumber?: string;
  createdAt: string;
  updatedAt: string;
  documents: PartDocument[];
}

export interface PartDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  type: string;
}
